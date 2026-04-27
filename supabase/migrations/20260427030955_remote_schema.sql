


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."math_type" AS ENUM (
    'A',
    'G',
    'N',
    'C',
    'O'
);


ALTER TYPE "public"."math_type" OWNER TO "postgres";


COMMENT ON TYPE "public"."math_type" IS 'Algebra, Geometry, Combo, Number Theory';



CREATE OR REPLACE FUNCTION "public"."get_profile_email_by_username"("p_username" "text") RETURNS TABLE("email" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT u.email
  FROM public."Profiles" p
  JOIN auth.users u ON u.id = p.id
  WHERE lower(p.username) = lower(p_username)
  LIMIT 1;
$$;


ALTER FUNCTION "public"."get_profile_email_by_username"("p_username" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."Problems" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "statement" "text" NOT NULL,
    "n" smallint NOT NULL,
    "test_id" bigint NOT NULL,
    "answer_index" smallint DEFAULT '-1'::smallint NOT NULL,
    "answers" "text"[] NOT NULL,
    "redirect" bigint,
    "is_computational" boolean DEFAULT true NOT NULL,
    "difficulty" smallint DEFAULT '0'::smallint NOT NULL,
    "quality" smallint DEFAULT '0'::smallint NOT NULL,
    "verified" boolean DEFAULT false NOT NULL,
    "aops_id" integer,
    "topic" "public"."math_type",
    "can_be_given" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."Problems" OWNER TO "postgres";


COMMENT ON COLUMN "public"."Problems"."can_be_given" IS 'References previous problem like TNYWR in relay or something else';



CREATE OR REPLACE FUNCTION "public"."get_random_problem"("target_min_diff" integer, "target_max_diff" integer, "p_user_id" "uuid") RETURNS SETOF "public"."Problems"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    found_id int;
BEGIN
    -- 1. Try to find a random unsolved problem within the range
    SELECT id INTO found_id
    FROM "Problems"
    WHERE difficulty >= target_min_diff 
      AND difficulty <= target_max_diff
      AND id NOT IN (SELECT problem_id FROM "Submissions" WHERE user_id = p_user_id)
    ORDER BY random()
    LIMIT 1;

    -- 2. Fallback: If nothing found, get the closest unsolved problem above the range
    IF found_id IS NULL THEN
        SELECT id INTO found_id
        FROM "Problems"
        WHERE difficulty > target_max_diff
          AND id NOT IN (SELECT problem_id FROM "Submissions" WHERE user_id = p_user_id)
        ORDER BY difficulty ASC, random()
        LIMIT 1;
    END IF;

    -- 3. Return the full row
    RETURN QUERY SELECT * FROM "Problems" WHERE id = found_id;
END;
$$;


ALTER FUNCTION "public"."get_random_problem"("target_min_diff" integer, "target_max_diff" integer, "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_random_problem"("target_min_diff" integer, "target_max_diff" integer, "p_user_id" "uuid", "p_limit" integer DEFAULT 1) RETURNS TABLE("id" bigint, "difficulty" smallint, "test_id" bigint, "test_name" "text", "topic" "public"."math_type", "statement" "text", "answers" "text"[], "answer_index" smallint, "aops_id" integer, "n" smallint)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    WITH available_problems AS (
        -- Changed to INNER JOIN here
        SELECT 
            p.id as p_id, 
            p.difficulty as p_diff, 
            p.test_id as p_tid, 
            p.topic,
            p.statement,
            p.answers,
            p.answer_index,
            p.n,
            p.aops_id,
            t.name as p_tname
        FROM "Problems" p
        INNER JOIN "Tests" t ON p.test_id = t.id
        WHERE p.id NOT IN (
            SELECT s.problem_id FROM "Submissions" s WHERE s.user_id = p_user_id
        )
    ),
    in_range AS (
        SELECT * FROM available_problems
        WHERE p_diff >= target_min_diff 
          AND p_diff <= target_max_diff
        ORDER BY random()
        LIMIT p_limit
    ),
    fallback AS (
        SELECT * FROM available_problems
        WHERE p_diff > target_max_diff
          AND p_id NOT IN (SELECT ir.p_id FROM in_range ir)
        ORDER BY p_diff ASC, random()
        LIMIT (p_limit - (SELECT count(*)::int FROM in_range))
    )
    SELECT 
        res.p_id::bigint as id,
        res.p_diff::smallint as difficulty,
        res.p_tid::bigint as test_id,
        res.p_tname::text as test_name,
        res.topic as topic,
        res.statement as statement,
        res.answers as answers,
        res.answer_index as answer_index,
        res.aops_id as aops_id,
        res.n as n
    FROM (
        SELECT * FROM in_range
        UNION ALL
        SELECT * FROM fallback
    ) res
    LIMIT p_limit;
END;
$$;


ALTER FUNCTION "public"."get_random_problem"("target_min_diff" integer, "target_max_diff" integer, "p_user_id" "uuid", "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public."Profiles" (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_problem_submission"("p_problem_id" integer, "p_user_attempts" integer, "p_user_time" double precision, "p_ideal_attempts" integer, "p_ideal_time" double precision) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    -- Constants
    K CONSTANT INTEGER := 40;
    
    -- Variables for Math
    current_user_rating INTEGER;
    current_prob_rating INTEGER;
    expected_perf FLOAT;
    actual_perf FLOAT;
    rating_change INTEGER;
    new_user_rating INTEGER;
    new_prob_rating INTEGER;
BEGIN
    -- 1. Fetch current ratings
    SELECT rating INTO current_user_rating FROM "Profiles" WHERE id = auth.uid();
    SELECT difficulty INTO current_prob_rating FROM "Problems" WHERE id = p_problem_id;

    -- 2. Calculate Expected Performance (Standard Elo)
    expected_perf := 1.0 / (1.0 + 10.0 ^ ((current_prob_rating - current_user_rating)::float / 400));

    -- 3. Calculate Actual Performance (Your specific logic)
    -- Time penalty: -0.2 if time > idealTime, else 0
    -- Attempt bonus/penalty: (ideal - actual) / ideal + 1
    actual_perf := (CASE WHEN p_user_time > p_ideal_time THEN -0.2 ELSE 0.0 END) +
                   (((p_ideal_attempts - p_user_attempts)::float / p_ideal_attempts::float) + 1.0);

    -- 4. Clamp Performance between -2 and 2
    actual_perf := GREATEST(LEAST(2, actual_perf), -2);

    -- 5. Calculate Change
    rating_change := FLOOR((actual_perf - expected_perf) * K);

    -- 6. Apply updates
    new_user_rating := current_user_rating + rating_change;

    -- Usually, in Elo, the problem loses what the user gains (or a version of it).
    new_prob_rating := current_prob_rating - rating_change;

    -- Optional: Cap Rating (e.g., don't let Elo go below 100)
    IF new_user_rating < 100 THEN new_user_rating := 100; END IF;

    UPDATE "Profiles" SET rating = new_user_rating WHERE id = auth.uid();
    UPDATE "Problems" SET difficulty = new_prob_rating WHERE id = p_problem_id;

    -- 7. Log the attempt
    INSERT INTO "Submissions" (user_id, problem_id, rating_diff, time, attempts)
    VALUES (auth.uid(), p_problem_id, rating_change, p_user_time, p_user_attempts);

    RETURN jsonb_build_object(
        'change', rating_change,
        'new_rating', new_user_rating,
        'expected', expected_perf,
        'actual', actual_perf
    );
END;
$$;


ALTER FUNCTION "public"."process_problem_submission"("p_problem_id" integer, "p_user_attempts" integer, "p_user_time" double precision, "p_ideal_attempts" integer, "p_ideal_time" double precision) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Hints" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "problem_id" bigint NOT NULL,
    "is_official" boolean DEFAULT false NOT NULL,
    "content" "text"[] NOT NULL
);


ALTER TABLE "public"."Hints" OWNER TO "postgres";


ALTER TABLE "public"."Hints" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Hints_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."Problems" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Problems_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."Profiles" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "confidenceInfo" smallint,
    "username" "text" DEFAULT 'what'::"text" NOT NULL,
    "rating" smallint DEFAULT '1500'::smallint NOT NULL,
    "theme" "text"
);


ALTER TABLE "public"."Profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."Profiles"."confidenceInfo" IS 'confidence type (EWMA or standard) and learning rate';



CREATE TABLE IF NOT EXISTS "public"."Series" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "is_computational" boolean DEFAULT true,
    "is_official" boolean DEFAULT true NOT NULL,
    "desc" "text"
);


ALTER TABLE "public"."Series" OWNER TO "postgres";


COMMENT ON TABLE "public"."Series" IS 'Root Contest ie (AMC10, AIME, etc). types';



ALTER TABLE "public"."Series" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Series_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."Solutions" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "content" "text" NOT NULL,
    "problem_id" bigint NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"()
);


ALTER TABLE "public"."Solutions" OWNER TO "postgres";


COMMENT ON TABLE "public"."Solutions" IS 'Problem Solutions';



ALTER TABLE "public"."Solutions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Solutions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."Submissions" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "problem_id" bigint NOT NULL,
    "confidence" smallint,
    "status" smallint DEFAULT '0'::smallint NOT NULL,
    "attempts" smallint DEFAULT '0'::smallint NOT NULL,
    "time" integer NOT NULL,
    "rating_diff" smallint NOT NULL
);


