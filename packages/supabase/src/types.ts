export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      di_services: {
        Row: {
          content_hash: string | null;
          created_at: string;
          data: Json | null;
          di_id: string | null;
          di_structure_id: string | null;
          id: string;
          ingestion_run_id: string | null;
          raw_data: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          content_hash?: string | null;
          created_at?: string;
          data?: Json | null;
          di_id?: string | null;
          di_structure_id?: string | null;
          id?: string;
          ingestion_run_id?: string | null;
          raw_data: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          content_hash?: string | null;
          created_at?: string;
          data?: Json | null;
          di_id?: string | null;
          di_structure_id?: string | null;
          id?: string;
          ingestion_run_id?: string | null;
          raw_data?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "di_services_ingestion_run_id_fkey";
            columns: ["ingestion_run_id"];
            isOneToOne: false;
            referencedRelation: "ingestion_runs";
            referencedColumns: ["id"];
          },
        ];
      };
      di_structures: {
        Row: {
          content_hash: string | null;
          created_at: string;
          data: Json | null;
          di_id: string | null;
          id: string;
          ingestion_run_id: string | null;
          raw_data: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          content_hash?: string | null;
          created_at?: string;
          data?: Json | null;
          di_id?: string | null;
          id?: string;
          ingestion_run_id?: string | null;
          raw_data: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          content_hash?: string | null;
          created_at?: string;
          data?: Json | null;
          di_id?: string | null;
          id?: string;
          ingestion_run_id?: string | null;
          raw_data?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "di_structures_ingestion_run_id_fkey";
            columns: ["ingestion_run_id"];
            isOneToOne: false;
            referencedRelation: "ingestion_runs";
            referencedColumns: ["id"];
          },
        ];
      };
      editorial_records: {
        Row: {
          author_id: string | null;
          content_report_id: string | null;
          created_at: string;
          id: string;
          ingestion_record_id: string;
          markdown: string | null;
          metadata: Json | null;
          metadata_report_id: string | null;
          online_status: string | null;
          updated_at: string;
          work_status: string | null;
        };
        Insert: {
          author_id?: string | null;
          content_report_id?: string | null;
          created_at?: string;
          id?: string;
          ingestion_record_id: string;
          markdown?: string | null;
          metadata?: Json | null;
          metadata_report_id?: string | null;
          online_status?: string | null;
          updated_at?: string;
          work_status?: string | null;
        };
        Update: {
          author_id?: string | null;
          content_report_id?: string | null;
          created_at?: string;
          id?: string;
          ingestion_record_id?: string;
          markdown?: string | null;
          metadata?: Json | null;
          metadata_report_id?: string | null;
          online_status?: string | null;
          updated_at?: string;
          work_status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "editorial_records_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "editorial_records_content_report_id_fkey";
            columns: ["content_report_id"];
            isOneToOne: false;
            referencedRelation: "letta_reports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "editorial_records_ingestion_record_id_fkey";
            columns: ["ingestion_record_id"];
            isOneToOne: false;
            referencedRelation: "ingestion_records";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "editorial_records_metadata_report_id_fkey";
            columns: ["metadata_report_id"];
            isOneToOne: false;
            referencedRelation: "letta_reports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "editorial_records_rco_ingestion_record_id_fkey";
            columns: ["ingestion_record_id"];
            isOneToOne: false;
            referencedRelation: "ingestion_records";
            referencedColumns: ["id"];
          },
        ];
      };
      ingestion_records: {
        Row: {
          created_at: string;
          di_service_id: string | null;
          di_structure_id: string | null;
          id: string;
          ingestion_report_id: string | null;
          markdown: string;
          metadata: Json;
          origin: string;
          rco_record_id: string | null;
          updated_at: string;
          version: number | null;
        };
        Insert: {
          created_at?: string;
          di_service_id?: string | null;
          di_structure_id?: string | null;
          id?: string;
          ingestion_report_id?: string | null;
          markdown: string;
          metadata: Json;
          origin?: string;
          rco_record_id?: string | null;
          updated_at?: string;
          version?: number | null;
        };
        Update: {
          created_at?: string;
          di_service_id?: string | null;
          di_structure_id?: string | null;
          id?: string;
          ingestion_report_id?: string | null;
          markdown?: string;
          metadata?: Json;
          origin?: string;
          rco_record_id?: string | null;
          updated_at?: string;
          version?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "ingestion_records_di_service_id_fkey";
            columns: ["di_service_id"];
            isOneToOne: false;
            referencedRelation: "di_services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ingestion_records_di_service_id_fkey";
            columns: ["di_service_id"];
            isOneToOne: false;
            referencedRelation: "di_services_latest";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ingestion_records_di_structure_id_fkey";
            columns: ["di_structure_id"];
            isOneToOne: false;
            referencedRelation: "di_structures";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ingestion_records_di_structure_id_fkey";
            columns: ["di_structure_id"];
            isOneToOne: false;
            referencedRelation: "di_structures_latest";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ingestion_records_ingestion_report_id_fkey";
            columns: ["ingestion_report_id"];
            isOneToOne: false;
            referencedRelation: "letta_reports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ingestion_records_rco_record_id_fkey";
            columns: ["rco_record_id"];
            isOneToOne: false;
            referencedRelation: "rco_records";
            referencedColumns: ["id"];
          },
        ];
      };
      ingestion_runs: {
        Row: {
          completed_at: string | null;
          created_at: string;
          error_details: Json | null;
          id: string;
          options: Json | null;
          source: string;
          status: string;
          total_errors: number;
          total_fetched: number;
          total_inserted: number;
          total_unchanged: number;
          total_updated: number;
          type: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          error_details?: Json | null;
          id?: string;
          options?: Json | null;
          source: string;
          status?: string;
          total_errors?: number;
          total_fetched?: number;
          total_inserted?: number;
          total_unchanged?: number;
          total_updated?: number;
          type: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          error_details?: Json | null;
          id?: string;
          options?: Json | null;
          source?: string;
          status?: string;
          total_errors?: number;
          total_fetched?: number;
          total_inserted?: number;
          total_unchanged?: number;
          total_updated?: number;
          type?: string;
        };
        Relationships: [];
      };
      letta_reports: {
        Row: {
          agent_id: string;
          created_at: string;
          id: string;
          markdown: string;
          metadata: Json;
          raw_response: string | null;
          report_type: string;
          status: string;
          updated_at: string;
          workflow_id: string | null;
        };
        Insert: {
          agent_id: string;
          created_at?: string;
          id?: string;
          markdown: string;
          metadata: Json;
          raw_response?: string | null;
          report_type: string;
          status?: string;
          updated_at?: string;
          workflow_id?: string | null;
        };
        Update: {
          agent_id?: string;
          created_at?: string;
          id?: string;
          markdown?: string;
          metadata?: Json;
          raw_response?: string | null;
          report_type?: string;
          status?: string;
          updated_at?: string;
          workflow_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "letta_reports_workflow_id_fkey";
            columns: ["workflow_id"];
            isOneToOne: false;
            referencedRelation: "workflows";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "letta_reports_workflow_id_fkey";
            columns: ["workflow_id"];
            isOneToOne: false;
            referencedRelation: "workflows_enriched";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string | null;
          first_name: string | null;
          full_name: string | null;
          id: string;
          last_name: string | null;
          last_sign_in_at: string | null;
          role: string | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          first_name?: string | null;
          full_name?: string | null;
          id: string;
          last_name?: string | null;
          last_sign_in_at?: string | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          first_name?: string | null;
          full_name?: string | null;
          id?: string;
          last_name?: string | null;
          last_sign_in_at?: string | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      publication_records: {
        Row: {
          author_id: string | null;
          created_at: string;
          editorial_record_id: string | null;
          error_message: string | null;
          id: string;
          mode: string;
          payload: Json | null;
          published_by: string | null;
          remote_id: string;
          status: string;
          target: string;
          translation_record_id: string | null;
          updated_at: string;
          workflow_id: string;
        };
        Insert: {
          author_id?: string | null;
          created_at?: string;
          editorial_record_id?: string | null;
          error_message?: string | null;
          id?: string;
          mode?: string;
          payload?: Json | null;
          published_by?: string | null;
          remote_id: string;
          status?: string;
          target: string;
          translation_record_id?: string | null;
          updated_at?: string;
          workflow_id: string;
        };
        Update: {
          author_id?: string | null;
          created_at?: string;
          editorial_record_id?: string | null;
          error_message?: string | null;
          id?: string;
          mode?: string;
          payload?: Json | null;
          published_by?: string | null;
          remote_id?: string;
          status?: string;
          target?: string;
          translation_record_id?: string | null;
          updated_at?: string;
          workflow_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "publication_records_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "publication_records_editorial_record_id_fkey";
            columns: ["editorial_record_id"];
            isOneToOne: false;
            referencedRelation: "editorial_records";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "publication_records_published_by_fkey";
            columns: ["published_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "publication_records_translation_record_id_fkey";
            columns: ["translation_record_id"];
            isOneToOne: false;
            referencedRelation: "translation_records";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "publication_records_workflow_id_fkey";
            columns: ["workflow_id"];
            isOneToOne: false;
            referencedRelation: "workflows";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "publication_records_workflow_id_fkey";
            columns: ["workflow_id"];
            isOneToOne: false;
            referencedRelation: "workflows_enriched";
            referencedColumns: ["id"];
          },
        ];
      };
      rco_records: {
        Row: {
          created_at: string;
          id: string;
          metadata: Json;
          source_created_at: string;
          source_raw: string;
          source_updated_at: string;
          training_action_id: string;
          training_offer_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          metadata: Json;
          source_created_at: string;
          source_raw: string;
          source_updated_at: string;
          training_action_id: string;
          training_offer_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          metadata?: Json;
          source_created_at?: string;
          source_raw?: string;
          source_updated_at?: string;
          training_action_id?: string;
          training_offer_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      translation_records: {
        Row: {
          author_id: string | null;
          content_report_id: string | null;
          created_at: string;
          editorial_record_id: string;
          id: string;
          language: string;
          markdown: string | null;
          metadata: Json | null;
          metadata_report_id: string | null;
          online_status: string | null;
          updated_at: string;
          work_status: string | null;
          workflow_id: string | null;
        };
        Insert: {
          author_id?: string | null;
          content_report_id?: string | null;
          created_at?: string;
          editorial_record_id: string;
          id?: string;
          language: string;
          markdown?: string | null;
          metadata?: Json | null;
          metadata_report_id?: string | null;
          online_status?: string | null;
          updated_at?: string;
          work_status?: string | null;
          workflow_id?: string | null;
        };
        Update: {
          author_id?: string | null;
          content_report_id?: string | null;
          created_at?: string;
          editorial_record_id?: string;
          id?: string;
          language?: string;
          markdown?: string | null;
          metadata?: Json | null;
          metadata_report_id?: string | null;
          online_status?: string | null;
          updated_at?: string;
          work_status?: string | null;
          workflow_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "translation_records_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "translation_records_content_report_id_fkey";
            columns: ["content_report_id"];
            isOneToOne: false;
            referencedRelation: "letta_reports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "translation_records_editorial_record_id_fkey";
            columns: ["editorial_record_id"];
            isOneToOne: false;
            referencedRelation: "editorial_records";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "translation_records_metadata_report_id_fkey";
            columns: ["metadata_report_id"];
            isOneToOne: false;
            referencedRelation: "letta_reports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "translation_records_workflow_id_fkey";
            columns: ["workflow_id"];
            isOneToOne: false;
            referencedRelation: "workflows";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "translation_records_workflow_id_fkey";
            columns: ["workflow_id"];
            isOneToOne: false;
            referencedRelation: "workflows_enriched";
            referencedColumns: ["id"];
          },
        ];
      };
      workflows: {
        Row: {
          compliance_status: string | null;
          conversation_id: string | null;
          created_at: string;
          editorial_record_id: string | null;
          id: string;
          ingestion_record_id: string | null;
          rco_record_id: string | null;
          updated_at: string;
          vercel_hook_token: string | null;
          vercel_workflow_id: string | null;
        };
        Insert: {
          compliance_status?: string | null;
          conversation_id?: string | null;
          created_at?: string;
          editorial_record_id?: string | null;
          id?: string;
          ingestion_record_id?: string | null;
          rco_record_id?: string | null;
          updated_at?: string;
          vercel_hook_token?: string | null;
          vercel_workflow_id?: string | null;
        };
        Update: {
          compliance_status?: string | null;
          conversation_id?: string | null;
          created_at?: string;
          editorial_record_id?: string | null;
          id?: string;
          ingestion_record_id?: string | null;
          rco_record_id?: string | null;
          updated_at?: string;
          vercel_hook_token?: string | null;
          vercel_workflow_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "status_editorial_record_id_fkey";
            columns: ["editorial_record_id"];
            isOneToOne: false;
            referencedRelation: "editorial_records";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "status_ingestion_record_id_fkey";
            columns: ["ingestion_record_id"];
            isOneToOne: false;
            referencedRelation: "ingestion_records";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "status_rco_record_id_fkey";
            columns: ["rco_record_id"];
            isOneToOne: false;
            referencedRelation: "rco_records";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      di_services_latest: {
        Row: {
          content_hash: string | null;
          created_at: string | null;
          data: Json | null;
          di_id: string | null;
          di_structure_id: string | null;
          id: string | null;
          ingestion_run_id: string | null;
          raw_data: string | null;
          updated_at: string | null;
          version: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "di_services_ingestion_run_id_fkey";
            columns: ["ingestion_run_id"];
            isOneToOne: false;
            referencedRelation: "ingestion_runs";
            referencedColumns: ["id"];
          },
        ];
      };
      di_structures_latest: {
        Row: {
          content_hash: string | null;
          created_at: string | null;
          data: Json | null;
          di_id: string | null;
          id: string | null;
          ingestion_run_id: string | null;
          raw_data: string | null;
          updated_at: string | null;
          version: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "di_structures_ingestion_run_id_fkey";
            columns: ["ingestion_run_id"];
            isOneToOne: false;
            referencedRelation: "ingestion_runs";
            referencedColumns: ["id"];
          },
        ];
      };
      workflows_enriched: {
        Row: {
          author_profile: Json | null;
          compliance_status: string | null;
          computed_online_status: string | null;
          computed_work_status: string | null;
          created_at: string | null;
          editorial_author_id: string | null;
          editorial_markdown: string | null;
          editorial_metadata: Json | null;
          editorial_record_id: string | null;
          external_id: string | null;
          has_publication_history: boolean | null;
          id: string | null;
          ingestion_created_at: string | null;
          ingestion_markdown: string | null;
          ingestion_metadata: Json | null;
          ingestion_record_id: string | null;
          ingestion_report_id: string | null;
          latest_publication: Json | null;
          quality_score: number | null;
          raw_online_status: string | null;
          raw_work_status: string | null;
          rco_record_id: string | null;
          report_created_at: string | null;
          session_start_date: string | null;
          structure_name: string | null;
          title: string | null;
          updated_at: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "editorial_records_author_id_fkey";
            columns: ["editorial_author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ingestion_records_ingestion_report_id_fkey";
            columns: ["ingestion_report_id"];
            isOneToOne: false;
            referencedRelation: "letta_reports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "status_editorial_record_id_fkey";
            columns: ["editorial_record_id"];
            isOneToOne: false;
            referencedRelation: "editorial_records";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "status_ingestion_record_id_fkey";
            columns: ["ingestion_record_id"];
            isOneToOne: false;
            referencedRelation: "ingestion_records";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "status_rco_record_id_fkey";
            columns: ["rco_record_id"];
            isOneToOne: false;
            referencedRelation: "rco_records";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      claim_di_audit_targets: {
        Args: {
          max_total_pending?: number;
          p_service_ids: string[];
          timeout_interval?: string;
        };
        Returns: {
          id: string;
          markdown: string;
          workflow_id: string;
        }[];
      };
      count_di_audit_candidates: {
        Args: { p_service_ids: string[] };
        Returns: number;
      };
      get_my_language: { Args: never; Returns: string };
      get_my_role: { Args: never; Returns: string };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
