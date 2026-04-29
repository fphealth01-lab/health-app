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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_protocol_logs: {
        Row: {
          cache_hit: boolean
          created_at: string
          duration_ms: number | null
          error_message: string | null
          estimated_cost_usd: number
          id: string
          input_tokens: number
          model: string
          output_tokens: number
          protocol_id: string | null
          quiz_answers_hash: string | null
          status: string
          tier: string
          user_id: string | null
        }
        Insert: {
          cache_hit?: boolean
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          estimated_cost_usd?: number
          id?: string
          input_tokens?: number
          model: string
          output_tokens?: number
          protocol_id?: string | null
          quiz_answers_hash?: string | null
          status: string
          tier: string
          user_id?: string | null
        }
        Update: {
          cache_hit?: boolean
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          estimated_cost_usd?: number
          id?: string
          input_tokens?: number
          model?: string
          output_tokens?: number
          protocol_id?: string | null
          quiz_answers_hash?: string | null
          status?: string
          tier?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_protocol_logs_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_checkins: {
        Row: {
          created_at: string
          date: string
          energy_level: number
          id: string
          mood: number
          notes: string | null
          sleep_hours: number | null
          sleep_quality: number
          stress_level: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          energy_level: number
          id?: string
          mood: number
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality: number
          stress_level: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          energy_level?: number
          id?: string
          mood?: number
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number
          stress_level?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          allergies: string[]
          avatar_url: string | null
          baseline_energy: number | null
          baseline_sleep_quality: number | null
          baseline_stress: number | null
          country_code: string | null
          created_at: string
          current_supplements: string[]
          dietary_preference: string | null
          email: string
          full_name: string | null
          height_cm: number | null
          id: string
          medical_conditions: string[]
          medications: string[]
          onboarding_completed: boolean
          primary_goal: string | null
          secondary_goals: string[]
          sex: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          allergies?: string[]
          avatar_url?: string | null
          baseline_energy?: number | null
          baseline_sleep_quality?: number | null
          baseline_stress?: number | null
          country_code?: string | null
          created_at?: string
          current_supplements?: string[]
          dietary_preference?: string | null
          email: string
          full_name?: string | null
          height_cm?: number | null
          id: string
          medical_conditions?: string[]
          medications?: string[]
          onboarding_completed?: boolean
          primary_goal?: string | null
          secondary_goals?: string[]
          sex?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          allergies?: string[]
          avatar_url?: string | null
          baseline_energy?: number | null
          baseline_sleep_quality?: number | null
          baseline_stress?: number | null
          country_code?: string | null
          created_at?: string
          current_supplements?: string[]
          dietary_preference?: string | null
          email?: string
          full_name?: string | null
          height_cm?: number | null
          id?: string
          medical_conditions?: string[]
          medications?: string[]
          onboarding_completed?: boolean
          primary_goal?: string | null
          secondary_goals?: string[]
          sex?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      protocol_items: {
        Row: {
          ai_reasoning: string | null
          citations: Json
          created_at: string
          dose_mg: number
          dose_unit: string
          frequency: string
          id: string
          order_index: number
          protocol_id: string
          supplement_id: string
          timing: string
        }
        Insert: {
          ai_reasoning?: string | null
          citations?: Json
          created_at?: string
          dose_mg: number
          dose_unit?: string
          frequency?: string
          id?: string
          order_index?: number
          protocol_id: string
          supplement_id: string
          timing: string
        }
        Update: {
          ai_reasoning?: string | null
          citations?: Json
          created_at?: string
          dose_mg?: number
          dose_unit?: string
          frequency?: string
          id?: string
          order_index?: number
          protocol_id?: string
          supplement_id?: string
          timing?: string
        }
        Relationships: [
          {
            foreignKeyName: "protocol_items_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protocol_items_supplement_id_fkey"
            columns: ["supplement_id"]
            isOneToOne: false
            referencedRelation: "supplements"
            referencedColumns: ["id"]
          },
        ]
      }
      protocols: {
        Row: {
          ai_generated_at: string | null
          ai_model: string | null
          ai_reasoning: string | null
          generated_at: string
          goal: string
          id: string
          is_personalized: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generated_at?: string | null
          ai_model?: string | null
          ai_reasoning?: string | null
          generated_at?: string
          goal: string
          id?: string
          is_personalized?: boolean
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generated_at?: string | null
          ai_model?: string | null
          ai_reasoning?: string | null
          generated_at?: string
          goal?: string
          id?: string
          is_personalized?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          price_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          price_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          price_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      supplement_brands: {
        Row: {
          affiliate_url: string
          brand_name: string
          created_at: string
          id: string
          is_recommended: boolean
          price_usd: number | null
          product_name: string
          region: string
          supplement_id: string
        }
        Insert: {
          affiliate_url: string
          brand_name: string
          created_at?: string
          id?: string
          is_recommended?: boolean
          price_usd?: number | null
          product_name: string
          region: string
          supplement_id: string
        }
        Update: {
          affiliate_url?: string
          brand_name?: string
          created_at?: string
          id?: string
          is_recommended?: boolean
          price_usd?: number | null
          product_name?: string
          region?: string
          supplement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplement_brands_supplement_id_fkey"
            columns: ["supplement_id"]
            isOneToOne: false
            referencedRelation: "supplements"
            referencedColumns: ["id"]
          },
        ]
      }
      supplements: {
        Row: {
          benefits: string[]
          category: string
          citations: Json
          contraindications: string[]
          created_at: string
          dosing_high_mg: number | null
          dosing_low_mg: number | null
          dosing_unit: string
          goals_targeted: string[]
          id: string
          interactions: string[]
          long_description: string | null
          name: string
          short_description: string
          slug: string
          timing: string
        }
        Insert: {
          benefits?: string[]
          category: string
          citations?: Json
          contraindications?: string[]
          created_at?: string
          dosing_high_mg?: number | null
          dosing_low_mg?: number | null
          dosing_unit?: string
          goals_targeted?: string[]
          id?: string
          interactions?: string[]
          long_description?: string | null
          name: string
          short_description: string
          slug: string
          timing: string
        }
        Update: {
          benefits?: string[]
          category?: string
          citations?: Json
          contraindications?: string[]
          created_at?: string
          dosing_high_mg?: number | null
          dosing_low_mg?: number | null
          dosing_unit?: string
          goals_targeted?: string[]
          id?: string
          interactions?: string[]
          long_description?: string | null
          name?: string
          short_description?: string
          slug?: string
          timing?: string
        }
        Relationships: []
      }
      tracking_entries: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          protocol_item_id: string
          taken: boolean
          taken_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          protocol_item_id: string
          taken?: boolean
          taken_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          protocol_item_id?: string
          taken?: boolean
          taken_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_entries_protocol_item_id_fkey"
            columns: ["protocol_item_id"]
            isOneToOne: false
            referencedRelation: "protocol_items"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