ALTER TABLE "public"."Submissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."Submissions" IS 'user problem history data';



COMMENT ON COLUMN "public"."Submissions"."status" IS 'Status (NA, Solving, Solved, Reviewing, Skipped, Ignored)';



COMMENT ON COLUMN "public"."Submissions"."time" IS 'Time in seconds';



ALTER TABLE "public"."Submissions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Submissions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."TagProblems" (
    "id" bigint NOT NULL,
    "tag_id" bigint NOT NULL,
    "problem_id" bigint NOT NULL
);


ALTER TABLE "public"."TagProblems" OWNER TO "postgres";


ALTER TABLE "public"."TagProblems" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."TagProblems_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."TagSeries" (
    "id" bigint NOT NULL,
    "series_id" bigint NOT NULL,
    "tag_id" bigint NOT NULL
);


ALTER TABLE "public"."TagSeries" OWNER TO "postgres";


ALTER TABLE "public"."TagSeries" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."TagSeries_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."TagTests" (
    "id" bigint NOT NULL,
    "tag_id" bigint NOT NULL,
    "test_id" bigint NOT NULL
);


ALTER TABLE "public"."TagTests" OWNER TO "postgres";


ALTER TABLE "public"."TagTests" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."TagTests_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."Tags" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "statement" "text" DEFAULT ''::"text" NOT NULL,
    "popularity" smallint DEFAULT '0'::smallint NOT NULL
);


