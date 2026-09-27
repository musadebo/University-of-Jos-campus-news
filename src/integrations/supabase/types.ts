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
  public: {
    Tables: {
      announcements: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          faculty: string | null
          id: string
          priority: string
          publish_at: string
          published: boolean
          title: string
        }
        Insert: {
          author_id?: string | null
          body?: string
          created_at?: string
          faculty?: string | null
          id?: string
          priority?: string
          publish_at?: string
          published?: boolean
          title: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          faculty?: string | null
          id?: string
          priority?: string
          publish_at?: string
          published?: boolean
          title?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          capacity: number
          category: string
          created_at: string
          description: string
          ends_at: string | null
          id: string
          image_url: string | null
          organizer_id: string | null
          starts_at: string
          status: string
          title: string
          updated_at: string
          venue: string
        }
        Insert: {
          capacity?: number
          category?: string
          created_at?: string
          description?: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          organizer_id?: string | null
          starts_at: string
          status?: string
          title: string
          updated_at?: string
          venue?: string
        }
        Update: {
          capacity?: number
          category?: string
          created_at?: string
          description?: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          organizer_id?: string | null
          starts_at?: string
          status?: string
          title?: string
          updated_at?: string
          venue?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          author_id: string | null
          body: string
          category: string
          created_at: string
          excerpt: string
          id: string
          image_url: string | null
          published: boolean
          published_at: string
          read_minutes: number
          slug: string
          title: string
        }
        Insert: {
          author_id?: string | null
          body?: string
          category?: string
          created_at?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          published?: boolean
          published_at?: string
          read_minutes?: number
          slug: string
          title: string
        }
        Update: {
          author_id?: string | null
          body?: string
          category?: string
          created_at?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          published?: boolean
          published_at?: string
          read_minutes?: number
          slug?: string
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          kind: string
          link: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cover_url: string | null
          created_at: string
          faculty: string | null
          full_name: string
          id: string
          matric_no: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          cover_url?: string | null
          created_at?: string
          faculty?: string | null
          full_name?: string
          id: string
          matric_no?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          cover_url?: string | null
          created_at?: string
          faculty?: string | null
          full_name?: string
          id?: string
          matric_no?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          checked_in_at: string | null
          created_at: string
          event_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          checked_in_at?: string | null
          created_at?: string
          event_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          checked_in_at?: string | null
          created_at?: string
          event_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      register_for_event: {
        Args: { p_event_id: string }
        Returns: {
          checked_in_at: string | null
          created_at: string
          event_id: string
          id: string
          status: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "registrations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_attendance: {
        Args: { p_checked_in: boolean; p_registration_id: string }
        Returns: {
          checked_in_at: string | null
          created_at: string
          event_id: string
          id: string
          status: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "registrations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "student" | "organizer" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["student", "organizer", "admin"],
    },
  },
} as const
