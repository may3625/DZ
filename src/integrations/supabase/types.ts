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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      administrative_procedures: {
        Row: {
          category: string | null
          cost: string | null
          created_at: string
          created_by: string
          description: string | null
          difficulty: string | null
          duration: string | null
          id: string
          institution: string | null
          required_documents: string[] | null
          steps: Json[] | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cost?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          difficulty?: string | null
          duration?: string | null
          id?: string
          institution?: string | null
          required_documents?: string[] | null
          steps?: Json[] | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cost?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          difficulty?: string | null
          duration?: string | null
          id?: string
          institution?: string | null
          required_documents?: string[] | null
          steps?: Json[] | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      annotations: {
        Row: {
          created_at: string
          id: string
          legal_text_id: string
          note: string | null
          range: Json | null
          user_id: string
          visibility:
            | Database["public"]["Enums"]["annotation_visibility"]
            | null
        }
        Insert: {
          created_at?: string
          id?: string
          legal_text_id: string
          note?: string | null
          range?: Json | null
          user_id: string
          visibility?:
            | Database["public"]["Enums"]["annotation_visibility"]
            | null
        }
        Update: {
          created_at?: string
          id?: string
          legal_text_id?: string
          note?: string | null
          range?: Json | null
          user_id?: string
          visibility?:
            | Database["public"]["Enums"]["annotation_visibility"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "annotations_legal_text_id_fkey"
            columns: ["legal_text_id"]
            isOneToOne: false
            referencedRelation: "legal_texts"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_history: {
        Row: {
          action: string
          actor_id: string | null
          approval_item_id: string | null
          comment: string | null
          created_at: string
          id: string
          metadata: Json | null
          new_status: Database["public"]["Enums"]["validation_status"] | null
          previous_status:
            | Database["public"]["Enums"]["validation_status"]
            | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          approval_item_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status?: Database["public"]["Enums"]["validation_status"] | null
          previous_status?:
            | Database["public"]["Enums"]["validation_status"]
            | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          approval_item_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status?: Database["public"]["Enums"]["validation_status"] | null
          previous_status?:
            | Database["public"]["Enums"]["validation_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_history_approval_item_id_fkey"
            columns: ["approval_item_id"]
            isOneToOne: false
            referencedRelation: "approval_items"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_items: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          assigned_to: string | null
          created_at: string
          data: Json
          description: string | null
          due_date: string | null
          id: string
          item_type: string
          legal_text_id: string | null
          modification_notes: string | null
          original_data: Json | null
          priority: Database["public"]["Enums"]["approval_priority"]
          rejection_reason: string | null
          status: Database["public"]["Enums"]["validation_status"]
          submitted_by: string | null
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string | null
          created_at?: string
          data: Json
          description?: string | null
          due_date?: string | null
          id?: string
          item_type: string
          legal_text_id?: string | null
          modification_notes?: string | null
          original_data?: Json | null
          priority?: Database["public"]["Enums"]["approval_priority"]
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["validation_status"]
          submitted_by?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string | null
          created_at?: string
          data?: Json
          description?: string | null
          due_date?: string | null
          id?: string
          item_type?: string
          legal_text_id?: string | null
          modification_notes?: string | null
          original_data?: Json | null
          priority?: Database["public"]["Enums"]["approval_priority"]
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["validation_status"]
          submitted_by?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_items_legal_text_id_fkey"
            columns: ["legal_text_id"]
            isOneToOne: false
            referencedRelation: "legal_texts"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          assignee_id: string
          checklist_id: string | null
          created_at: string
          due_date: string | null
          id: string
          item_id: string | null
          status: string
        }
        Insert: {
          assignee_id: string
          checklist_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          item_id?: string | null
          status?: string
        }
        Update: {
          assignee_id?: string
          checklist_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          item_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          diff: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          diff?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          diff?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          assignee_id: string | null
          checklist_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          position: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          checklist_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          checklist_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      classifications: {
        Row: {
          contradiction_group_id: string | null
          domains: string[]
          id: string
          keywords: string[]
          legal_text_id: string
        }
        Insert: {
          contradiction_group_id?: string | null
          domains?: string[]
          id?: string
          keywords?: string[]
          legal_text_id: string
        }
        Update: {
          contradiction_group_id?: string | null
          domains?: string[]
          id?: string
          keywords?: string[]
          legal_text_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "classifications_legal_text_id_fkey"
            columns: ["legal_text_id"]
            isOneToOne: false
            referencedRelation: "legal_texts"
            referencedColumns: ["id"]
          },
        ]
      }
      embeddings: {
        Row: {
          created_at: string
          id: string
          legal_text_id: string
          model: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          legal_text_id: string
          model?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          legal_text_id?: string
          model?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "embeddings_legal_text_id_fkey"
            columns: ["legal_text_id"]
            isOneToOne: false
            referencedRelation: "legal_texts"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string
          finished_at: string | null
          id: string
          log: string | null
          source_id: string | null
          started_at: string | null
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          finished_at?: string | null
          id?: string
          log?: string | null
          source_id?: string | null
          started_at?: string | null
          status?: string
          type: string
        }
        Update: {
          created_at?: string
          finished_at?: string | null
          id?: string
          log?: string | null
          source_id?: string | null
          started_at?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_text_versions: {
        Row: {
          content_md: string | null
          content_plain: string | null
          created_at: string
          file_path: string | null
          id: string
          legal_text_id: string
          version_no: number
        }
        Insert: {
          content_md?: string | null
          content_plain?: string | null
          created_at?: string
          file_path?: string | null
          id?: string
          legal_text_id: string
          version_no: number
        }
        Update: {
          content_md?: string | null
          content_plain?: string | null
          created_at?: string
          file_path?: string | null
          id?: string
          legal_text_id?: string
          version_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "legal_text_versions_legal_text_id_fkey"
            columns: ["legal_text_id"]
            isOneToOne: false
            referencedRelation: "legal_texts"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_texts: {
        Row: {
          archived_at: string | null
          category: string | null
          content: string | null
          created_at: string
          created_by: string | null
          date: string | null
          description: string | null
          hash: string | null
          id: string
          language: string | null
          metadata: Json | null
          obsolete: boolean
          sector: string | null
          source_id: string | null
          status: string | null
          title: string | null
          updated_at: string
          url: string | null
          wilaya_code: string | null
        }
        Insert: {
          archived_at?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          date?: string | null
          description?: string | null
          hash?: string | null
          id?: string
          language?: string | null
          metadata?: Json | null
          obsolete?: boolean
          sector?: string | null
          source_id?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string
          url?: string | null
          wilaya_code?: string | null
        }
        Update: {
          archived_at?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          date?: string | null
          description?: string | null
          hash?: string | null
          id?: string
          language?: string | null
          metadata?: Json | null
          obsolete?: boolean
          sector?: string | null
          source_id?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string
          url?: string | null
          wilaya_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_texts_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          legal_text_id: string
          message: string
          read: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          legal_text_id: string
          message: string
          read?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          legal_text_id?: string
          message?: string
          read?: boolean
          user_id?: string
        }
        Relationships: []
      }
      ocr_approval_items: {
        Row: {
          content: Json
          created_at: string
          id: string
          mapping_id: string
          original_text: string | null
          priority: number | null
          review_notes: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: string | null
          submitted_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          mapping_id: string
          original_text?: string | null
          priority?: number | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string | null
          submitted_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          mapping_id?: string
          original_text?: string | null
          priority?: number | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string | null
          submitted_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ocr_approval_items_mapping_id_fkey"
            columns: ["mapping_id"]
            isOneToOne: false
            referencedRelation: "ocr_mappings"
            referencedColumns: ["id"]
          },
        ]
      }
      ocr_extractions: {
        Row: {
          confidence_score: number | null
          created_at: string
          extracted_text: string | null
          file_type: string
          id: string
          is_mixed_language: boolean | null
          language_detected: string | null
          metadata: Json | null
          original_filename: string
          processing_status: string | null
          text_regions: Json | null
          total_pages: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          extracted_text?: string | null
          file_type: string
          id?: string
          is_mixed_language?: boolean | null
          language_detected?: string | null
          metadata?: Json | null
          original_filename: string
          processing_status?: string | null
          text_regions?: Json | null
          total_pages?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          extracted_text?: string | null
          file_type?: string
          id?: string
          is_mixed_language?: boolean | null
          language_detected?: string | null
          metadata?: Json | null
          original_filename?: string
          processing_status?: string | null
          text_regions?: Json | null
          total_pages?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ocr_mappings: {
        Row: {
          confidence_scores: Json | null
          created_at: string
          extraction_id: string
          form_type: string
          id: string
          mapped_data: Json | null
          mapped_fields: Json | null
          mapping_status: string | null
          unmapped_fields: Json | null
          updated_at: string
          validation_errors: Json | null
        }
        Insert: {
          confidence_scores?: Json | null
          created_at?: string
          extraction_id: string
          form_type: string
          id?: string
          mapped_data?: Json | null
          mapped_fields?: Json | null
          mapping_status?: string | null
          unmapped_fields?: Json | null
          updated_at?: string
          validation_errors?: Json | null
        }
        Update: {
          confidence_scores?: Json | null
          created_at?: string
          extraction_id?: string
          form_type?: string
          id?: string
          mapped_data?: Json | null
          mapped_fields?: Json | null
          mapping_status?: string | null
          unmapped_fields?: Json | null
          updated_at?: string
          validation_errors?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ocr_mappings_extraction_id_fkey"
            columns: ["extraction_id"]
            isOneToOne: false
            referencedRelation: "ocr_extractions"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          offline_id: string | null
          thread_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          offline_id?: string | null
          thread_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          offline_id?: string | null
          thread_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
        }
        Relationships: []
      }
      retention_settings: {
        Row: {
          id: number
          retention_days: number
        }
        Insert: {
          id?: number
          retention_days?: number
        }
        Update: {
          id?: number
          retention_days?: number
        }
        Relationships: []
      }
      sectors: {
        Row: {
          code: string | null
          id: string
          name: string
        }
        Insert: {
          code?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      sources: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          schedule_cron: string | null
          type: Database["public"]["Enums"]["source_type"]
          url: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          schedule_cron?: string | null
          type: Database["public"]["Enums"]["source_type"]
          url?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          schedule_cron?: string | null
          type?: Database["public"]["Enums"]["source_type"]
          url?: string | null
        }
        Relationships: []
      }
      threads: {
        Row: {
          created_at: string
          created_by: string
          id: string
          sector_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          sector_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          sector_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "threads_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          keywords: string[]
          sectors: string[]
          user_id: string
          wilayas: string[]
        }
        Insert: {
          created_at?: string
          id?: string
          keywords?: string[]
          sectors?: string[]
          user_id: string
          wilayas?: string[]
        }
        Update: {
          created_at?: string
          id?: string
          keywords?: string[]
          sectors?: string[]
          user_id?: string
          wilayas?: string[]
        }
        Relationships: []
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
      validation_errors: {
        Row: {
          approval_item_id: string | null
          created_at: string
          error_code: string
          error_message: string
          error_type: Database["public"]["Enums"]["validation_error_type"]
          field_path: string | null
          id: string
          is_resolved: boolean
          severity: string
          suggested_fix: string | null
        }
        Insert: {
          approval_item_id?: string | null
          created_at?: string
          error_code: string
          error_message: string
          error_type: Database["public"]["Enums"]["validation_error_type"]
          field_path?: string | null
          id?: string
          is_resolved?: boolean
          severity?: string
          suggested_fix?: string | null
        }
        Update: {
          approval_item_id?: string | null
          created_at?: string
          error_code?: string
          error_message?: string
          error_type?: Database["public"]["Enums"]["validation_error_type"]
          field_path?: string | null
          id?: string
          is_resolved?: boolean
          severity?: string
          suggested_fix?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "validation_errors_approval_item_id_fkey"
            columns: ["approval_item_id"]
            isOneToOne: false
            referencedRelation: "approval_items"
            referencedColumns: ["id"]
          },
        ]
      }
      wilayas: {
        Row: {
          code: string | null
          id: string
          name: string
        }
        Insert: {
          code?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_legal_texts_by_month: {
        Row: {
          count: number | null
          month: string | null
        }
        Relationships: []
      }
      v_legal_texts_by_sector: {
        Row: {
          count: number | null
          sector: string | null
        }
        Relationships: []
      }
      v_legal_texts_by_wilaya: {
        Row: {
          count: number | null
          wilaya_code: string | null
        }
        Relationships: []
      }
      v_wilaya_stats: {
        Row: {
          ar_name: string | null
          code: string | null
          last_publication: string | null
          name: string | null
          recent_texts: number | null
          sectors_count: number | null
          total_texts: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      archive_legal_text: {
        Args: { _id: string }
        Returns: undefined
      }
      get_wilaya_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          ar_name: string
          code: string
          last_publication: string
          name: string
          recent_texts: number
          sectors_count: number
          total_texts: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_profile_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      purge_archived_legal_text_versions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      user_roles_empty: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      annotation_visibility: "private" | "team" | "public"
      app_role: "admin" | "juriste" | "citoyen"
      approval_priority: "low" | "medium" | "high" | "urgent"
      source_type: "JO" | "MINISTRY" | "WILAYA" | "OTHER"
      validation_error_type:
        | "format"
        | "content"
        | "metadata"
        | "duplicate"
        | "classification"
        | "legal_compliance"
      validation_status:
        | "pending"
        | "in_review"
        | "approved"
        | "rejected"
        | "requires_modification"
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
      annotation_visibility: ["private", "team", "public"],
      app_role: ["admin", "juriste", "citoyen"],
      approval_priority: ["low", "medium", "high", "urgent"],
      source_type: ["JO", "MINISTRY", "WILAYA", "OTHER"],
      validation_error_type: [
        "format",
        "content",
        "metadata",
        "duplicate",
        "classification",
        "legal_compliance",
      ],
      validation_status: [
        "pending",
        "in_review",
        "approved",
        "rejected",
        "requires_modification",
      ],
    },
  },
} as const
