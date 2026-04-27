export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      Hints: {
        Row: {
          content: string[]
          created_at: string
          id: number
          is_official: boolean
          problem_id: number
          user_id: string
        }
        Insert: {
          content: string[]
          created_at?: string
          id?: number
          is_official?: boolean
          problem_id: number
          user_id?: string
        }
        Update: {
          content?: string[]
          created_at?: string
          id?: number
          is_official?: boolean
          problem_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Hints_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "Problems"
            referencedColumns: ["id"]
          },
        ]
      }
      Problems: {
        Row: {
          answer_index: number
          answers: string[]
          aops_id: number | null
          can_be_given: boolean
          created_at: string
          difficulty: number
          id: number
          is_computational: boolean
          n: number
          quality: number
          redirect: number | null
          statement: string
          test_id: number
          topic: Database["public"]["Enums"]["math_type"] | null
          verified: boolean
        }
        Insert: {
          answer_index?: number
          answers: string[]
          aops_id?: number | null
          can_be_given?: boolean
          created_at?: string
          difficulty?: number
          id?: number
          is_computational?: boolean
          n: number
          quality?: number
          redirect?: number | null
          statement: string
          test_id: number
          topic?: Database["public"]["Enums"]["math_type"] | null
          verified?: boolean
        }
        Update: {
          answer_index?: number
          answers?: string[]
          aops_id?: number | null
          can_be_given?: boolean
          created_at?: string
          difficulty?: number
          id?: number
          is_computational?: boolean
          n?: number
          quality?: number
          redirect?: number | null
          statement?: string
          test_id?: number
          topic?: Database["public"]["Enums"]["math_type"] | null
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "Problems_redirect_fkey"
            columns: ["redirect"]
            isOneToOne: false
            referencedRelation: "Problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Problems_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "Tests"
            referencedColumns: ["id"]
          },
        ]
      }
      Profiles: {
        Row: {
          confidenceInfo: number | null
          created_at: string
          id: string
          rating: number
          theme: string | null
          username: string
        }
        Insert: {
          confidenceInfo?: number | null
          created_at?: string
          id: string
          rating?: number
          theme?: string | null
          username?: string
        }
        Update: {
          confidenceInfo?: number | null
          created_at?: string
          id?: string
          rating?: number
          theme?: string | null
          username?: string
        }
        Relationships: []
      }
      Series: {
        Row: {
          created_at: string
          desc: string | null
          id: number
          is_computational: boolean | null
          is_official: boolean
          name: string
        }
        Insert: {
          created_at?: string
          desc?: string | null
          id?: number
          is_computational?: boolean | null
          is_official?: boolean
          name: string
        }
        Update: {
          created_at?: string
          desc?: string | null
          id?: number
          is_computational?: boolean | null
          is_official?: boolean
          name?: string
        }
        Relationships: []
      }
      Solutions: {
        Row: {
          content: string
          created_at: string
          id: number
          problem_id: number
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          problem_id: number
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          problem_id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Solutions_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "Problems"
            referencedColumns: ["id"]
          },
        ]
      }
      Submissions: {
        Row: {
          attempts: number
          confidence: number | null
          created_at: string
          id: number
          problem_id: number
          rating_diff: number
          status: number
          time: number
          user_id: string
        }
        Insert: {
          attempts?: number
          confidence?: number | null
          created_at?: string
          id?: number
          problem_id: number
          rating_diff: number
          status?: number
          time: number
          user_id: string
        }
        Update: {
          attempts?: number
          confidence?: number | null
          created_at?: string
          id?: number
          problem_id?: number
          rating_diff?: number
          status?: number
          time?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Submissions_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "Problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      TagProblems: {
        Row: {
          id: number
          problem_id: number
          tag_id: number
        }
        Insert: {
          id?: number
          problem_id: number
          tag_id: number
        }
        Update: {
          id?: number
          problem_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "TagProblems_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "Problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "TagProblems_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "Tags"
            referencedColumns: ["id"]
          },
        ]
      }
      Tags: {
        Row: {
          created_at: string
          id: number
          popularity: number
          statement: string
        }
        Insert: {
          created_at?: string
          id?: number
          popularity?: number
          statement?: string
        }
        Update: {
          created_at?: string
          id?: number
          popularity?: number
          statement?: string
        }
        Relationships: []
      }
      TagSeries: {
        Row: {
          id: number
          series_id: number
          tag_id: number
        }
        Insert: {
          id?: number
          series_id: number
          tag_id: number
        }
        Update: {
          id?: number
          series_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "TagSeries_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "Series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "TagSeries_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "Tags"
            referencedColumns: ["id"]
          },
        ]
      }
      TagTests: {
        Row: {
          id: number
          tag_id: number
          test_id: number
        }
        Insert: {
          id?: number
          tag_id: number
          test_id: number
        }
        Update: {
          id?: number
          tag_id?: number
          test_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "TagTests_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "Tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "TagTests_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "Tests"
            referencedColumns: ["id"]
          },
        ]
      }
      Tests: {
        Row: {
          aops_id: number | null
          created_at: string
          difficulty: number
          id: number
          is_computational: boolean
          links: string[] | null
          mock_type: string | null
          name: string
          quality: number
          series: number
          user_id: string | null
          year: number | null
        }
        Insert: {
          aops_id?: number | null
          created_at?: string
          difficulty?: number
          id?: number
          is_computational: boolean
          links?: string[] | null
          mock_type?: string | null
          name: string
          quality?: number
          series: number
          user_id?: string | null
          year?: number | null
        }
        Update: {
          aops_id?: number | null
          created_at?: string
          difficulty?: number
          id?: number
          is_computational?: boolean
          links?: string[] | null
          mock_type?: string | null
          name?: string
          quality?: number
          series?: number
          user_id?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Tests_series_fkey"
            columns: ["series"]
            isOneToOne: false
            referencedRelation: "Series"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_profile_email_by_username: {
        Args: { p_username: string }
        Returns: {
          email: string
        }[]
      }
      get_random_problem:
        | {
            Args: {
              p_user_id: string
              target_max_diff: number
              target_min_diff: number
            }
            Returns: {
              answer_index: number
              answers: string[]
              aops_id: number | null
              can_be_given: boolean
              created_at: string
              difficulty: number
              id: number
              is_computational: boolean
              n: number
              quality: number
              redirect: number | null
              statement: string
              test_id: number
              topic: Database["public"]["Enums"]["math_type"] | null
              verified: boolean
            }[]
            SetofOptions: {
              from: "*"
              to: "Problems"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: {
              p_limit?: number
              p_user_id: string
              target_max_diff: number
              target_min_diff: number
            }
            Returns: {
              answer_index: number
              answers: string[]
              aops_id: number
              difficulty: number
              id: number
              n: number
              statement: string
              test_id: number
              test_name: string
              topic: Database["public"]["Enums"]["math_type"]
            }[]
          }
      process_problem_submission: {
        Args: {
          p_ideal_attempts: number
          p_ideal_time: number
          p_problem_id: number
          p_user_attempts: number
          p_user_time: number
        }
        Returns: Json
      }
    }
    Enums: {
      math_type: "A" | "G" | "N" | "C" | "O"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      math_type: ["A", "G", "N", "C", "O"],
    },
  },
} as const
