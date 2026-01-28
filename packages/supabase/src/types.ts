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
      di_structures: {
        Row: {
          created_at: string;
          data: Json | null;
          id: number;
          raw_data: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          data?: Json | null;
          id?: number;
          raw_data: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          data?: Json | null;
          id?: number;
          raw_data?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      editorial_records: {
        Row: {
          content_report_id: string | null;
          created_at: string;
          id: string;
          ingestion_record_id: string;
          markdown: string | null;
          metadata: Json | null;
          metadata_report_id: string | null;
          updated_at: string;
        };
        Insert: {
          content_report_id?: string | null;
          created_at?: string;
          id?: string;
          ingestion_record_id: string;
          markdown?: string | null;
          metadata?: Json | null;
          metadata_report_id?: string | null;
          updated_at?: string;
        };
        Update: {
          content_report_id?: string | null;
          created_at?: string;
          id?: string;
          ingestion_record_id?: string;
          markdown?: string | null;
          metadata?: Json | null;
          metadata_report_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
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
          id: string;
          ingestion_report_id: string | null;
          markdown: string;
          metadata: Json;
          rco_record_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          ingestion_report_id?: string | null;
          markdown: string;
          metadata: Json;
          rco_record_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          ingestion_report_id?: string | null;
          markdown?: string;
          metadata?: Json;
          rco_record_id?: string;
          updated_at?: string;
        };
        Relationships: [
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
        ];
      };
      publication_records: {
        Row: {
          created_at: string;
          id: string;
          payload: Json | null;
          published_by: string | null;
          remote_id: string;
          status: string;
          target: string;
          updated_at: string;
          workflow_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          payload?: Json | null;
          published_by?: string | null;
          remote_id: string;
          status?: string;
          target: string;
          updated_at?: string;
          workflow_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          payload?: Json | null;
          published_by?: string | null;
          remote_id?: string;
          status?: string;
          target?: string;
          updated_at?: string;
          workflow_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "publication_records_workflow_id_fkey";
            columns: ["workflow_id"];
            isOneToOne: false;
            referencedRelation: "workflows";
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
      workflows: {
        Row: {
          conversation_id: string | null;
          created_at: string;
          editorial_record_id: string | null;
          id: string;
          ingestion_record_id: string | null;
          progress: string;
          rco_record_id: string;
          status: string;
          updated_at: string;
          vercel_hook_token: string | null;
          vercel_workflow_id: string | null;
        };
        Insert: {
          conversation_id?: string | null;
          created_at?: string;
          editorial_record_id?: string | null;
          id?: string;
          ingestion_record_id?: string | null;
          progress: string;
          rco_record_id: string;
          status: string;
          updated_at?: string;
          vercel_hook_token?: string | null;
          vercel_workflow_id?: string | null;
        };
        Update: {
          conversation_id?: string | null;
          created_at?: string;
          editorial_record_id?: string | null;
          id?: string;
          ingestion_record_id?: string | null;
          progress?: string;
          rco_record_id?: string;
          status?: string;
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
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
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