ALTER TABLE "public"."Tags" OWNER TO "postgres";


ALTER TABLE "public"."Tags" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Tags_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."Tests" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "series" bigint NOT NULL,
    "year" smallint,
    "links" "text"[],
    "quality" smallint DEFAULT '0'::smallint NOT NULL,
    "difficulty" smallint DEFAULT '0'::smallint NOT NULL,
    "user_id" "uuid",
    "aops_id" integer,
    "mock_type" "text",
    "name" "text" NOT NULL,
    "is_computational" boolean NOT NULL,
    CONSTRAINT "Tests_name_check" CHECK (("length"("name") < 50)),
    CONSTRAINT "check_type" CHECK (("mock_type" = ANY (ARRAY['AMC'::"text", 'AMC 8'::"text", 'AIME'::"text", 'ARML'::"text", 'College Comp'::"text", ''::"text"])))
);


ALTER TABLE "public"."Tests" OWNER TO "postgres";


COMMENT ON COLUMN "public"."Tests"."mock_type" IS 'mock type (AIME, AMC 10, AMC 12, etc)';



ALTER TABLE "public"."Tests" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Tests_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."Hints"
    ADD CONSTRAINT "Hints_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Problems"
    ADD CONSTRAINT "Problems_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Profiles"
    ADD CONSTRAINT "Profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Profiles"
    ADD CONSTRAINT "Profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."Series"
    ADD CONSTRAINT "Series_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Solutions"
    ADD CONSTRAINT "Solutions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Submissions"
    ADD CONSTRAINT "Submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."TagProblems"
    ADD CONSTRAINT "TagProblems_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."TagSeries"
    ADD CONSTRAINT "TagSeries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."TagSeries"
    ADD CONSTRAINT "TagSeries_tag_series_unique" UNIQUE ("tag_id", "series_id");



ALTER TABLE ONLY "public"."TagTests"
    ADD CONSTRAINT "TagTests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Tags"
    ADD CONSTRAINT "Tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Tags"
    ADD CONSTRAINT "Tags_statement_key" UNIQUE ("statement");



ALTER TABLE ONLY "public"."Tests"
    ADD CONSTRAINT "Tests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Hints"
    ADD CONSTRAINT "Hints_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."Problems"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Hints"
    ADD CONSTRAINT "Hints_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."Problems"
    ADD CONSTRAINT "Problems_redirect_fkey" FOREIGN KEY ("redirect") REFERENCES "public"."Problems"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Problems"
    ADD CONSTRAINT "Problems_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "public"."Tests"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Profiles"
    ADD CONSTRAINT "Profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Solutions"
    ADD CONSTRAINT "Solutions_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."Problems"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Solutions"
    ADD CONSTRAINT "Solutions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."Submissions"
    ADD CONSTRAINT "Submissions_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."Problems"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Submissions"
    ADD CONSTRAINT "Submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."TagProblems"
    ADD CONSTRAINT "TagProblems_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."Problems"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."TagProblems"
    ADD CONSTRAINT "TagProblems_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."Tags"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."TagSeries"
    ADD CONSTRAINT "TagSeries_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "public"."Series"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."TagSeries"
    ADD CONSTRAINT "TagSeries_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."Tags"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."TagTests"
    ADD CONSTRAINT "TagTests_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."Tags"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."TagTests"
    ADD CONSTRAINT "TagTests_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "public"."Tests"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Tests"
    ADD CONSTRAINT "Tests_series_fkey" FOREIGN KEY ("series") REFERENCES "public"."Series"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Tests"
    ADD CONSTRAINT "Tests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE SET NULL;



