export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string | null;
          tier: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string | null;
          tier?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string | null;
          tier?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          organization_id: string;
          email: string;
          full_name: string;
          role: 'Admin' | 'Creator' | 'Manager' | 'Reviewer';
          avatar_url: string | null;
          department: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          organization_id: string;
          email: string;
          full_name: string;
          role?: 'Admin' | 'Creator' | 'Manager' | 'Reviewer';
          avatar_url?: string | null;
          department?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          avatar_url?: string | null;
          department?: string | null;
          updated_at?: string;
        };
      };
      brand_profiles: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          tone_pillars: Json | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          description?: string | null;
          tone_pillars?: Json | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          tone_pillars?: Json | null;
          is_default?: boolean;
          updated_at?: string;
        };
      };
      knowledge_items: {
        Row: {
          id: string;
          organization_id: string;
          brand_profile_id: string | null;
          type: 'guideline' | 'fact' | 'terminology' | 'banned' | 'phrase' | 'disclaimer' | 'asset';
          title: string;
          content: string;
          category: string | null;
          tags: string[] | null;
          status: 'Active' | 'Under Review' | 'Archived';
          replacement: string | null;
          file_format: string | null;
          file_size: string | null;
          file_path: string | null;
          file_url: string | null;
          thumbnail_url: string | null;
          embedding: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          brand_profile_id?: string | null;
          type: 'guideline' | 'fact' | 'terminology' | 'banned' | 'phrase' | 'disclaimer' | 'asset';
          title: string;
          content: string;
          category?: string | null;
          tags?: string[] | null;
          status?: 'Active' | 'Under Review' | 'Archived';
          replacement?: string | null;
          file_format?: string | null;
          file_size?: string | null;
          file_path?: string | null;
          file_url?: string | null;
          thumbnail_url?: string | null;
          embedding?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
          category?: string | null;
          tags?: string[] | null;
          status?: 'Active' | 'Under Review' | 'Archived';
          replacement?: string | null;
          file_format?: string | null;
          file_size?: string | null;
          file_path?: string | null;
          file_url?: string | null;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          organization_id: string;
          brand_profile_id: string | null;
          title: string;
          content_type: string;
          original_content: string;
          suggested_content: string | null;
          instructions: string | null;
          file_path: string | null;
          file_url: string | null;
          overall_score: number;
          category_scores: Json;
          status: 'Pending Review' | 'In Progress' | 'Changes Requested' | 'Approved' | 'Rejected' | 'Needs Revision';
          author_id: string | null;
          reviewer_id: string | null;
          revision_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          organization_id: string;
          brand_profile_id?: string | null;
          title: string;
          content_type: string;
          original_content: string;
          suggested_content?: string | null;
          instructions?: string | null;
          file_path?: string | null;
          file_url?: string | null;
          overall_score?: number;
          category_scores?: Json;
          status?: 'Pending Review' | 'In Progress' | 'Changes Requested' | 'Approved' | 'Rejected' | 'Needs Revision';
          author_id?: string | null;
          reviewer_id?: string | null;
          revision_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          original_content?: string;
          suggested_content?: string | null;
          overall_score?: number;
          category_scores?: Json;
          status?: 'Pending Review' | 'In Progress' | 'Changes Requested' | 'Approved' | 'Rejected' | 'Needs Revision';
          file_path?: string | null;
          file_url?: string | null;
          reviewer_id?: string | null;
          revision_count?: number;
          updated_at?: string;
        };
      };
      findings: {
        Row: {
          id: string;
          organization_id: string;
          review_id: string;
          category: string;
          severity: string;
          reason: string;
          evidence: string;
          highlighted_text: string | null;
          source_document: string | null;
          source_section: string | null;
          confidence: number;
          suggested_fix: string | null;
          explanation: string | null;
          status: 'pending' | 'accepted' | 'rejected' | 'modified';
          user_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          organization_id: string;
          review_id: string;
          category: string;
          severity: string;
          reason: string;
          evidence: string;
          highlighted_text?: string | null;
          source_document?: string | null;
          source_section?: string | null;
          confidence?: number;
          suggested_fix?: string | null;
          explanation?: string | null;
          status?: 'pending' | 'accepted' | 'rejected' | 'modified';
          user_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: 'pending' | 'accepted' | 'rejected' | 'modified';
          suggested_fix?: string | null;
          user_note?: string | null;
          updated_at?: string;
        };
      };
      approvals: {
        Row: {
          id: string;
          organization_id: string;
          review_id: string;
          submitted_by: string | null;
          assigned_reviewer: string | null;
          urgency: 'Low' | 'Medium' | 'High' | 'Urgent';
          compliance_score: number;
          status: 'Pending' | 'Approved' | 'Rejected' | 'Needs Revision';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          review_id: string;
          submitted_by?: string | null;
          assigned_reviewer?: string | null;
          urgency?: 'Low' | 'Medium' | 'High' | 'Urgent';
          compliance_score?: number;
          status?: 'Pending' | 'Approved' | 'Rejected' | 'Needs Revision';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          assigned_reviewer?: string | null;
          status?: 'Pending' | 'Approved' | 'Rejected' | 'Needs Revision';
          compliance_score?: number;
          urgency?: 'Low' | 'Medium' | 'High' | 'Urgent';
          updated_at?: string;
        };
      };
      approval_comments: {
        Row: {
          id: string;
          organization_id: string;
          approval_id: string;
          author_id: string | null;
          comment_text: string;
          resolved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          approval_id: string;
          author_id?: string | null;
          comment_text: string;
          resolved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          resolved?: boolean;
          comment_text?: string;
          updated_at?: string;
        };
      };
      review_revisions: {
        Row: {
          id: string;
          organization_id: string;
          review_id: string;
          version_number: number;
          author_id: string | null;
          reviewer_id: string | null;
          compliance_score: number;
          status: string | null;
          summary: string | null;
          content: string;
          accepted_count: number;
          rejected_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          review_id: string;
          version_number: number;
          author_id?: string | null;
          reviewer_id?: string | null;
          compliance_score?: number;
          status?: string | null;
          summary?: string | null;
          content: string;
          accepted_count?: number;
          rejected_count?: number;
          created_at?: string;
        };
        Update: {
          status?: string | null;
          summary?: string | null;
        };
      };
      conversations: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          organization_id: string;
          conversation_id: string;
          sender: 'user' | 'sensa';
          content: string;
          severity: string | null;
          category: string | null;
          citations: Json | null;
          suggested_fix: string | null;
          confidence: number | null;
          requires_human_review: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          conversation_id: string;
          sender: 'user' | 'sensa';
          content: string;
          severity?: string | null;
          category?: string | null;
          citations?: Json | null;
          suggested_fix?: string | null;
          confidence?: number | null;
          requires_human_review?: boolean;
          created_at?: string;
        };
      };
      invitations: {
        Row: {
          id: string;
          organization_id: string;
          email: string;
          role: 'Admin' | 'Creator' | 'Manager' | 'Reviewer';
          invited_by: string | null;
          status: 'pending' | 'accepted' | 'expired';
          token: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          email: string;
          role: 'Admin' | 'Creator' | 'Manager' | 'Reviewer';
          invited_by?: string | null;
          status?: 'pending' | 'accepted' | 'expired';
          token?: string;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          status?: 'pending' | 'accepted' | 'expired';
        };
      };
    };
  };
}

