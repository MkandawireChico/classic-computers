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
      addresses: {
        Row: {
          city: string
          created_at: string
          customer_id: string
          id: string
          is_default: boolean
          label: string | null
          line1: string
          line2: string | null
          updated_at: string
        }
        Insert: {
          city: string
          created_at?: string
          customer_id: string
          id?: string
          is_default?: boolean
          label?: string | null
          line1: string
          line2?: string | null
          updated_at?: string
        }
        Update: {
          city?: string
          created_at?: string
          customer_id?: string
          id?: string
          is_default?: boolean
          label?: string | null
          line1?: string
          line2?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string
          id: string
          logo_path: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_path?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_path?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          product_id: string
          quantity: number
          variant_id: string | null
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          product_id: string
          quantity: number
          variant_id?: string | null
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          session_token: string | null
          status: Database["public"]["Enums"]["cart_status_enum"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          session_token?: string | null
          status?: Database["public"]["Enums"]["cart_status_enum"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          session_token?: string | null
          status?: Database["public"]["Enums"]["cart_status_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          display_order: number
          id: string
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      corporate_enquiries: {
        Row: {
          additional_requirements: string | null
          budget: number | null
          contact_person: string
          created_at: string
          delivery_location: string | null
          email: string
          id: string
          internal_notes: string | null
          organisation_name: string
          phone: string
          products_required: string | null
          quantity: number | null
          status: Database["public"]["Enums"]["corporate_status_enum"]
          updated_at: string
        }
        Insert: {
          additional_requirements?: string | null
          budget?: number | null
          contact_person: string
          created_at?: string
          delivery_location?: string | null
          email: string
          id?: string
          internal_notes?: string | null
          organisation_name: string
          phone: string
          products_required?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["corporate_status_enum"]
          updated_at?: string
        }
        Update: {
          additional_requirements?: string | null
          budget?: number | null
          contact_person?: string
          created_at?: string
          delivery_location?: string | null
          email?: string
          id?: string
          internal_notes?: string | null
          organisation_name?: string
          phone?: string
          products_required?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["corporate_status_enum"]
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          student_status: Database["public"]["Enums"]["student_status_enum"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          referral_code: string
          student_status?: Database["public"]["Enums"]["student_status_enum"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          student_status?: Database["public"]["Enums"]["student_status_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_categories: {
        Row: {
          category_id: string
          discount_id: string
        }
        Insert: {
          category_id: string
          discount_id: string
        }
        Update: {
          category_id?: string
          discount_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discount_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_categories_discount_id_fkey"
            columns: ["discount_id"]
            isOneToOne: false
            referencedRelation: "discounts"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_products: {
        Row: {
          discount_id: string
          product_id: string
        }
        Insert: {
          discount_id: string
          product_id: string
        }
        Update: {
          discount_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discount_products_discount_id_fkey"
            columns: ["discount_id"]
            isOneToOne: false
            referencedRelation: "discounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      discounts: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          is_active: boolean
          max_discount_amount: number | null
          min_order_total: number | null
          min_quantity: number | null
          name: string
          scope: Database["public"]["Enums"]["discount_scope_enum"]
          starts_at: string | null
          type: Database["public"]["Enums"]["discount_type_enum"]
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_order_total?: number | null
          min_quantity?: number | null
          name: string
          scope: Database["public"]["Enums"]["discount_scope_enum"]
          starts_at?: string | null
          type: Database["public"]["Enums"]["discount_type_enum"]
          updated_at?: string
          value: number
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_order_total?: number | null
          min_quantity?: number | null
          name?: string
          scope?: Database["public"]["Enums"]["discount_scope_enum"]
          starts_at?: string | null
          type?: Database["public"]["Enums"]["discount_type_enum"]
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          created_at: string
          customer_id: string | null
          email: string | null
          id: string
          internal_notes: string | null
          message: string
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["enquiry_status_enum"]
          topic: Database["public"]["Enums"]["enquiry_topic_enum"]
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          email?: string | null
          id?: string
          internal_notes?: string | null
          message: string
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["enquiry_status_enum"]
          topic: Database["public"]["Enums"]["enquiry_topic_enum"]
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          email?: string | null
          id?: string
          internal_notes?: string | null
          message?: string
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["enquiry_status_enum"]
          topic?: Database["public"]["Enums"]["enquiry_topic_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          created_at: string
          id: string
          low_stock_threshold: number
          product_id: string
          quantity_on_hand: number
          quantity_reserved: number
          status: Database["public"]["Enums"]["inventory_status_enum"]
          updated_at: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          low_stock_threshold?: number
          product_id: string
          quantity_on_hand?: number
          quantity_reserved?: number
          status?: Database["public"]["Enums"]["inventory_status_enum"]
          updated_at?: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          low_stock_threshold?: number
          product_id?: string
          quantity_on_hand?: number
          quantity_reserved?: number
          status?: Database["public"]["Enums"]["inventory_status_enum"]
          updated_at?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          inventory_id: string
          movement_type: Database["public"]["Enums"]["movement_type_enum"]
          note: string | null
          quantity_delta: number
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          inventory_id: string
          movement_type: Database["public"]["Enums"]["movement_type_enum"]
          note?: string | null
          quantity_delta: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          inventory_id?: string
          movement_type?: Database["public"]["Enums"]["movement_type_enum"]
          note?: string | null
          quantity_delta?: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          recipient_role_id: string | null
          recipient_user_id: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_role_id?: string | null
          recipient_user_id?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_role_id?: string | null
          recipient_user_id?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_role_id_fkey"
            columns: ["recipient_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          discount_amount: number
          id: string
          line_total: number
          order_id: string
          product_id: string
          product_name_snapshot: string
          quantity: number
          sku_snapshot: string
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          discount_amount?: number
          id?: string
          line_total: number
          order_id: string
          product_id: string
          product_name_snapshot: string
          quantity: number
          sku_snapshot: string
          unit_price: number
          variant_id?: string | null
        }
        Update: {
          discount_amount?: number
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string
          product_name_snapshot?: string
          quantity?: number
          sku_snapshot?: string
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_status: string | null
          id: string
          note: string | null
          order_id: string
          to_status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          order_id: string
          to_status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          order_id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_payment_transactions: {
        Row: {
          id: string
          order_id: string
          transaction_type: string
          provider: string
          amount: number
          currency: string
          provider_reference: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          transaction_type: string
          provider: string
          amount: number
          currency?: string
          provider_reference?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          transaction_type?: string
          provider?: string
          amount?: number
          currency?: string
          provider_reference?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_payment_history: {
        Row: {
          id: string
          order_id: string
          from_status: Database["public"]["Enums"]["payment_status_enum"] | null
          to_status: Database["public"]["Enums"]["payment_status_enum"]
          changed_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          from_status?: Database["public"]["Enums"]["payment_status_enum"] | null
          to_status: Database["public"]["Enums"]["payment_status_enum"]
          changed_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          from_status?: Database["public"]["Enums"]["payment_status_enum"] | null
          to_status?: Database["public"]["Enums"]["payment_status_enum"]
          changed_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_payment_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          customer_id: string | null
          delivery_address_id: string | null
          delivery_snapshot: Json | null
          discount_total: number
          fulfillment_type: Database["public"]["Enums"]["fulfillment_type_enum"]
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          internal_notes: string | null
          notes: string | null
          order_number: string
          order_status: Database["public"]["Enums"]["order_status_enum"]
          payment_method: string
          payment_status: Database["public"]["Enums"]["payment_status_enum"]
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_id?: string | null
          delivery_address_id?: string | null
          delivery_snapshot?: Json | null
          discount_total?: number
          fulfillment_type: Database["public"]["Enums"]["fulfillment_type_enum"]
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_number: string
          order_status?: Database["public"]["Enums"]["order_status_enum"]
          payment_method: string
          payment_status?: Database["public"]["Enums"]["payment_status_enum"]
          subtotal: number
          total: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          customer_id?: string | null
          delivery_address_id?: string | null
          delivery_snapshot?: Json | null
          discount_total?: number
          fulfillment_type?: Database["public"]["Enums"]["fulfillment_type_enum"]
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_number?: string
          order_status?: Database["public"]["Enums"]["order_status_enum"]
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_status_enum"]
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_address_id_fkey"
            columns: ["delivery_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number
          id: string
          is_primary: boolean
          product_id: string
          storage_path: string
          updated_at: string
          variant_id: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_primary?: boolean
          product_id: string
          storage_path: string
          updated_at?: string
          variant_id?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_primary?: boolean
          product_id?: string
          storage_path?: string
          updated_at?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_specifications: {
        Row: {
          id: string
          product_id: string
          spec_definition_id: string
          value: string
          variant_id: string | null
        }
        Insert: {
          id?: string
          product_id: string
          spec_definition_id: string
          value: string
          variant_id?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          spec_definition_id?: string
          value?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_specifications_spec_definition_id_fkey"
            columns: ["spec_definition_id"]
            isOneToOne: false
            referencedRelation: "specification_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_specifications_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
          price: number
          product_id: string
          sale_price: number | null
          sku: string
          status: Database["public"]["Enums"]["variant_status_enum"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          price: number
          product_id: string
          sale_price?: number | null
          sku: string
          status?: Database["public"]["Enums"]["variant_status_enum"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          price?: number
          product_id?: string
          sale_price?: number | null
          sku?: string
          status?: Database["public"]["Enums"]["variant_status_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_views: {
        Row: {
          customer_id: string | null
          id: string
          product_id: string
          viewed_at: string
        }
        Insert: {
          customer_id?: string | null
          id?: string
          product_id: string
          viewed_at?: string
        }
        Update: {
          customer_id?: string | null
          id?: string
          product_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_views_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_views_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          brand_id: string | null
          category_id: string
          condition: Database["public"]["Enums"]["condition_enum"]
          created_at: string
          description: string | null
          id: string
          is_featured: boolean
          name: string
          product_type: Database["public"]["Enums"]["product_type_enum"]
          raw_attributes: Json
          sale_price: number | null
          seo_description: string | null
          seo_title: string | null
          sku: string
          slug: string
          status: Database["public"]["Enums"]["product_status_enum"]
          updated_at: string
          view_count: number
          warranty_text: string | null
        }
        Insert: {
          base_price: number
          brand_id?: string | null
          category_id: string
          condition?: Database["public"]["Enums"]["condition_enum"]
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          name: string
          product_type: Database["public"]["Enums"]["product_type_enum"]
          raw_attributes?: Json
          sale_price?: number | null
          seo_description?: string | null
          seo_title?: string | null
          sku: string
          slug: string
          status?: Database["public"]["Enums"]["product_status_enum"]
          updated_at?: string
          view_count?: number
          warranty_text?: string | null
        }
        Update: {
          base_price?: number
          brand_id?: string | null
          category_id?: string
          condition?: Database["public"]["Enums"]["condition_enum"]
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          name?: string
          product_type?: Database["public"]["Enums"]["product_type_enum"]
          raw_attributes?: Json
          sale_price?: number | null
          seo_description?: string | null
          seo_title?: string | null
          sku?: string
          slug?: string
          status?: Database["public"]["Enums"]["product_status_enum"]
          updated_at?: string
          view_count?: number
          warranty_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referred_customer_id: string | null
          referred_order_id: string | null
          referrer_customer_id: string
          reward_amount: number | null
          reward_status: Database["public"]["Enums"]["reward_status_enum"]
          status: Database["public"]["Enums"]["referral_status_enum"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          referred_customer_id?: string | null
          referred_order_id?: string | null
          referrer_customer_id: string
          reward_amount?: number | null
          reward_status?: Database["public"]["Enums"]["reward_status_enum"]
          status?: Database["public"]["Enums"]["referral_status_enum"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          referred_customer_id?: string | null
          referred_order_id?: string | null
          referrer_customer_id?: string
          reward_amount?: number | null
          reward_status?: Database["public"]["Enums"]["reward_status_enum"]
          status?: Database["public"]["Enums"]["referral_status_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_customer_id_fkey"
            columns: ["referred_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_order_id_fkey"
            columns: ["referred_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_customer_id_fkey"
            columns: ["referrer_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_bookings: {
        Row: {
          created_at: string
          customer_id: string | null
          end_date: string
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          internal_notes: string | null
          notes: string | null
          quantity: number
          rental_product_id: string
          start_date: string
          status: Database["public"]["Enums"]["rental_status_enum"]
          total_charge: number | null
          tracking_token: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          end_date: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          quantity?: number
          rental_product_id: string
          start_date: string
          status?: Database["public"]["Enums"]["rental_status_enum"]
          total_charge?: number | null
          tracking_token?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          end_date?: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          quantity?: number
          rental_product_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["rental_status_enum"]
          total_charge?: number | null
          tracking_token?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_bookings_rental_product_id_fkey"
            columns: ["rental_product_id"]
            isOneToOne: false
            referencedRelation: "rental_products"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_products: {
        Row: {
          created_at: string
          daily_rate: number | null
          deposit_amount: number | null
          id: string
          is_available: boolean
          monthly_rate: number | null
          product_id: string
          updated_at: string
          weekly_rate: number | null
        }
        Insert: {
          created_at?: string
          daily_rate?: number | null
          deposit_amount?: number | null
          id?: string
          is_available?: boolean
          monthly_rate?: number | null
          product_id: string
          updated_at?: string
          weekly_rate?: number | null
        }
        Update: {
          created_at?: string
          daily_rate?: number | null
          deposit_amount?: number | null
          id?: string
          is_available?: boolean
          monthly_rate?: number | null
          product_id?: string
          updated_at?: string
          weekly_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_status_history: {
        Row: {
          booking_id: string
          changed_by: string | null
          created_at: string
          from_status: string | null
          id: string
          note: string | null
          to_status: string
        }
        Insert: {
          booking_id: string
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          to_status: string
        }
        Update: {
          booking_id?: string
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_status_history_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "rental_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_parts: {
        Row: {
          cost: number
          id: string
          inventory_movement_id: string | null
          part_name: string
          product_id: string | null
          quantity: number
          ticket_id: string
          variant_id: string | null
        }
        Insert: {
          cost?: number
          id?: string
          inventory_movement_id?: string | null
          part_name: string
          product_id?: string | null
          quantity?: number
          ticket_id: string
          variant_id?: string | null
        }
        Update: {
          cost?: number
          id?: string
          inventory_movement_id?: string | null
          part_name?: string
          product_id?: string | null
          quantity?: number
          ticket_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repair_parts_inventory_movement_id_fkey"
            columns: ["inventory_movement_id"]
            isOneToOne: false
            referencedRelation: "inventory_movements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_parts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_parts_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "repair_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_parts_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_tickets: {
        Row: {
          accessories_received: string | null
          assigned_technician_id: string | null
          brand: string | null
          created_at: string
          customer_id: string | null
          device_type: string
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          model: string | null
          problem_description: string
          quote_amount: number | null
          quote_approved_at: string | null
          serial_number: string | null
          status: Database["public"]["Enums"]["repair_status_enum"]
          ticket_number: string
          tracking_token: string | null
          updated_at: string
        }
        Insert: {
          accessories_received?: string | null
          assigned_technician_id?: string | null
          brand?: string | null
          created_at?: string
          customer_id?: string | null
          device_type: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          model?: string | null
          problem_description: string
          quote_amount?: number | null
          quote_approved_at?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["repair_status_enum"]
          ticket_number: string
          tracking_token?: string | null
          updated_at?: string
        }
        Update: {
          accessories_received?: string | null
          assigned_technician_id?: string | null
          brand?: string | null
          created_at?: string
          customer_id?: string | null
          device_type?: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          model?: string | null
          problem_description?: string
          quote_amount?: number | null
          quote_approved_at?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["repair_status_enum"]
          ticket_number?: string
          tracking_token?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "repair_tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_updates: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_internal: boolean
          note: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_internal?: boolean
          note: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_internal?: boolean
          note?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "repair_updates_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "repair_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          customer_id: string | null
          id: string
          product_id: string
          rating: number
          status: Database["public"]["Enums"]["review_status_enum"]
          title: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          product_id: string
          rating: number
          status?: Database["public"]["Enums"]["review_status_enum"]
          title?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          product_id?: string
          rating?: number
          status?: Database["public"]["Enums"]["review_status_enum"]
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      site_media: {
        Row: {
          alt_text: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          placement: Database["public"]["Enums"]["site_media_placement_enum"]
          storage_path: string
          title: string | null
          updated_at: string
        }
        Insert: {
          alt_text: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          placement: Database["public"]["Enums"]["site_media_placement_enum"]
          storage_path: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          alt_text?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          placement?: Database["public"]["Enums"]["site_media_placement_enum"]
          storage_path?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          is_public: boolean
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          is_public?: boolean
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          id?: string
          is_public?: boolean
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      specification_definitions: {
        Row: {
          data_type: Database["public"]["Enums"]["spec_data_type_enum"]
          display_order: number
          id: string
          key: string
          label: string
          product_type: Database["public"]["Enums"]["product_type_enum"]
          unit: string | null
        }
        Insert: {
          data_type: Database["public"]["Enums"]["spec_data_type_enum"]
          display_order?: number
          id?: string
          key: string
          label: string
          product_type: Database["public"]["Enums"]["product_type_enum"]
          unit?: string | null
        }
        Update: {
          data_type?: Database["public"]["Enums"]["spec_data_type_enum"]
          display_order?: number
          id?: string
          key?: string
          label?: string
          product_type?: Database["public"]["Enums"]["product_type_enum"]
          unit?: string | null
        }
        Relationships: []
      }
      student_verifications: {
        Row: {
          created_at: string
          customer_id: string
          document_path: string | null
          email: string
          expires_at: string | null
          full_name: string
          id: string
          institution: string
          phone: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["verification_status_enum"]
          student_id_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          document_path?: string | null
          email: string
          expires_at?: string | null
          full_name: string
          id?: string
          institution: string
          phone: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status_enum"]
          student_id_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          document_path?: string | null
          email?: string
          expires_at?: string | null
          full_name?: string
          id?: string
          institution?: string
          phone?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status_enum"]
          student_id_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_verifications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          added_at: string
          id: string
          product_id: string
          variant_id: string | null
          wishlist_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          product_id: string
          variant_id?: string | null
          wishlist_id: string
        }
        Update: {
          added_at?: string
          id?: string
          product_id?: string
          variant_id?: string | null
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          customer_id: string
          id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_inventory_movement: {
        Args: {
          p_inventory_id: string
          p_movement_type: Database["public"]["Enums"]["movement_type_enum"]
          p_note?: string
          p_quantity_delta: number
          p_reference_id?: string
          p_reference_type?: string
        }
        Returns: undefined
      }
      create_order: {
        Args: {
          p_cart_id: string
          p_delivery_address_id?: string
          p_fulfillment_type: Database["public"]["Enums"]["fulfillment_type_enum"]
          p_guest_delivery_city?: string
          p_guest_delivery_district?: string
          p_guest_delivery_line1?: string
          p_guest_delivery_line2?: string
          p_guest_email?: string
          p_guest_name?: string
          p_guest_phone?: string
          p_notes?: string
          p_payment_method: string
        }
        Returns: {
          order_id: string
          order_number: string
        }[]
      }
      generate_order_number: { Args: never; Returns: string }
      generate_referral_code: { Args: never; Returns: string }
      generate_ticket_number: { Args: never; Returns: string }
      generate_tracking_token: { Args: never; Returns: string }
      has_permission: {
        Args: { permission_key: string; uid: string }
        Returns: boolean
      }
      has_role: { Args: { role_name: string; uid: string }; Returns: boolean }
      record_order_payment_transaction: {
        Args: {
          p_order_id: string
          p_transaction_type: string
          p_provider: string
          p_amount: number
          p_currency?: string
          p_provider_reference?: string | null
        }
        Returns: string
      }
      log_audit_event: {
        Args: {
          p_action: string
          p_entity_id: string
          p_entity_type: string
          p_metadata?: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      cart_status_enum: "active" | "converted" | "abandoned"
      condition_enum: "new" | "refurbished" | "used"
      corporate_status_enum:
        | "new"
        | "contacted"
        | "quoted"
        | "negotiating"
        | "approved"
        | "completed"
        | "cancelled"
      discount_scope_enum:
        | "all"
        | "category"
        | "product"
        | "student"
        | "campaign"
      discount_type_enum: "percentage" | "fixed"
      enquiry_status_enum: "new" | "read" | "responded" | "closed"
      enquiry_topic_enum:
        | "product"
        | "stock"
        | "pricing"
        | "rental"
        | "repair"
        | "corporate"
        | "order_assistance"
        | "other"
      fulfillment_type_enum: "pickup" | "delivery"
      inventory_status_enum:
        | "in_stock"
        | "low_stock"
        | "out_of_stock"
        | "discontinued"
        | "coming_soon"
      movement_type_enum:
        | "opening"
        | "sale"
        | "return"
        | "adjustment"
        | "rental_checkout"
        | "rental_return"
        | "damage"
        | "lost"
        | "correction"
      order_status_enum:
        | "pending"
        | "confirmed"
        | "processing"
        | "ready_for_pickup"
        | "out_for_delivery"
        | "completed"
        | "cancelled"
        | "refunded"
      payment_status_enum: "unpaid" | "paid" | "refunded" | "partial"
      product_status_enum: "draft" | "published" | "archived"
      product_type_enum:
        | "laptop"
        | "desktop"
        | "macbook"
        | "phone"
        | "tablet"
        | "monitor"
        | "printer"
        | "accessory"
        | "networking"
        | "other"
      referral_status_enum: "pending" | "qualified" | "rewarded" | "rejected"
      rental_status_enum:
        | "requested"
        | "approved"
        | "ready"
        | "active"
        | "returned"
        | "overdue"
        | "cancelled"
        | "damaged"
        | "lost"
      repair_status_enum:
        | "checked_in"
        | "diagnosing"
        | "quoted"
        | "awaiting_approval"
        | "in_progress"
        | "ready_for_pickup"
        | "completed"
        | "cancelled"
      review_status_enum: "pending" | "approved" | "rejected" | "hidden"
      reward_status_enum: "pending" | "issued"
      site_media_placement_enum:
        | "logo"
        | "homepage_hero"
        | "homepage_banner"
        | "store_photo"
        | "rental_promo"
        | "corporate_promo"
        | "footer_logo"
        | "other"
      spec_data_type_enum: "text" | "number" | "boolean" | "enum"
      student_status_enum:
        | "none"
        | "pending"
        | "approved"
        | "rejected"
        | "expired"
      variant_status_enum: "active" | "discontinued"
      verification_status_enum: "pending" | "approved" | "rejected" | "expired"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      cart_status_enum: ["active", "converted", "abandoned"],
      condition_enum: ["new", "refurbished", "used"],
      corporate_status_enum: [
        "new",
        "contacted",
        "quoted",
        "negotiating",
        "approved",
        "completed",
        "cancelled",
      ],
      discount_scope_enum: [
        "all",
        "category",
        "product",
        "student",
        "campaign",
      ],
      discount_type_enum: ["percentage", "fixed"],
      enquiry_status_enum: ["new", "read", "responded", "closed"],
      enquiry_topic_enum: [
        "product",
        "stock",
        "pricing",
        "rental",
        "repair",
        "corporate",
        "order_assistance",
        "other",
      ],
      fulfillment_type_enum: ["pickup", "delivery"],
      inventory_status_enum: [
        "in_stock",
        "low_stock",
        "out_of_stock",
        "discontinued",
        "coming_soon",
      ],
      movement_type_enum: [
        "opening",
        "sale",
        "return",
        "adjustment",
        "rental_checkout",
        "rental_return",
        "damage",
        "lost",
        "correction",
      ],
      order_status_enum: [
        "pending",
        "confirmed",
        "processing",
        "ready_for_pickup",
        "out_for_delivery",
        "completed",
        "cancelled",
        "refunded",
      ],
      payment_status_enum: ["unpaid", "paid", "refunded", "partial"],
      product_status_enum: ["draft", "published", "archived"],
      product_type_enum: [
        "laptop",
        "desktop",
        "macbook",
        "phone",
        "tablet",
        "monitor",
        "printer",
        "accessory",
        "networking",
        "other",
      ],
      referral_status_enum: ["pending", "qualified", "rewarded", "rejected"],
      rental_status_enum: [
        "requested",
        "approved",
        "ready",
        "active",
        "returned",
        "overdue",
        "cancelled",
        "damaged",
        "lost",
      ],
      repair_status_enum: [
        "checked_in",
        "diagnosing",
        "quoted",
        "awaiting_approval",
        "in_progress",
        "ready_for_pickup",
        "completed",
        "cancelled",
      ],
      review_status_enum: ["pending", "approved", "rejected", "hidden"],
      reward_status_enum: ["pending", "issued"],
      site_media_placement_enum: [
        "logo",
        "homepage_hero",
        "homepage_banner",
        "store_photo",
        "rental_promo",
        "corporate_promo",
        "footer_logo",
        "other",
      ],
      spec_data_type_enum: ["text", "number", "boolean", "enum"],
      student_status_enum: [
        "none",
        "pending",
        "approved",
        "rejected",
        "expired",
      ],
      variant_status_enum: ["active", "discontinued"],
      verification_status_enum: ["pending", "approved", "rejected", "expired"],
    },
  },
} as const

export type SiteMediaRow = Database["public"]["Tables"]["site_media"]["Row"];
