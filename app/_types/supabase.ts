export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      block: {
        Row: {
          ave_embedding: string | null
          block_id: number
          block_type: string
          content: string | null
          created_at: string
          current_editor: string | null
          file_url: string | null
          google_doc_id: string | null
          google_user_id: string | null
          is_file: boolean
          original_date: string | null
          owner_id: string
          parent_id: number | null
          preview: string | null
          public: boolean
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          ave_embedding?: string | null
          block_id?: number
          block_type: string
          content?: string | null
          created_at?: string
          current_editor?: string | null
          file_url?: string | null
          google_doc_id?: string | null
          google_user_id?: string | null
          is_file?: boolean
          original_date?: string | null
          owner_id?: string
          parent_id?: number | null
          preview?: string | null
          public?: boolean
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          ave_embedding?: string | null
          block_id?: number
          block_type?: string
          content?: string | null
          created_at?: string
          current_editor?: string | null
          file_url?: string | null
          google_doc_id?: string | null
          google_user_id?: string | null
          is_file?: boolean
          original_date?: string | null
          owner_id?: string
          parent_id?: number | null
          preview?: string | null
          public?: boolean
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "block_current_editor_fkey"
            columns: ["current_editor"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["email"]
          },
          {
            foreignKeyName: "block_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "block_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "block"
            referencedColumns: ["block_id"]
          }
        ]
      }
      block_for_dave: {
        Row: {
          block_id: number
          block_type: string
          content: string | null
          embedding: string | null
          file_name: string | null
          parent_id: number | null
          substantiveness: number | null
          summary: string | null
          title: string
        }
        Insert: {
          block_id?: number
          block_type: string
          content?: string | null
          embedding?: string | null
          file_name?: string | null
          parent_id?: number | null
          substantiveness?: number | null
          summary?: string | null
          title: string
        }
        Update: {
          block_id?: number
          block_type?: string
          content?: string | null
          embedding?: string | null
          file_name?: string | null
          parent_id?: number | null
          substantiveness?: number | null
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
      block_for_lisa: {
        Row: {
          block_id: number
          block_type: string
          content: string | null
          embedding: string | null
          file_name: string | null
          parent_id: number | null
          substantiveness: number | null
          summary: string | null
          title: string
        }
        Insert: {
          block_id?: number
          block_type: string
          content?: string | null
          embedding?: string | null
          file_name?: string | null
          parent_id?: number | null
          substantiveness?: number | null
          summary?: string | null
          title: string
        }
        Update: {
          block_id?: number
          block_type?: string
          content?: string | null
          embedding?: string | null
          file_name?: string | null
          parent_id?: number | null
          substantiveness?: number | null
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
      block_for_shadi: {
        Row: {
          block_id: number
          block_type: string
          content: string | null
          embedding: string | null
          file_name: string | null
          parent_id: number | null
          substantiveness: number | null
          summary: string | null
          title: string
        }
        Insert: {
          block_id?: number
          block_type: string
          content?: string | null
          embedding?: string | null
          file_name?: string | null
          parent_id?: number | null
          substantiveness?: number | null
          summary?: string | null
          title: string
        }
        Update: {
          block_id?: number
          block_type?: string
          content?: string | null
          embedding?: string | null
          file_name?: string | null
          parent_id?: number | null
          substantiveness?: number | null
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
      block_for_stef: {
        Row: {
          block_id: number
          block_type: string
          content: string | null
          embedding: string | null
          file_name: string | null
          parent_id: number | null
          substantiveness: number | null
          summary: string | null
          title: string
        }
        Insert: {
          block_id?: number
          block_type: string
          content?: string | null
          embedding?: string | null
          file_name?: string | null
          parent_id?: number | null
          substantiveness?: number | null
          summary?: string | null
          title: string
        }
        Update: {
          block_id?: number
          block_type?: string
          content?: string | null
          embedding?: string | null
          file_name?: string | null
          parent_id?: number | null
          substantiveness?: number | null
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
      block_published: {
        Row: {
          ave_embedding: string | null
          block_id: number
          block_type: string
          content: string | null
          created_at: string
          file_url: string | null
          is_file: boolean
          owner_id: string
          parent_id: number | null
          preview: string | null
          public: boolean
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          ave_embedding?: string | null
          block_id: number
          block_type: string
          content?: string | null
          created_at?: string
          file_url?: string | null
          is_file?: boolean
          owner_id?: string
          parent_id?: number | null
          preview?: string | null
          public?: boolean
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          ave_embedding?: string | null
          block_id?: number
          block_type?: string
          content?: string | null
          created_at?: string
          file_url?: string | null
          is_file?: boolean
          owner_id?: string
          parent_id?: number | null
          preview?: string | null
          public?: boolean
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "block_published_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: true
            referencedRelation: "block"
            referencedColumns: ["block_id"]
          },
          {
            foreignKeyName: "block_published_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "block_published_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "block"
            referencedColumns: ["block_id"]
          }
        ]
      }
      block_references: {
        Row: {
          block_ref_a: number
          block_ref_b: number
        }
        Insert: {
          block_ref_a: number
          block_ref_b: number
        }
        Update: {
          block_ref_a?: number
          block_ref_b?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_block_ref_a"
            columns: ["block_ref_a"]
            isOneToOne: false
            referencedRelation: "block"
            referencedColumns: ["block_id"]
          },
          {
            foreignKeyName: "fk_block_ref_b"
            columns: ["block_ref_b"]
            isOneToOne: false
            referencedRelation: "block"
            referencedColumns: ["block_id"]
          }
        ]
      }
      chunk: {
        Row: {
          block_id: number | null
          chunk_id: number
          chunk_length: number | null
          chunk_start: number | null
          chunk_type: string | null
          content: string | null
          created_at: string
          embedding: string | null
          metadata: Json | null
          title: string | null
          updated_at: string
        }
        Insert: {
          block_id?: number | null
          chunk_id?: number
          chunk_length?: number | null
          chunk_start?: number | null
          chunk_type?: string | null
          content?: string | null
          created_at?: string
          embedding?: string | null
          metadata?: Json | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          block_id?: number | null
          chunk_id?: number
          chunk_length?: number | null
          chunk_start?: number | null
          chunk_type?: string | null
          content?: string | null
          created_at?: string
          embedding?: string | null
          metadata?: Json | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chunk_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "block"
            referencedColumns: ["block_id"]
          }
        ]
      }
      inbox: {
        Row: {
          block_id: number | null
          inbox_id: number
          user_id: string | null
        }
        Insert: {
          block_id?: number | null
          inbox_id?: number
          user_id?: string | null
        }
        Update: {
          block_id?: number | null
          inbox_id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inbox_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: true
            referencedRelation: "block"
            referencedColumns: ["block_id"]
          },
          {
            foreignKeyName: "inbox_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      lens: {
        Row: {
          created_at: string
          lens_id: number
          name: string
          owner_id: string
          parent_id: number | null
          parents: number[] | null
          public: boolean
          root: number | null
          shared: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          lens_id?: number
          name: string
          owner_id?: string
          parent_id?: number | null
          parents?: number[] | null
          public?: boolean
          root?: number | null
          shared?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          lens_id?: number
          name?: string
          owner_id?: string
          parent_id?: number | null
          parents?: number[] | null
          public?: boolean
          root?: number | null
          shared?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lens_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lens_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "lens"
            referencedColumns: ["lens_id"]
          },
          {
            foreignKeyName: "lens_root_fkey"
            columns: ["root"]
            isOneToOne: false
            referencedRelation: "lens"
            referencedColumns: ["lens_id"]
          }
        ]
      }
      lens_blocks: {
        Row: {
          block_id: number
          count: number | null
          direct_child: boolean | null
          lens_id: number
        }
        Insert: {
          block_id: number
          count?: number | null
          direct_child?: boolean | null
          lens_id: number
        }
        Update: {
          block_id?: number
          count?: number | null
          direct_child?: boolean | null
          lens_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_block"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "block"
            referencedColumns: ["block_id"]
          },
          {
            foreignKeyName: "fk_lens"
            columns: ["lens_id"]
            isOneToOne: false
            referencedRelation: "lens"
            referencedColumns: ["lens_id"]
          },
          {
            foreignKeyName: "lens_blocks_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "block"
            referencedColumns: ["block_id"]
          },
          {
            foreignKeyName: "lens_blocks_lens_id_fkey"
            columns: ["lens_id"]
            isOneToOne: false
            referencedRelation: "lens"
            referencedColumns: ["lens_id"]
          }
        ]
      }
      lens_blocks_published: {
        Row: {
          block_id: number
          count: number | null
          direct_child: boolean | null
          lens_id: number
        }
        Insert: {
          block_id: number
          count?: number | null
          direct_child?: boolean | null
          lens_id: number
        }
        Update: {
          block_id?: number
          count?: number | null
          direct_child?: boolean | null
          lens_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "lens_blocks_published_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "block"
            referencedColumns: ["block_id"]
          },
          {
            foreignKeyName: "lens_blocks_published_lens_id_fkey"
            columns: ["lens_id"]
            isOneToOne: false
            referencedRelation: "lens"
            referencedColumns: ["lens_id"]
          }
        ]
      }
      lens_chats: {
        Row: {
          created_at: string
          id: number
          lens_id: number | null
          message: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          lens_id?: number | null
          message?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          lens_id?: number | null
          message?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lens_chats_lens_id_fkey"
            columns: ["lens_id"]
            isOneToOne: false
            referencedRelation: "lens"
            referencedColumns: ["lens_id"]
          },
          {
            foreignKeyName: "lens_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      lens_invites: {
        Row: {
          access_type: string
          created_at: string
          id: number
          lens_id: number | null
          recipient: string | null
          sender: string | null
          status: string | null
          token: string | null
          updated_at: string | null
        }
        Insert: {
          access_type: string
          created_at?: string
          id?: number
          lens_id?: number | null
          recipient?: string | null
          sender?: string | null
          status?: string | null
          token?: string | null
          updated_at?: string | null
        }
        Update: {
          access_type?: string
          created_at?: string
          id?: number
          lens_id?: number | null
          recipient?: string | null
          sender?: string | null
          status?: string | null
          token?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lens_invites_lens_id_fkey"
            columns: ["lens_id"]
            isOneToOne: false
            referencedRelation: "lens"
            referencedColumns: ["lens_id"]
          },
          {
            foreignKeyName: "lens_invites_recipient_fkey"
            columns: ["recipient"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["email"]
          }
        ]
      }
      lens_layout: {
        Row: {
          block_layout: Json | null
          created_at: string
          icon_layout: Json | null
          id: number
          item_icons: Json | null
          lens_id: number | null
          list_layout: Json | null
        }
        Insert: {
          block_layout?: Json | null
          created_at?: string
          icon_layout?: Json | null
          id?: number
          item_icons?: Json | null
          lens_id?: number | null
          list_layout?: Json | null
        }
        Update: {
          block_layout?: Json | null
          created_at?: string
          icon_layout?: Json | null
          id?: number
          item_icons?: Json | null
          lens_id?: number | null
          list_layout?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "lens_layout_lens_id_fkey"
            columns: ["lens_id"]
            isOneToOne: true
            referencedRelation: "lens"
            referencedColumns: ["lens_id"]
          }
        ]
      }
      lens_published: {
        Row: {
          created_at: string
          lens_id: number
          name: string
          owner_id: string
          parent_id: number | null
          parents: number[] | null
          public: boolean
          root: number | null
          shared: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          lens_id: number
          name: string
          owner_id?: string
          parent_id?: number | null
          parents?: number[] | null
          public?: boolean
          root?: number | null
          shared?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          lens_id?: number
          name?: string
          owner_id?: string
          parent_id?: number | null
          parents?: number[] | null
          public?: boolean
          root?: number | null
          shared?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lens_published_lens_id_fkey"
            columns: ["lens_id"]
            isOneToOne: true
            referencedRelation: "lens"
            referencedColumns: ["lens_id"]
          },
          {
            foreignKeyName: "lens_published_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lens_published_root_fkey"
            columns: ["root"]
            isOneToOne: false
            referencedRelation: "lens"
            referencedColumns: ["lens_id"]
          }
        ]
      }
      lens_references: {
        Row: {
          lens_ref_a: number
          lens_ref_b: number
        }
        Insert: {
          lens_ref_a: number
          lens_ref_b: number
        }
        Update: {
          lens_ref_a?: number
          lens_ref_b?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_lens_ref_a"
            columns: ["lens_ref_a"]
            isOneToOne: false
            referencedRelation: "lens"
            referencedColumns: ["lens_id"]
          },
          {
            foreignKeyName: "fk_lens_ref_b"
            columns: ["lens_ref_b"]
            isOneToOne: false
            referencedRelation: "lens"
            referencedColumns: ["lens_id"]
          },
          {
            foreignKeyName: "lens_references_lens_ref_a_fkey"
            columns: ["lens_ref_a"]
            isOneToOne: false
            referencedRelation: "lens"
            referencedColumns: ["lens_id"]
          },
          {
            foreignKeyName: "lens_references_lens_ref_b_fkey"
            columns: ["lens_ref_b"]
            isOneToOne: false
            referencedRelation: "lens"
            referencedColumns: ["lens_id"]
          }
        ]
      }
      lens_users: {
        Row: {
          access_type: string
          id: number
          lens_id: number
          pinned: boolean | null
          subspace_only: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_type?: string
          id?: number
          lens_id: number
          pinned?: boolean | null
          subspace_only?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_type?: string
          id?: number
          lens_id?: number
          pinned?: boolean | null
          subspace_only?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lens_users_lens_id_fkey"
            columns: ["lens_id"]
            isOneToOne: false
            referencedRelation: "lens"
            referencedColumns: ["lens_id"]
          },
          {
            foreignKeyName: "lens_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      onboarding_list: {
        Row: {
          created_at: string
          id: number
          uid: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          uid?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          uid?: string | null
        }
        Relationships: []
      }
      painpoint_summarization: {
        Row: {
          block_id: number
          block_type: string
          content: string | null
          embedding: string | null
          parent_id: number | null
          review_id: string | null
          substantiveness: number | null
        }
        Insert: {
          block_id?: number
          block_type: string
          content?: string | null
          embedding?: string | null
          parent_id?: number | null
          review_id?: string | null
          substantiveness?: number | null
        }
        Update: {
          block_id?: number
          block_type?: string
          content?: string | null
          embedding?: string | null
          parent_id?: number | null
          review_id?: string | null
          substantiveness?: number | null
        }
        Relationships: []
      }
      processBlockLogging: {
        Row: {
          block_id: number
          id: number
          time: string | null
        }
        Insert: {
          block_id: number
          id?: number
          time?: string | null
        }
        Update: {
          block_id?: number
          id?: number
          time?: string | null
        }
        Relationships: []
      }
      question_votes: {
        Row: {
          created_at: string
          lens_id: number | null
          question_id: string
          user_id: string | null
          vote: number | null
        }
        Insert: {
          created_at?: string
          lens_id?: number | null
          question_id: string
          user_id?: string | null
          vote?: number | null
        }
        Update: {
          created_at?: string
          lens_id?: number | null
          question_id?: string
          user_id?: string | null
          vote?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "question_votes_lens_id_fkey"
            columns: ["lens_id"]
            isOneToOne: false
            referencedRelation: "lens"
            referencedColumns: ["lens_id"]
          },
          {
            foreignKeyName: "question_votes_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: true
            referencedRelation: "questions"
            referencedColumns: ["id"]
          }
        ]
      }
      questions: {
        Row: {
          answer_full: string | null
          block_ids: number[] | null
          created_at: string
          embedding: string | null
          id: string
          lens_id: number | null
          popularity: number | null
          question_text: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          answer_full?: string | null
          block_ids?: number[] | null
          created_at?: string
          embedding?: string | null
          id?: string
          lens_id?: number | null
          popularity?: number | null
          question_text: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          answer_full?: string | null
          block_ids?: number[] | null
          created_at?: string
          embedding?: string | null
          id?: string
          lens_id?: number | null
          popularity?: number | null
          question_text?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      signup_code: {
        Row: {
          code: string
          created_at: string
          id: number
          shared: boolean | null
          used: boolean | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: number
          shared?: boolean | null
          used?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: number
          shared?: boolean | null
          used?: boolean | null
        }
        Relationships: []
      }
      spreadsheet: {
        Row: {
          created_at: string
          dataSource: Json | null
          lens_id: number | null
          name: string | null
          owner_id: string | null
          plugin: Json | null
          spreadsheet_id: number
          task_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          dataSource?: Json | null
          lens_id?: number | null
          name?: string | null
          owner_id?: string | null
          plugin?: Json | null
          spreadsheet_id?: number
          task_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          dataSource?: Json | null
          lens_id?: number | null
          name?: string | null
          owner_id?: string | null
          plugin?: Json | null
          spreadsheet_id?: number
          task_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spreadsheet_lens_id_fkey"
            columns: ["lens_id"]
            isOneToOne: false
            referencedRelation: "lens"
            referencedColumns: ["lens_id"]
          },
          {
            foreignKeyName: "spreadsheet_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          email: string | null
          first_name: string | null
          first_sign_in: boolean
          id: string
          last_name: string | null
          phone_number: string | null
        }
        Insert: {
          email?: string | null
          first_name?: string | null
          first_sign_in?: boolean
          id: string
          last_name?: string | null
          phone_number?: string | null
        }
        Update: {
          email?: string | null
          first_name?: string | null
          first_sign_in?: boolean
          id?: string
          last_name?: string | null
          phone_number?: string | null
        }
        Relationships: []
      }
      waiting_list: {
        Row: {
          created_at: string
          email: string | null
          id: number
          invited: boolean | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          invited?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          invited?: boolean | null
        }
        Relationships: []
      }
      web_content_block: {
        Row: {
          block_id: number
          content: string | null
          created_at: string
          parent_url: string | null
          url: string | null
        }
        Insert: {
          block_id?: number
          content?: string | null
          created_at?: string
          parent_url?: string | null
          url?: string | null
        }
        Update: {
          block_id?: number
          content?: string | null
          created_at?: string
          parent_url?: string | null
          url?: string | null
        }
        Relationships: []
      }
      web_content_chunk: {
        Row: {
          block_id: number | null
          chunk_id: number
          chunk_type: string | null
          content: string | null
          created_at: string
          embedding: string | null
          parent_url: string | null
          url: string | null
        }
        Insert: {
          block_id?: number | null
          chunk_id?: number
          chunk_type?: string | null
          content?: string | null
          created_at?: string
          embedding?: string | null
          parent_url?: string | null
          url?: string | null
        }
        Update: {
          block_id?: number | null
          chunk_id?: number
          chunk_type?: string | null
          content?: string | null
          created_at?: string
          embedding?: string | null
          parent_url?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "web_content_chunk_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "web_content_block"
            referencedColumns: ["block_id"]
          }
        ]
      }
      whiteboard: {
        Row: {
          created_at: string
          edges: Json | null
          lens_id: number | null
          name: string
          nodes: Json | null
          owner_id: string
          plugin: Json | null
          task_id: string | null
          updated_at: string
          whiteboard_id: number
        }
        Insert: {
          created_at?: string
          edges?: Json | null
          lens_id?: number | null
          name: string
          nodes?: Json | null
          owner_id?: string
          plugin?: Json | null
          task_id?: string | null
          updated_at?: string
          whiteboard_id?: number
        }
        Update: {
          created_at?: string
          edges?: Json | null
          lens_id?: number | null
          name?: string
          nodes?: Json | null
          owner_id?: string
          plugin?: Json | null
          task_id?: string | null
          updated_at?: string
          whiteboard_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "whiteboard_lens_id_fkey"
            columns: ["lens_id"]
            isOneToOne: false
            referencedRelation: "lens"
            referencedColumns: ["lens_id"]
          },
          {
            foreignKeyName: "whiteboard_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      widget: {
        Row: {
          created_at: string
          input: Json | null
          lens_id: number | null
          name: string | null
          output: Json | null
          owner_id: string | null
          state: Json | null
          task_id: string | null
          type: string | null
          updated_at: string | null
          widget_id: number
        }
        Insert: {
          created_at?: string
          input?: Json | null
          lens_id?: number | null
          name?: string | null
          output?: Json | null
          owner_id?: string | null
          state?: Json | null
          task_id?: string | null
          type?: string | null
          updated_at?: string | null
          widget_id?: number
        }
        Update: {
          created_at?: string
          input?: Json | null
          lens_id?: number | null
          name?: string | null
          output?: Json | null
          owner_id?: string | null
          state?: Json | null
          task_id?: string | null
          type?: string | null
          updated_at?: string | null
          widget_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "public_widget_lens_id_fkey"
            columns: ["lens_id"]
            isOneToOne: false
            referencedRelation: "lens"
            referencedColumns: ["lens_id"]
          },
          {
            foreignKeyName: "public_widget_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_lens_with_shared_users: {
        Args: {
          new_lens_id: number
          parent_lens_id: number
        }
        Returns: undefined
      }
      get_access_type_block:
        | {
            Args: {
              chosen_block_id: number
            }
            Returns: string
          }
        | {
            Args: {
              chosen_block_id: number
              chosen_user_id: string
            }
            Returns: string
          }
      get_access_type_spreadsheet: {
        Args: {
          chosen_spreadsheet_id: number
          chosen_user_id: string
        }
        Returns: string
      }
      get_access_type_whiteboard: {
        Args: {
          chosen_whiteboard_id: number
          chosen_user_id: string
        }
        Returns: string
      }
      get_access_type_widget: {
        Args: {
          chosen_widget_id: number
          chosen_user_id: string
        }
        Returns: string
      }
      get_editor_lens: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          lens_id: number
          name: string
          owner_id: string
          parent_id: number | null
          parents: number[] | null
          public: boolean
          root: number | null
          shared: boolean | null
          updated_at: string
        }[]
      }
      get_embeddings_of_blocks_in_lens: {
        Args: {
          lensid: number
        }
        Returns: {
          block_id: number
          ave_embedding: string
        }[]
      }
      get_most_relevant_chunk: {
        Args: {
          interview_block_id: number
          matchcount: number
        }
        Returns: {
          chunk_id: number
          block_id: number
          content: string
          similarity: number
        }[]
      }
      get_navbar_lenses: {
        Args: {
          user_id_param: string
        }
        Returns: {
          lens_id: number
          name: string
          created_at: string
          updated_at: string
          parent_id: number
          owner_id: string
          shared: boolean
          public: boolean
          root: number
          parents: number[]
          access_type: string
          subspace_only: boolean
        }[]
      }
      get_owner_lens: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          lens_id: number
          name: string
          owner_id: string
          parent_id: number | null
          parents: number[] | null
          public: boolean
          root: number | null
          shared: boolean | null
          updated_at: string
        }[]
      }
      get_reader_lens: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          lens_id: number
          name: string
          owner_id: string
          parent_id: number | null
          parents: number[] | null
          public: boolean
          root: number | null
          shared: boolean | null
          updated_at: string
        }[]
      }
      get_top_chunks: {
        Args: {
          match_count: number
          query_embedding: string
          user_id: string
        }
        Returns: {
          chunk_id: number
          block_id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      get_top_chunks_for_competitive_analysis: {
        Args: {
          parenturl: string
          queryembedding: string
          matchcount: number
        }
        Returns: {
          chunk_id: number
          block_id: number
          content: string
          url: string
          similarity: number
        }[]
      }
      get_top_chunks_for_inbox_google: {
        Args: {
          userid: string
          googleid: string
          query_embedding: string
          match_count: number
        }
        Returns: {
          chunk_id: number
          block_id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      get_top_chunks_for_lens: {
        Args: {
          lensid: number
          match_count: number
          query_embedding: string
        }
        Returns: {
          chunk_id: number
          block_id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      get_top_chunks_for_lens_google: {
        Args: {
          user_id: string
          googleid: string
          query_embedding: string
          match_count: number
          lensid: number
        }
        Returns: {
          chunk_id: number
          block_id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      get_top_chunks_for_lens_published: {
        Args: {
          lensid: number
          match_count: number
          query_embedding: string
        }
        Returns: {
          chunk_id: number
          block_id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      get_top_chunks_for_user_analysis: {
        Args: {
          interview_block_id: number
          queryembedding: string
          matchcount: number
        }
        Returns: {
          chunk_id: number
          block_id: number
          content: string
          similarity: number
        }[]
      }
      get_top_chunks_from_inbox: {
        Args: {
          match_count: number
          query_embedding: string
          id: string
        }
        Returns: {
          chunk_id: number
          block_id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      get_top_chunks_google: {
        Args: {
          user_id: string
          googleid: string
          query_embedding: string
          match_count: number
        }
        Returns: {
          chunk_id: number
          block_id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      increment: {
        Args: {
          x: number
          row_id: string
          lens_id: number
        }
        Returns: undefined
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      match_chunks: {
        Args: {
          query_embedding: string
          match_count?: number
          filter?: Json
        }
        Returns: {
          chunk_id: number
          block_id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents: {
        Args: {
          query_embedding: string
          match_count?: number
          filter?: Json
        }
        Returns: {
          id: string
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_questions: {
        Args: {
          query_embedding: string
          match_count?: number
          filter?: Json
        }
        Returns: {
          id: string
          question_text: string
          metadata: Json
          similarity: number
        }[]
      }
      match_questions_lens: {
        Args: {
          query_embedding: string
          lens_id: number
          match_count?: number
        }
        Returns: {
          id: string
          question: string
          answer: string
          similarity: number
        }[]
      }
      update_plugin_progress: {
        Args: {
          id: number
          new_progress: number
        }
        Returns: {
          success: boolean
          message: string
        }[]
      }
      update_plugin_progress_spreadsheet: {
        Args: {
          id: number
          new_progress: number
        }
        Returns: {
          success: boolean
          message: string
        }[]
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
