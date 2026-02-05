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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appeals: {
        Row: {
          created_at: string | null
          id: string
          reason: string
          resolution_comment: string | null
          resolved_at: string | null
          resolved_by: string | null
          solution_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reason: string
          resolution_comment?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          solution_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reason?: string
          resolution_comment?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          solution_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appeals_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appeals_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appeals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          description: string
          icon: string
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Update: {
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      chat_participants: {
        Row: {
          chat_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          chat_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          chat_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string
          id: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: string
        }
        Relationships: []
      }
      game_invites: {
        Row: {
          created_at: string
          game_id: string
          id: string
          recipient_id: string
          sender_id: string
          status: string
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          recipient_id: string
          sender_id: string
          status?: string
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          recipient_id?: string
          sender_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_invites_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_invites_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_invites_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          bet_amount: number
          created_at: string
          creator_id: string
          current_turn: string | null
          game_state: Json | null
          game_type: string
          id: string
          opponent_id: string | null
          status: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          bet_amount?: number
          created_at?: string
          creator_id: string
          current_turn?: string | null
          game_state?: Json | null
          game_type: string
          id?: string
          opponent_id?: string | null
          status?: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          bet_amount?: number
          created_at?: string
          creator_id?: string
          current_turn?: string | null
          game_state?: Json | null
          game_type?: string
          id?: string
          opponent_id?: string | null
          status?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_opponent_id_fkey"
            columns: ["opponent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string
          content: string | null
          created_at: string
          file_url: string | null
          id: string
          message_type: string
          sender_id: string
        }
        Insert: {
          chat_id: string
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          message_type?: string
          sender_id: string
        }
        Update: {
          chat_id?: string
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          message_type?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_global: boolean
          is_read: boolean
          message: string
          sender_id: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_global?: boolean
          is_read?: boolean
          message: string
          sender_id?: string | null
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_global?: boolean
          is_read?: boolean
          message?: string
          sender_id?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      point_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_likes: {
        Row: {
          created_at: string
          id: string
          liked_id: string
          liker_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          liked_id: string
          liker_id: string
        }
        Update: {
          created_at?: string
          id?: string
          liked_id?: string
          liker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_likes_liked_id_fkey"
            columns: ["liked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_likes_liker_id_fkey"
            columns: ["liker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          correct_reviews: number | null
          created_at: string | null
          daily_games_count: number | null
          daily_reviews_count: number | null
          id: string
          last_activity_date: string | null
          last_game_date: string | null
          last_nickname_change: string | null
          last_review_date: string | null
          level: Database["public"]["Enums"]["user_level"] | null
          likes_received: number | null
          nickname: string
          review_balance: number | null
          reviews_completed: number | null
          streak: number | null
          total_reviews: number | null
          trust_rating: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          correct_reviews?: number | null
          created_at?: string | null
          daily_games_count?: number | null
          daily_reviews_count?: number | null
          id: string
          last_activity_date?: string | null
          last_game_date?: string | null
          last_nickname_change?: string | null
          last_review_date?: string | null
          level?: Database["public"]["Enums"]["user_level"] | null
          likes_received?: number | null
          nickname: string
          review_balance?: number | null
          reviews_completed?: number | null
          streak?: number | null
          total_reviews?: number | null
          trust_rating?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          correct_reviews?: number | null
          created_at?: string | null
          daily_games_count?: number | null
          daily_reviews_count?: number | null
          id?: string
          last_activity_date?: string | null
          last_game_date?: string | null
          last_nickname_change?: string | null
          last_review_date?: string | null
          level?: Database["public"]["Enums"]["user_level"] | null
          likes_received?: number | null
          nickname?: string
          review_balance?: number | null
          reviews_completed?: number | null
          streak?: number | null
          total_reviews?: number | null
          trust_rating?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          reviewer_id: string
          solution_id: string
          verdict: Database["public"]["Enums"]["review_verdict"]
          weight: number | null
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          reviewer_id: string
          solution_id: string
          verdict: Database["public"]["Enums"]["review_verdict"]
          weight?: number | null
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          reviewer_id?: string
          solution_id?: string
          verdict?: Database["public"]["Enums"]["review_verdict"]
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      solutions: {
        Row: {
          accepted_votes: number | null
          code: string
          created_at: string | null
          id: string
          rejected_votes: number | null
          reviews_count: number | null
          status: Database["public"]["Enums"]["solution_status"] | null
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accepted_votes?: number | null
          code: string
          created_at?: string | null
          id?: string
          rejected_votes?: number | null
          reviews_count?: number | null
          status?: Database["public"]["Enums"]["solution_status"] | null
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accepted_votes?: number | null
          code?: string
          created_at?: string | null
          id?: string
          rejected_votes?: number | null
          reviews_count?: number | null
          status?: Database["public"]["Enums"]["solution_status"] | null
          task_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solutions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solutions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          completions: number | null
          created_at: string | null
          description: string
          difficulty: Database["public"]["Enums"]["difficulty"]
          id: string
          language: Database["public"]["Enums"]["programming_language"]
          title: string
          updated_at: string | null
        }
        Insert: {
          completions?: number | null
          created_at?: string | null
          description: string
          difficulty: Database["public"]["Enums"]["difficulty"]
          id?: string
          language: Database["public"]["Enums"]["programming_language"]
          title: string
          updated_at?: string | null
        }
        Update: {
          completions?: number | null
          created_at?: string | null
          description?: string
          difficulty?: Database["public"]["Enums"]["difficulty"]
          id?: string
          language?: Database["public"]["Enums"]["programming_language"]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      topics: {
        Row: {
          author_id: string | null
          category: string | null
          content: string
          created_at: string
          description: string | null
          id: string
          is_published: boolean | null
          title: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          title: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          title?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      award_game_winner: {
        Args: { _game_id: string; _win_amount: number; _winner_id: string }
        Returns: undefined
      }
      calculate_trust_rating: {
        Args: {
          _correct_reviews: number
          _likes_received: number
          _total_reviews: number
        }
        Returns: number
      }
      deduct_game_bet: {
        Args: { _bet_amount: number; _game_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_chat_participant: {
        Args: { _chat_id: string; _user_id: string }
        Returns: boolean
      }
      is_global_chat: { Args: { _chat_id: string }; Returns: boolean }
      log_point_transaction: {
        Args: {
          _amount: number
          _description?: string
          _reference_id?: string
          _type: string
          _user_id: string
        }
        Returns: undefined
      }
      refund_game_bet: {
        Args: { _bet_amount: number; _game_id: string; _user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      difficulty: "easy" | "medium" | "hard"
      programming_language:
        | "javascript"
        | "typescript"
        | "python"
        | "html"
        | "css"
        | "java"
        | "cpp"
      review_verdict: "accepted" | "rejected"
      solution_status: "pending" | "accepted" | "rejected"
      user_level: "beginner" | "reviewer" | "expert"
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
      app_role: ["admin", "moderator", "user"],
      difficulty: ["easy", "medium", "hard"],
      programming_language: [
        "javascript",
        "typescript",
        "python",
        "html",
        "css",
        "java",
        "cpp",
      ],
      review_verdict: ["accepted", "rejected"],
      solution_status: ["pending", "accepted", "rejected"],
      user_level: ["beginner", "reviewer", "expert"],
    },
  },
} as const
