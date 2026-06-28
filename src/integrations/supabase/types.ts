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
      applications: {
        Row: {
          applicant_id: string
          cover_message: string
          cv_path: string | null
          id: string
          opportunity_id: string
          portfolio_link: string | null
          status: Database["public"]["Enums"]["application_status"]
          submitted_at: string
          updated_at: string
        }
        Insert: {
          applicant_id: string
          cover_message: string
          cv_path?: string | null
          id?: string
          opportunity_id: string
          portfolio_link?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          cover_message?: string
          cv_path?: string | null
          id?: string
          opportunity_id?: string
          portfolio_link?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "v_public_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      business_profiles: {
        Row: {
          company_name: string
          created_at: string
          description: string
          industry: string
          logo_url: string | null
          registration_number: string | null
          updated_at: string
          user_id: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          verified_at: string | null
          verified_by: string | null
          website: string | null
        }
        Insert: {
          company_name?: string
          created_at?: string
          description?: string
          industry?: string
          logo_url?: string | null
          registration_number?: string | null
          updated_at?: string
          user_id: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string
          description?: string
          industry?: string
          logo_url?: string | null
          registration_number?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Relationships: []
      }
      business_verification_documents: {
        Row: {
          business_id: string
          doc_type: string
          file_path: string
          id: string
          uploaded_at: string
        }
        Insert: {
          business_id: string
          doc_type: string
          file_path: string
          id?: string
          uploaded_at?: string
        }
        Update: {
          business_id?: string
          doc_type?: string
          file_path?: string
          id?: string
          uploaded_at?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message: string | null
          last_message_at: string | null
          opportunity_id: string | null
          task_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          opportunity_id?: string | null
          task_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          opportunity_id?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "v_public_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverables: {
        Row: {
          created_at: string
          external_url: string | null
          feedback: string | null
          file_path: string | null
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["deliverable_status"]
          task_id: string
          title: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          external_url?: string | null
          feedback?: string | null
          file_path?: string | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["deliverable_status"]
          task_id: string
          title: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          created_at?: string
          external_url?: string | null
          feedback?: string | null
          file_path?: string | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["deliverable_status"]
          task_id?: string
          title?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          against_id: string
          amount: number | null
          created_at: string
          id: string
          opportunity_id: string | null
          raised_by: string
          reason: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["dispute_status"]
          task_id: string | null
          updated_at: string
        }
        Insert: {
          against_id: string
          amount?: number | null
          created_at?: string
          id?: string
          opportunity_id?: string | null
          raised_by: string
          reason: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          task_id?: string | null
          updated_at?: string
        }
        Update: {
          against_id?: string
          amount?: number | null
          created_at?: string
          id?: string
          opportunity_id?: string | null
          raised_by?: string
          reason?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          task_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "v_public_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_listings: {
        Row: {
          amount_paid: number
          business_id: string
          created_at: string
          ends_at: string
          id: string
          opportunity_id: string
          starts_at: string
        }
        Insert: {
          amount_paid?: number
          business_id: string
          created_at?: string
          ends_at: string
          id?: string
          opportunity_id: string
          starts_at?: string
        }
        Update: {
          amount_paid?: number
          business_id?: string
          created_at?: string
          ends_at?: string
          id?: string
          opportunity_id?: string
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_listings_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_listings_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "v_public_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          href: string | null
          id: string
          kind: Database["public"]["Enums"]["notification_kind"]
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          href?: string | null
          id?: string
          kind: Database["public"]["Enums"]["notification_kind"]
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          href?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["notification_kind"]
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          applicant_count: number
          business_id: string
          compensation_amount: number
          compensation_type: Database["public"]["Enums"]["compensation_type"]
          created_at: string
          deadline: string | null
          description: string
          duration_weeks: number | null
          featured: boolean
          featured_until: string | null
          id: string
          location: string
          posted_at: string | null
          remote: boolean
          requirements: string[]
          status: Database["public"]["Enums"]["opportunity_status"]
          title: string
          type: Database["public"]["Enums"]["opportunity_type"]
          updated_at: string
        }
        Insert: {
          applicant_count?: number
          business_id: string
          compensation_amount?: number
          compensation_type: Database["public"]["Enums"]["compensation_type"]
          created_at?: string
          deadline?: string | null
          description: string
          duration_weeks?: number | null
          featured?: boolean
          featured_until?: string | null
          id?: string
          location?: string
          posted_at?: string | null
          remote?: boolean
          requirements?: string[]
          status?: Database["public"]["Enums"]["opportunity_status"]
          title: string
          type: Database["public"]["Enums"]["opportunity_type"]
          updated_at?: string
        }
        Update: {
          applicant_count?: number
          business_id?: string
          compensation_amount?: number
          compensation_type?: Database["public"]["Enums"]["compensation_type"]
          created_at?: string
          deadline?: string | null
          description?: string
          duration_weeks?: number | null
          featured?: boolean
          featured_until?: string | null
          id?: string
          location?: string
          posted_at?: string | null
          remote?: boolean
          requirements?: string[]
          status?: Database["public"]["Enums"]["opportunity_status"]
          title?: string
          type?: Database["public"]["Enums"]["opportunity_type"]
          updated_at?: string
        }
        Relationships: []
      }
      opportunity_skills: {
        Row: {
          opportunity_id: string
          skill_id: string
        }
        Insert: {
          opportunity_id: string
          skill_id: string
        }
        Update: {
          opportunity_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_skills_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_skills_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "v_public_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          created_at: string
          gross_amount: number
          held_at: string | null
          id: string
          net_amount: number
          payee_id: string
          payer_id: string
          platform_fee: number
          provider: string | null
          provider_ref: string | null
          refunded_at: string | null
          released_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          task_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          gross_amount: number
          held_at?: string | null
          id?: string
          net_amount: number
          payee_id: string
          payer_id: string
          platform_fee: number
          provider?: string | null
          provider_ref?: string | null
          refunded_at?: string | null
          released_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          task_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          gross_amount?: number
          held_at?: string | null
          id?: string
          net_amount?: number
          payee_id?: string
          payer_id?: string
          platform_fee?: number
          provider?: string | null
          provider_ref?: string | null
          refunded_at?: string | null
          released_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: true
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      placements: {
        Row: {
          application_id: string
          business_id: string
          compensation_amount: number
          created_at: string
          ended_at: string | null
          id: string
          opportunity_id: string
          started_at: string
          status: Database["public"]["Enums"]["placement_status"]
          worker_id: string
        }
        Insert: {
          application_id: string
          business_id: string
          compensation_amount: number
          created_at?: string
          ended_at?: string | null
          id?: string
          opportunity_id: string
          started_at?: string
          status?: Database["public"]["Enums"]["placement_status"]
          worker_id: string
        }
        Update: {
          application_id?: string
          business_id?: string
          compensation_amount?: number
          created_at?: string
          ended_at?: string | null
          id?: string
          opportunity_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["placement_status"]
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "placements_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "v_public_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          created_at: string
          description: string | null
          external_url: string | null
          id: string
          image_path: string | null
          task_id: string | null
          title: string
          updated_at: string
          user_id: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          description?: string | null
          external_url?: string | null
          id?: string
          image_path?: string | null
          task_id?: string | null
          title: string
          updated_at?: string
          user_id: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          description?: string | null
          external_url?: string | null
          id?: string
          image_path?: string | null
          task_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          full_name: string | null
          github_url: string | null
          headline: string | null
          id: string
          linkedin_url: string | null
          onboarding_complete: boolean
          phone: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          github_url?: string | null
          headline?: string | null
          id: string
          linkedin_url?: string | null
          onboarding_complete?: boolean
          phone?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          github_url?: string | null
          headline?: string | null
          id?: string
          linkedin_url?: string | null
          onboarding_complete?: boolean
          phone?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          handled_at: string | null
          handled_by: string | null
          id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          status: Database["public"]["Enums"]["report_status"]
          target_message_id: string | null
          target_opportunity_id: string | null
          target_user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: string | null
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          status?: Database["public"]["Enums"]["report_status"]
          target_message_id?: string | null
          target_opportunity_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: string | null
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          reason?: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string
          status?: Database["public"]["Enums"]["report_status"]
          target_message_id?: string | null
          target_opportunity_id?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_target_message_id_fkey"
            columns: ["target_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_target_opportunity_id_fkey"
            columns: ["target_opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_target_opportunity_id_fkey"
            columns: ["target_opportunity_id"]
            isOneToOne: false
            referencedRelation: "v_public_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          subject_id: string
          task_id: string
        }
        Insert: {
          author_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          subject_id: string
          task_id: string
        }
        Update: {
          author_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          subject_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          created_at: string
          current_role_title: string | null
          cv_path: string | null
          degree: string
          graduation_year: number | null
          is_graduate: boolean
          university: string
          updated_at: string
          user_id: string
          years_since_graduation: number | null
        }
        Insert: {
          created_at?: string
          current_role_title?: string | null
          cv_path?: string | null
          degree?: string
          graduation_year?: number | null
          is_graduate?: boolean
          university?: string
          updated_at?: string
          user_id: string
          years_since_graduation?: number | null
        }
        Update: {
          created_at?: string
          current_role_title?: string | null
          cv_path?: string | null
          degree?: string
          graduation_year?: number | null
          is_graduate?: boolean
          university?: string
          updated_at?: string
          user_id?: string
          years_since_graduation?: number | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          amount: number
          application_id: string
          business_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_at: string | null
          id: string
          opportunity_id: string
          starts_at: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          amount: number
          application_id: string
          business_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          opportunity_id: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          amount?: number
          application_id?: string
          business_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          opportunity_id?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "v_public_opportunities"
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
      user_skills: {
        Row: {
          created_at: string
          proficiency: number
          skill_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          proficiency?: number
          skill_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          proficiency?: number
          skill_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          counterparty_id: string | null
          created_at: string
          description: string | null
          id: string
          payment_id: string | null
          status: Database["public"]["Enums"]["wallet_txn_status"]
          task_id: string | null
          type: Database["public"]["Enums"]["wallet_txn_type"]
          user_id: string
        }
        Insert: {
          amount: number
          counterparty_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          payment_id?: string | null
          status?: Database["public"]["Enums"]["wallet_txn_status"]
          task_id?: string | null
          type: Database["public"]["Enums"]["wallet_txn_type"]
          user_id: string
        }
        Update: {
          amount?: number
          counterparty_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          payment_id?: string | null
          status?: Database["public"]["Enums"]["wallet_txn_status"]
          task_id?: string | null
          type?: Database["public"]["Enums"]["wallet_txn_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          available_balance: number
          created_at: string
          last_payout_at: string | null
          lifetime_earnings: number
          lifetime_spent: number
          pending_balance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          available_balance?: number
          created_at?: string
          last_payout_at?: string | null
          lifetime_earnings?: number
          lifetime_spent?: number
          pending_balance?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          available_balance?: number
          created_at?: string
          last_payout_at?: string | null
          lifetime_earnings?: number
          lifetime_spent?: number
          pending_balance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_public_opportunities: {
        Row: {
          applicant_count: number | null
          business_id: string | null
          company_name: string | null
          compensation_amount: number | null
          compensation_type:
            | Database["public"]["Enums"]["compensation_type"]
            | null
          deadline: string | null
          description: string | null
          duration_weeks: number | null
          featured: boolean | null
          id: string | null
          location: string | null
          logo_url: string | null
          posted_at: string | null
          remote: boolean | null
          title: string | null
          type: Database["public"]["Enums"]["opportunity_type"] | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: []
      }
      v_review_summary: {
        Row: {
          average_rating: number | null
          review_count: number | null
          subject_id: string | null
        }
        Relationships: []
      }
      v_wallet_summary: {
        Row: {
          available_balance: number | null
          last_payout_at: string | null
          lifetime_earnings: number | null
          lifetime_spent: number | null
          pending_balance: number | null
          user_id: string | null
        }
        Insert: {
          available_balance?: number | null
          last_payout_at?: string | null
          lifetime_earnings?: number | null
          lifetime_spent?: number | null
          pending_balance?: number | null
          user_id?: string | null
        }
        Update: {
          available_balance?: number | null
          last_payout_at?: string | null
          lifetime_earnings?: number | null
          lifetime_spent?: number | null
          pending_balance?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_set_business_verification: {
        Args: { _approve: boolean; _business_id: string }
        Returns: undefined
      }
      admin_stats: { Args: never; Returns: Json }
      create_notification: {
        Args: {
          _body?: string
          _href?: string
          _kind: Database["public"]["Enums"]["notification_kind"]
          _title: string
          _user_id: string
        }
        Returns: string
      }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      expire_featured_listings: { Args: never; Returns: number }
      fund_task_escrow: { Args: { p_task_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      platform_fee_rate: { Args: never; Returns: number }
      refund_task_payment: { Args: { p_task_id: string }; Returns: undefined }
      release_task_payment: { Args: { p_task_id: string }; Returns: undefined }
      request_withdrawal: { Args: { p_amount: number }; Returns: string }
      submit_business_verification: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "student" | "graduate" | "business" | "admin"
      application_status:
        | "submitted"
        | "shortlisted"
        | "interview"
        | "accepted"
        | "rejected"
        | "withdrawn"
      compensation_type: "fixed" | "hourly" | "stipend" | "unpaid"
      deliverable_status:
        | "submitted"
        | "approved"
        | "rejected"
        | "revision_requested"
      dispute_status: "open" | "in_review" | "resolved" | "rejected"
      notification_kind:
        | "application_update"
        | "new_applicant"
        | "review_received"
        | "opportunity_match"
        | "message_received"
        | "task_update"
        | "deliverable_update"
        | "payment_update"
        | "verification_update"
        | "dispute_update"
        | "system"
      opportunity_status: "draft" | "open" | "closed" | "filled" | "cancelled"
      opportunity_type:
        | "freelance"
        | "internship"
        | "part-time"
        | "entry-level"
        | "short-project"
      payment_status:
        | "pending"
        | "held_in_escrow"
        | "released"
        | "refunded"
        | "failed"
      placement_status: "active" | "completed" | "terminated"
      report_reason:
        | "spam"
        | "harassment"
        | "scam"
        | "inappropriate"
        | "offensive"
        | "impersonation"
        | "other"
      report_status: "open" | "reviewing" | "actioned" | "dismissed"
      task_status:
        | "pending"
        | "in_progress"
        | "submitted"
        | "revision_requested"
        | "completed"
        | "cancelled"
        | "disputed"
      verification_status: "unsubmitted" | "pending" | "approved" | "rejected"
      wallet_txn_status: "pending" | "completed" | "failed" | "cancelled"
      wallet_txn_type:
        | "earning"
        | "withdrawal"
        | "payout"
        | "fee"
        | "charge"
        | "escrow_hold"
        | "escrow_release"
        | "refund"
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
      app_role: ["student", "graduate", "business", "admin"],
      application_status: [
        "submitted",
        "shortlisted",
        "interview",
        "accepted",
        "rejected",
        "withdrawn",
      ],
      compensation_type: ["fixed", "hourly", "stipend", "unpaid"],
      deliverable_status: [
        "submitted",
        "approved",
        "rejected",
        "revision_requested",
      ],
      dispute_status: ["open", "in_review", "resolved", "rejected"],
      notification_kind: [
        "application_update",
        "new_applicant",
        "review_received",
        "opportunity_match",
        "message_received",
        "task_update",
        "deliverable_update",
        "payment_update",
        "verification_update",
        "dispute_update",
        "system",
      ],
      opportunity_status: ["draft", "open", "closed", "filled", "cancelled"],
      opportunity_type: [
        "freelance",
        "internship",
        "part-time",
        "entry-level",
        "short-project",
      ],
      payment_status: [
        "pending",
        "held_in_escrow",
        "released",
        "refunded",
        "failed",
      ],
      placement_status: ["active", "completed", "terminated"],
      report_reason: [
        "spam",
        "harassment",
        "scam",
        "inappropriate",
        "offensive",
        "impersonation",
        "other",
      ],
      report_status: ["open", "reviewing", "actioned", "dismissed"],
      task_status: [
        "pending",
        "in_progress",
        "submitted",
        "revision_requested",
        "completed",
        "cancelled",
        "disputed",
      ],
      verification_status: ["unsubmitted", "pending", "approved", "rejected"],
      wallet_txn_status: ["pending", "completed", "failed", "cancelled"],
      wallet_txn_type: [
        "earning",
        "withdrawal",
        "payout",
        "fee",
        "charge",
        "escrow_hold",
        "escrow_release",
        "refund",
      ],
    },
  },
} as const
