export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      activity_logs: {
        Row: {
          action: string
          activity: Json
          author_id: string | null
          created_at: string
          id: string
          letta_report_id: string | null
          target_profile_id: string | null
          workflow_id: string | null
        }
        Insert: {
          action: string
          activity?: Json
          author_id?: string | null
          created_at?: string
          id?: string
          letta_report_id?: string | null
          target_profile_id?: string | null
          workflow_id?: string | null
        }
        Update: {
          action?: string
          activity?: Json
          author_id?: string | null
          created_at?: string
          id?: string
          letta_report_id?: string | null
          target_profile_id?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_letta_report_id_fkey"
            columns: ["letta_report_id"]
            isOneToOne: false
            referencedRelation: "letta_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_target_profile_id_fkey"
            columns: ["target_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows_enriched"
            referencedColumns: ["id"]
          },
        ]
      }
      di_services: {
        Row: {
          content_hash: string | null
          created_at: string
          data: Json | null
          di_id: string | null
          di_structure_id: string | null
          id: string
          ingestion_run_id: string | null
          raw_data: string
          updated_at: string
          version: number
        }
        Insert: {
          content_hash?: string | null
          created_at?: string
          data?: Json | null
          di_id?: string | null
          di_structure_id?: string | null
          id?: string
          ingestion_run_id?: string | null
          raw_data: string
          updated_at?: string
          version?: number
        }
        Update: {
          content_hash?: string | null
          created_at?: string
          data?: Json | null
          di_id?: string | null
          di_structure_id?: string | null
          id?: string
          ingestion_run_id?: string | null
          raw_data?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "di_services_ingestion_run_id_fkey"
            columns: ["ingestion_run_id"]
            isOneToOne: false
            referencedRelation: "ingestion_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      di_structures: {
        Row: {
          content_hash: string | null
          created_at: string
          data: Json | null
          di_id: string | null
          id: string
          ingestion_run_id: string | null
          raw_data: string
          updated_at: string
          version: number
        }
        Insert: {
          content_hash?: string | null
          created_at?: string
          data?: Json | null
          di_id?: string | null
          id?: string
          ingestion_run_id?: string | null
          raw_data: string
          updated_at?: string
          version?: number
        }
        Update: {
          content_hash?: string | null
          created_at?: string
          data?: Json | null
          di_id?: string | null
          id?: string
          ingestion_run_id?: string | null
          raw_data?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "di_structures_ingestion_run_id_fkey"
            columns: ["ingestion_run_id"]
            isOneToOne: false
            referencedRelation: "ingestion_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      editorial_records: {
        Row: {
          active_run_id: string | null
          content_report_id: string | null
          created_at: string
          id: string
          ingestion_record_id: string
          markdown: string | null
          metadata: Json | null
          metadata_report_id: string | null
          online_status: string | null
          updated_at: string
          work_status: string | null
        }
        Insert: {
          active_run_id?: string | null
          content_report_id?: string | null
          created_at?: string
          id?: string
          ingestion_record_id: string
          markdown?: string | null
          metadata?: Json | null
          metadata_report_id?: string | null
          online_status?: string | null
          updated_at?: string
          work_status?: string | null
        }
        Update: {
          active_run_id?: string | null
          content_report_id?: string | null
          created_at?: string
          id?: string
          ingestion_record_id?: string
          markdown?: string | null
          metadata?: Json | null
          metadata_report_id?: string | null
          online_status?: string | null
          updated_at?: string
          work_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "editorial_records_content_report_id_fkey"
            columns: ["content_report_id"]
            isOneToOne: false
            referencedRelation: "letta_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "editorial_records_ingestion_record_id_fkey"
            columns: ["ingestion_record_id"]
            isOneToOne: false
            referencedRelation: "ingestion_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "editorial_records_metadata_report_id_fkey"
            columns: ["metadata_report_id"]
            isOneToOne: false
            referencedRelation: "letta_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "editorial_records_rco_ingestion_record_id_fkey"
            columns: ["ingestion_record_id"]
            isOneToOne: false
            referencedRelation: "ingestion_records"
            referencedColumns: ["id"]
          },
        ]
      }
      ingestion_records: {
        Row: {
          compliance_status: string | null
          created_at: string
          di_service_id: string | null
          di_structure_id: string | null
          id: string
          ingestion_report_id: string | null
          markdown: string
          metadata: Json
          metadata_report_id: string | null
          origin: string
          rco_record_id: string | null
          updated_at: string
          version: number | null
        }
        Insert: {
          compliance_status?: string | null
          created_at?: string
          di_service_id?: string | null
          di_structure_id?: string | null
          id?: string
          ingestion_report_id?: string | null
          markdown: string
          metadata: Json
          metadata_report_id?: string | null
          origin?: string
          rco_record_id?: string | null
          updated_at?: string
          version?: number | null
        }
        Update: {
          compliance_status?: string | null
          created_at?: string
          di_service_id?: string | null
          di_structure_id?: string | null
          id?: string
          ingestion_report_id?: string | null
          markdown?: string
          metadata?: Json
          metadata_report_id?: string | null
          origin?: string
          rco_record_id?: string | null
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ingestion_records_di_service_id_fkey"
            columns: ["di_service_id"]
            isOneToOne: false
            referencedRelation: "di_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingestion_records_di_service_id_fkey"
            columns: ["di_service_id"]
            isOneToOne: false
            referencedRelation: "di_services_latest"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingestion_records_di_structure_id_fkey"
            columns: ["di_structure_id"]
            isOneToOne: false
            referencedRelation: "di_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingestion_records_di_structure_id_fkey"
            columns: ["di_structure_id"]
            isOneToOne: false
            referencedRelation: "di_structures_latest"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingestion_records_ingestion_report_id_fkey"
            columns: ["ingestion_report_id"]
            isOneToOne: false
            referencedRelation: "letta_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingestion_records_metadata_report_id_fkey"
            columns: ["metadata_report_id"]
            isOneToOne: false
            referencedRelation: "letta_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingestion_records_rco_record_id_fkey"
            columns: ["rco_record_id"]
            isOneToOne: false
            referencedRelation: "rco_records"
            referencedColumns: ["id"]
          },
        ]
      }
      ingestion_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_details: Json | null
          id: string
          options: Json | null
          source: string
          status: string
          total_errors: number
          total_fetched: number
          total_inserted: number
          total_unchanged: number
          total_updated: number
          type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_details?: Json | null
          id?: string
          options?: Json | null
          source: string
          status?: string
          total_errors?: number
          total_fetched?: number
          total_inserted?: number
          total_unchanged?: number
          total_updated?: number
          type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_details?: Json | null
          id?: string
          options?: Json | null
          source?: string
          status?: string
          total_errors?: number
          total_fetched?: number
          total_inserted?: number
          total_unchanged?: number
          total_updated?: number
          type?: string
        }
        Relationships: []
      }
      letta_reports: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          markdown: string
          metadata: Json
          model: string | null
          raw_response: string | null
          report_type: string
          status: string
          token_cost: number | null
          updated_at: string
          workflow_id: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          markdown: string
          metadata: Json
          model?: string | null
          raw_response?: string | null
          report_type: string
          status?: string
          token_cost?: number | null
          updated_at?: string
          workflow_id?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          markdown?: string
          metadata?: Json
          model?: string | null
          raw_response?: string | null
          report_type?: string
          status?: string
          token_cost?: number | null
          updated_at?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "letta_reports_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "letta_reports_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows_enriched"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          language: string | null
          last_name: string | null
          last_sign_in_at: string | null
          role: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          language?: string | null
          last_name?: string | null
          last_sign_in_at?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          last_name?: string | null
          last_sign_in_at?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      publication_records: {
        Row: {
          author_id: string | null
          created_at: string
          editorial_record_id: string | null
          error_message: string | null
          id: string
          mode: string
          payload: Json | null
          published_by: string | null
          remote_id: string
          status: string
          target: string
          translation_record_id: string | null
          updated_at: string
          workflow_id: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          editorial_record_id?: string | null
          error_message?: string | null
          id?: string
          mode?: string
          payload?: Json | null
          published_by?: string | null
          remote_id: string
          status?: string
          target: string
          translation_record_id?: string | null
          updated_at?: string
          workflow_id: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          editorial_record_id?: string | null
          error_message?: string | null
          id?: string
          mode?: string
          payload?: Json | null
          published_by?: string | null
          remote_id?: string
          status?: string
          target?: string
          translation_record_id?: string | null
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "publication_records_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_records_editorial_record_id_fkey"
            columns: ["editorial_record_id"]
            isOneToOne: false
            referencedRelation: "editorial_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_records_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_records_translation_record_id_fkey"
            columns: ["translation_record_id"]
            isOneToOne: false
            referencedRelation: "translation_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_records_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_records_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows_enriched"
            referencedColumns: ["id"]
          },
        ]
      }
      rco_records: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          source_created_at: string
          source_raw: string
          source_updated_at: string
          training_action_id: string
          training_offer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata: Json
          source_created_at: string
          source_raw: string
          source_updated_at: string
          training_action_id: string
          training_offer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          source_created_at?: string
          source_raw?: string
          source_updated_at?: string
          training_action_id?: string
          training_offer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      translation_records: {
        Row: {
          author_id: string | null
          content_report_id: string | null
          created_at: string
          editorial_record_id: string
          id: string
          language: string
          markdown: string | null
          metadata: Json | null
          metadata_report_id: string | null
          online_status: string | null
          priority: string | null
          updated_at: string
          work_status: string | null
          workflow_id: string | null
        }
        Insert: {
          author_id?: string | null
          content_report_id?: string | null
          created_at?: string
          editorial_record_id: string
          id?: string
          language: string
          markdown?: string | null
          metadata?: Json | null
          metadata_report_id?: string | null
          online_status?: string | null
          priority?: string | null
          updated_at?: string
          work_status?: string | null
          workflow_id?: string | null
        }
        Update: {
          author_id?: string | null
          content_report_id?: string | null
          created_at?: string
          editorial_record_id?: string
          id?: string
          language?: string
          markdown?: string | null
          metadata?: Json | null
          metadata_report_id?: string | null
          online_status?: string | null
          priority?: string | null
          updated_at?: string
          work_status?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "translation_records_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "translation_records_content_report_id_fkey"
            columns: ["content_report_id"]
            isOneToOne: false
            referencedRelation: "letta_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "translation_records_editorial_record_id_fkey"
            columns: ["editorial_record_id"]
            isOneToOne: false
            referencedRelation: "editorial_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "translation_records_metadata_report_id_fkey"
            columns: ["metadata_report_id"]
            isOneToOne: false
            referencedRelation: "letta_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "translation_records_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "translation_records_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows_enriched"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          assignee_id: string | null
          conversation_id: string | null
          created_at: string
          editorial_record_id: string | null
          id: string
          ingestion_record_id: string | null
          latest_ingestion_record_id: string | null
          rco_record_id: string | null
          updated_at: string
          vercel_hook_token: string | null
          vercel_workflow_id: string | null
        }
        Insert: {
          assignee_id?: string | null
          conversation_id?: string | null
          created_at?: string
          editorial_record_id?: string | null
          id?: string
          ingestion_record_id?: string | null
          latest_ingestion_record_id?: string | null
          rco_record_id?: string | null
          updated_at?: string
          vercel_hook_token?: string | null
          vercel_workflow_id?: string | null
        }
        Update: {
          assignee_id?: string | null
          conversation_id?: string | null
          created_at?: string
          editorial_record_id?: string | null
          id?: string
          ingestion_record_id?: string | null
          latest_ingestion_record_id?: string | null
          rco_record_id?: string | null
          updated_at?: string
          vercel_hook_token?: string | null
          vercel_workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_editorial_record_id_fkey"
            columns: ["editorial_record_id"]
            isOneToOne: false
            referencedRelation: "editorial_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_ingestion_record_id_fkey"
            columns: ["ingestion_record_id"]
            isOneToOne: false
            referencedRelation: "ingestion_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_rco_record_id_fkey"
            columns: ["rco_record_id"]
            isOneToOne: false
            referencedRelation: "rco_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_latest_ingestion_record_id_fkey"
            columns: ["latest_ingestion_record_id"]
            isOneToOne: false
            referencedRelation: "ingestion_records"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      di_services_latest: {
        Row: {
          content_hash: string | null
          created_at: string | null
          data: Json | null
          di_id: string | null
          di_structure_id: string | null
          id: string | null
          ingestion_run_id: string | null
          raw_data: string | null
          updated_at: string | null
          version: number | null
        }
        Relationships: [
          {
            foreignKeyName: "di_services_ingestion_run_id_fkey"
            columns: ["ingestion_run_id"]
            isOneToOne: false
            referencedRelation: "ingestion_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      di_structures_latest: {
        Row: {
          content_hash: string | null
          created_at: string | null
          data: Json | null
          di_id: string | null
          id: string | null
          ingestion_run_id: string | null
          raw_data: string | null
          updated_at: string | null
          version: number | null
        }
        Relationships: [
          {
            foreignKeyName: "di_structures_ingestion_run_id_fkey"
            columns: ["ingestion_run_id"]
            isOneToOne: false
            referencedRelation: "ingestion_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows_enriched: {
        Row: {
          active_ingestion_version: number | null
          assignee_email: string | null
          assignee_profile: Json | null
          commune: string | null
          compliance_status: string | null
          computed_online_status: string | null
          computed_work_status: string | null
          created_at: string | null
          editorial_markdown: string | null
          editorial_metadata: Json | null
          editorial_record_id: string | null
          external_id: string | null
          has_pending_ingestion_update: boolean | null
          has_publication_history: boolean | null
          id: string | null
          ingestion_created_at: string | null
          ingestion_markdown: string | null
          ingestion_metadata: Json | null
          ingestion_record_id: string | null
          ingestion_report_id: string | null
          ingestion_word_count: number | null
          latest_ingestion_version: number | null
          latest_publication: Json | null
          modalites_entrees_sorties: string | null
          quality_score: number | null
          raw_online_status: string | null
          raw_work_status: string | null
          rco_record_id: string | null
          report_created_at: string | null
          session_end_date: string | null
          session_start_date: string | null
          structure_name: string | null
          title: string | null
          updated_at: string | null
          workflow_assignee_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingestion_records_ingestion_report_id_fkey"
            columns: ["ingestion_report_id"]
            isOneToOne: false
            referencedRelation: "letta_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_editorial_record_id_fkey"
            columns: ["editorial_record_id"]
            isOneToOne: false
            referencedRelation: "editorial_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_ingestion_record_id_fkey"
            columns: ["ingestion_record_id"]
            isOneToOne: false
            referencedRelation: "ingestion_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_rco_record_id_fkey"
            columns: ["rco_record_id"]
            isOneToOne: false
            referencedRelation: "rco_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_assignee_id_fkey"
            columns: ["workflow_assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      claim_di_audit_targets: {
        Args: {
          max_editorial_backlog?: number
          p_service_ids: string[]
          timeout_interval?: string
        }
        Returns: {
          id: string
          is_pending_update: boolean
          markdown: string
          workflow_id: string
        }[]
      }
      count_di_audit_candidates: {
        Args: { p_service_ids: string[] }
        Returns: number
      }
      get_my_language: { Args: never; Returns: string }
      get_my_role: { Args: never; Returns: string }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      update_metadata_field: {
        Args: {
          delete_key?: boolean
          field_key: string
          field_value: Json
          record_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      iceberg_namespaces: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          metadata: Json
          name: string
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_namespaces_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      iceberg_tables: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          location: string
          name: string
          namespace_id: string
          remote_table_id: string | null
          shard_id: string | null
          shard_key: string | null
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          location: string
          name: string
          namespace_id: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          namespace_id?: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_tables_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iceberg_tables_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "iceberg_namespaces"
            referencedColumns: ["id"]
          },
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
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
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const