CREATE POLICY "Enable authenticated users to read" ON "public"."Problems" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable insert for users based on user_id" ON "public"."Profiles" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Enable read access for all auth users" ON "public"."Tests" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all authenticated users" ON "public"."Series" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."Profiles" FOR SELECT USING (true);



CREATE POLICY "Enable users to view their own data only" ON "public"."Submissions" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."Hints" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Problems" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Series" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Solutions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."TagProblems" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."TagSeries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."TagTests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Tests" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."get_profile_email_by_username"("p_username" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_profile_email_by_username"("p_username" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profile_email_by_username"("p_username" "text") TO "service_role";



GRANT ALL ON TABLE "public"."Problems" TO "anon";
GRANT ALL ON TABLE "public"."Problems" TO "authenticated";
GRANT ALL ON TABLE "public"."Problems" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_random_problem"("target_min_diff" integer, "target_max_diff" integer, "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_random_problem"("target_min_diff" integer, "target_max_diff" integer, "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_random_problem"("target_min_diff" integer, "target_max_diff" integer, "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_random_problem"("target_min_diff" integer, "target_max_diff" integer, "p_user_id" "uuid", "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_random_problem"("target_min_diff" integer, "target_max_diff" integer, "p_user_id" "uuid", "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_random_problem"("target_min_diff" integer, "target_max_diff" integer, "p_user_id" "uuid", "p_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."process_problem_submission"("p_problem_id" integer, "p_user_attempts" integer, "p_user_time" double precision, "p_ideal_attempts" integer, "p_ideal_time" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."process_problem_submission"("p_problem_id" integer, "p_user_attempts" integer, "p_user_time" double precision, "p_ideal_attempts" integer, "p_ideal_time" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_problem_submission"("p_problem_id" integer, "p_user_attempts" integer, "p_user_time" double precision, "p_ideal_attempts" integer, "p_ideal_time" double precision) TO "service_role";


















GRANT ALL ON TABLE "public"."Hints" TO "anon";
GRANT ALL ON TABLE "public"."Hints" TO "authenticated";
GRANT ALL ON TABLE "public"."Hints" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Hints_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Hints_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Hints_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Problems_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Problems_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Problems_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."Profiles" TO "anon";
GRANT ALL ON TABLE "public"."Profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."Profiles" TO "service_role";



GRANT ALL ON TABLE "public"."Series" TO "anon";
GRANT ALL ON TABLE "public"."Series" TO "authenticated";
GRANT ALL ON TABLE "public"."Series" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Series_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Series_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Series_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."Solutions" TO "anon";
GRANT ALL ON TABLE "public"."Solutions" TO "authenticated";
GRANT ALL ON TABLE "public"."Solutions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Solutions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Solutions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Solutions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."Submissions" TO "anon";
GRANT ALL ON TABLE "public"."Submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."Submissions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Submissions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Submissions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Submissions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."TagProblems" TO "anon";
GRANT ALL ON TABLE "public"."TagProblems" TO "authenticated";
GRANT ALL ON TABLE "public"."TagProblems" TO "service_role";



GRANT ALL ON SEQUENCE "public"."TagProblems_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."TagProblems_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."TagProblems_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."TagSeries" TO "anon";
GRANT ALL ON TABLE "public"."TagSeries" TO "authenticated";
GRANT ALL ON TABLE "public"."TagSeries" TO "service_role";



GRANT ALL ON SEQUENCE "public"."TagSeries_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."TagSeries_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."TagSeries_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."TagTests" TO "anon";
GRANT ALL ON TABLE "public"."TagTests" TO "authenticated";
GRANT ALL ON TABLE "public"."TagTests" TO "service_role";



GRANT ALL ON SEQUENCE "public"."TagTests_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."TagTests_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."TagTests_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."Tags" TO "anon";
GRANT ALL ON TABLE "public"."Tags" TO "authenticated";
GRANT ALL ON TABLE "public"."Tags" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Tags_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Tags_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Tags_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."Tests" TO "anon";
GRANT ALL ON TABLE "public"."Tests" TO "authenticated";
GRANT ALL ON TABLE "public"."Tests" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Tests_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Tests_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Tests_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


