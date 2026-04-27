import { PUBLIC_DB_KEY, PUBLIC_DB_URL } from "$env/static/public";
import type { Database } from "$lib/database.types.js";
// import type { LayoutLoad } from "./$types";
import {
    createBrowserClient,
    createServerClient,
    isBrowser,
} from "@supabase/ssr";

export const load = async ({ fetch, data, depends }) => {
    depends("supabase:auth");

    const supabase = isBrowser()
        ? createBrowserClient<Database>(PUBLIC_DB_URL, PUBLIC_DB_KEY, {
              global: {
                  fetch,
              },
          })
        : createServerClient<Database>(PUBLIC_DB_URL, PUBLIC_DB_KEY, {
              global: {
                  fetch,
              },
              cookies: {
                  getAll() {
                      return data.cookies;
                  },
              },
          });

    /**
     * It's fine to use `getSession` here, because on the client, `getSession` is
     * safe, and on the server, it reads `session` from the `LayoutData`, which
     * safely checked the session using `safeGetSession`.
     */

    // console.log(data);

    // const {
    //     data: { session },
    // } = await supabase.auth.getSession();

    return { supabase, data };
};
