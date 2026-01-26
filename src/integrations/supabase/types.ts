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
      client_systems: {
        Row: {
          client_id: number | null
          created_at: string | null
          description: string | null
          environment: string | null
          host: string | null
          ip_address: string | null
          is_active: boolean | null
          system_id: number
          system_name: string
          system_type_id: number | null
          updated_at: string | null
        }
        Insert: {
          client_id?: number | null
          created_at?: string | null
          description?: string | null
          environment?: string | null
          host?: string | null
          ip_address?: string | null
          is_active?: boolean | null
          system_id?: number
          system_name: string
          system_type_id?: number | null
          updated_at?: string | null
        }
        Update: {
          client_id?: number | null
          created_at?: string | null
          description?: string | null
          environment?: string | null
          host?: string | null
          ip_address?: string | null
          is_active?: boolean | null
          system_id?: number
          system_name?: string
          system_type_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_systems_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_systems_system_type_id_fkey"
            columns: ["system_type_id"]
            isOneToOne: false
            referencedRelation: "system_types"
            referencedColumns: ["system_type_id"]
          },
        ]
      }
      clients: {
        Row: {
          client_code: string
          client_id: number
          client_name: string
          contact_email: string | null
          contact_person: string | null
          created_at: string | null
          division: string | null
          industry: string | null
          is_active: boolean | null
          notes: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          client_code: string
          client_id?: number
          client_name: string
          contact_email?: string | null
          contact_person?: string | null
          created_at?: string | null
          division?: string | null
          industry?: string | null
          is_active?: boolean | null
          notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          client_code?: string
          client_id?: number
          client_name?: string
          contact_email?: string | null
          contact_person?: string | null
          created_at?: string | null
          division?: string | null
          industry?: string | null
          is_active?: boolean | null
          notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      credential_audit: {
        Row: {
          action: string
          audit_id: number
          client_id: number | null
          credential_id: number | null
          field_copied: string | null
          ip_address: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: number | null
        }
        Insert: {
          action: string
          audit_id?: number
          client_id?: number | null
          credential_id?: number | null
          field_copied?: string | null
          ip_address?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: number | null
        }
        Update: {
          action?: string
          audit_id?: number
          client_id?: number | null
          credential_id?: number | null
          field_copied?: string | null
          ip_address?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "credential_audit_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "credential_audit_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "credential_vault"
            referencedColumns: ["credential_id"]
          },
          {
            foreignKeyName: "credential_audit_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "web_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      credential_vault: {
        Row: {
          created_at: string | null
          created_by: string | null
          credential_id: number
          credential_type: string | null
          expiry_date: string | null
          notes: string | null
          password_value: string
          system_id: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          credential_id?: number
          credential_type?: string | null
          expiry_date?: string | null
          notes?: string | null
          password_value: string
          system_id?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          credential_id?: number
          credential_type?: string | null
          expiry_date?: string | null
          notes?: string | null
          password_value?: string
          system_id?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credential_vault_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "client_systems"
            referencedColumns: ["system_id"]
          },
        ]
      }
      file_request_assignees: {
        Row: {
          assignee_id: number | null
          id: number
          request_id: number | null
          status: string | null
        }
        Insert: {
          assignee_id?: number | null
          id?: number
          request_id?: number | null
          status?: string | null
        }
        Update: {
          assignee_id?: number | null
          id?: number
          request_id?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_request_assignees_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "web_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "file_request_assignees_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "file_requests"
            referencedColumns: ["request_id"]
          },
        ]
      }
      file_requests: {
        Row: {
          created_at: string | null
          deadline: string | null
          description: string | null
          fulfilled_transfer_id: number | null
          request_id: number
          request_type: string
          requester_id: number | null
          status: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          fulfilled_transfer_id?: number | null
          request_id?: number
          request_type: string
          requester_id?: number | null
          status?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          fulfilled_transfer_id?: number | null
          request_id?: number
          request_type?: string
          requester_id?: number | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_requests_fulfilled_transfer_id_fkey"
            columns: ["fulfilled_transfer_id"]
            isOneToOne: false
            referencedRelation: "file_transfers"
            referencedColumns: ["transfer_id"]
          },
          {
            foreignKeyName: "file_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "web_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      file_transfer_recipients: {
        Row: {
          downloaded_at: string | null
          id: number
          received_at: string | null
          recipient_id: number | null
          status: string | null
          transfer_id: number | null
        }
        Insert: {
          downloaded_at?: string | null
          id?: number
          received_at?: string | null
          recipient_id?: number | null
          status?: string | null
          transfer_id?: number | null
        }
        Update: {
          downloaded_at?: string | null
          id?: number
          received_at?: string | null
          recipient_id?: number | null
          status?: string | null
          transfer_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "file_transfer_recipients_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "web_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "file_transfer_recipients_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "file_transfers"
            referencedColumns: ["transfer_id"]
          },
        ]
      }
      file_transfers: {
        Row: {
          content_url: string
          created_at: string | null
          file_size_bytes: number | null
          is_active: boolean | null
          purpose: string | null
          sender_id: number | null
          title: string
          transfer_id: number
          transfer_type: string
        }
        Insert: {
          content_url: string
          created_at?: string | null
          file_size_bytes?: number | null
          is_active?: boolean | null
          purpose?: string | null
          sender_id?: number | null
          title: string
          transfer_id?: number
          transfer_type: string
        }
        Update: {
          content_url?: string
          created_at?: string | null
          file_size_bytes?: number | null
          is_active?: boolean | null
          purpose?: string | null
          sender_id?: number | null
          title?: string
          transfer_id?: number
          transfer_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_transfers_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "web_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          is_read: boolean | null
          message: string | null
          notification_id: number
          reference_id: number | null
          reference_type: string | null
          title: string
          type: string
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          is_read?: boolean | null
          message?: string | null
          notification_id?: number
          reference_id?: number | null
          reference_type?: string | null
          title: string
          type: string
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          is_read?: boolean | null
          message?: string | null
          notification_id?: number
          reference_id?: number | null
          reference_type?: string | null
          title?: string
          type?: string
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "web_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      sql_archive: {
        Row: {
          archive_id: number
          archived_at: string | null
          query_id: number | null
          user_id: number | null
        }
        Insert: {
          archive_id?: number
          archived_at?: string | null
          query_id?: number | null
          user_id?: number | null
        }
        Update: {
          archive_id?: number
          archived_at?: string | null
          query_id?: number | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sql_archive_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "sql_queries"
            referencedColumns: ["query_id"]
          },
          {
            foreignKeyName: "sql_archive_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "web_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      sql_execution_logs: {
        Row: {
          client_id: number | null
          executed_at: string | null
          executed_by: number | null
          execution_result: string | null
          execution_time_ms: number | null
          log_id: number
          query_id: number | null
          rows_affected: number | null
          status: string | null
        }
        Insert: {
          client_id?: number | null
          executed_at?: string | null
          executed_by?: number | null
          execution_result?: string | null
          execution_time_ms?: number | null
          log_id?: number
          query_id?: number | null
          rows_affected?: number | null
          status?: string | null
        }
        Update: {
          client_id?: number | null
          executed_at?: string | null
          executed_by?: number | null
          execution_result?: string | null
          execution_time_ms?: number | null
          log_id?: number
          query_id?: number | null
          rows_affected?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sql_execution_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "sql_execution_logs_executed_by_fkey"
            columns: ["executed_by"]
            isOneToOne: false
            referencedRelation: "web_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sql_execution_logs_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "sql_queries"
            referencedColumns: ["query_id"]
          },
        ]
      }
      sql_queries: {
        Row: {
          created_at: string | null
          database_target: string | null
          is_active: boolean | null
          purpose: string | null
          query_content: string
          query_id: number
          sender_id: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          database_target?: string | null
          is_active?: boolean | null
          purpose?: string | null
          query_content: string
          query_id?: number
          sender_id?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          database_target?: string | null
          is_active?: boolean | null
          purpose?: string | null
          query_content?: string
          query_id?: number
          sender_id?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "sql_queries_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "web_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      sql_query_recipients: {
        Row: {
          executed_at: string | null
          id: number
          query_id: number | null
          received_at: string | null
          recipient_id: number | null
          status: string | null
        }
        Insert: {
          executed_at?: string | null
          id?: number
          query_id?: number | null
          received_at?: string | null
          recipient_id?: number | null
          status?: string | null
        }
        Update: {
          executed_at?: string | null
          id?: number
          query_id?: number | null
          received_at?: string | null
          recipient_id?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sql_query_recipients_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "sql_queries"
            referencedColumns: ["query_id"]
          },
          {
            foreignKeyName: "sql_query_recipients_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "web_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      sql_request_assignees: {
        Row: {
          assignee_id: number | null
          id: number
          request_id: number | null
          status: string | null
        }
        Insert: {
          assignee_id?: number | null
          id?: number
          request_id?: number | null
          status?: string | null
        }
        Update: {
          assignee_id?: number | null
          id?: number
          request_id?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sql_request_assignees_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "web_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sql_request_assignees_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "sql_requests"
            referencedColumns: ["request_id"]
          },
        ]
      }
      sql_requests: {
        Row: {
          created_at: string | null
          deadline: string | null
          description: string | null
          fulfilled_query_id: number | null
          request_id: number
          requester_id: number | null
          status: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          fulfilled_query_id?: number | null
          request_id?: number
          requester_id?: number | null
          status?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          fulfilled_query_id?: number | null
          request_id?: number
          requester_id?: number | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "sql_requests_fulfilled_query_id_fkey"
            columns: ["fulfilled_query_id"]
            isOneToOne: false
            referencedRelation: "sql_queries"
            referencedColumns: ["query_id"]
          },
          {
            foreignKeyName: "sql_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "web_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      system_types: {
        Row: {
          description: string | null
          is_active: boolean | null
          system_type_id: number
          system_type_name: string
        }
        Insert: {
          description?: string | null
          is_active?: boolean | null
          system_type_id?: number
          system_type_name: string
        }
        Update: {
          description?: string | null
          is_active?: boolean | null
          system_type_id?: number
          system_type_name?: string
        }
        Relationships: []
      }
      user_archive: {
        Row: {
          archive_id: number
          archived_at: string | null
          transfer_id: number | null
          user_id: number | null
        }
        Insert: {
          archive_id?: number
          archived_at?: string | null
          transfer_id?: number | null
          user_id?: number | null
        }
        Update: {
          archive_id?: number
          archived_at?: string | null
          transfer_id?: number | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_archive_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "file_transfers"
            referencedColumns: ["transfer_id"]
          },
          {
            foreignKeyName: "user_archive_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "web_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: number
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: number
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "web_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_storage_limits: {
        Row: {
          id: number
          storage_limit_bytes: number | null
          updated_at: string | null
          updated_by: number | null
          user_id: number | null
        }
        Insert: {
          id?: number
          storage_limit_bytes?: number | null
          updated_at?: string | null
          updated_by?: number | null
          user_id?: number | null
        }
        Update: {
          id?: number
          storage_limit_bytes?: number | null
          updated_at?: string | null
          updated_by?: number | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_storage_limits_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "web_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_storage_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "web_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      web_users: {
        Row: {
          auth_user_id: string | null
          birth_day: number
          birth_month: string
          created_at: string | null
          email: string
          first_name: string
          is_active: boolean | null
          last_name: string
          nickname: string | null
          position: Database["public"]["Enums"]["position_type"]
          updated_at: string | null
          user_id: number
        }
        Insert: {
          auth_user_id?: string | null
          birth_day: number
          birth_month: string
          created_at?: string | null
          email: string
          first_name: string
          is_active?: boolean | null
          last_name: string
          nickname?: string | null
          position?: Database["public"]["Enums"]["position_type"]
          updated_at?: string | null
          user_id?: number
        }
        Update: {
          auth_user_id?: string | null
          birth_day?: number
          birth_month?: string
          created_at?: string | null
          email?: string
          first_name?: string
          is_active?: boolean | null
          last_name?: string
          nickname?: string | null
          position?: Database["public"]["Enums"]["position_type"]
          updated_at?: string | null
          user_id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_web_user_id: { Args: { _auth_user_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "Admin" | "Manager" | "Viewer"
      credential_type:
        | "rdp"
        | "vpn"
        | "server"
        | "database"
        | "portal"
        | "other"
      environment_type: "production" | "test" | "dr" | "portal"
      position_type:
        | "MD"
        | "Management"
        | "QA"
        | "HOD"
        | "DevOps"
        | "Developer"
        | "Engineer"
        | "Senior"
        | "Junior"
        | "Trainee"
        | "NYSC"
        | "IT_Swiss"
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
      app_role: ["Admin", "Manager", "Viewer"],
      credential_type: ["rdp", "vpn", "server", "database", "portal", "other"],
      environment_type: ["production", "test", "dr", "portal"],
      position_type: [
        "MD",
        "Management",
        "QA",
        "HOD",
        "DevOps",
        "Developer",
        "Engineer",
        "Senior",
        "Junior",
        "Trainee",
        "NYSC",
        "IT_Swiss",
      ],
    },
  },
} as const
