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
      appetizers: {
        Row: {
          created_at: string
          id: string
          image_url: string
          modifiers: Json
          name_ar: string
          name_en: string
          price_with_vat: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          modifiers?: Json
          name_ar: string
          name_en: string
          price_with_vat: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          modifiers?: Json
          name_ar?: string
          name_en?: string
          price_with_vat?: number
          updated_at?: string
        }
        Relationships: []
      }
      beverages: {
        Row: {
          created_at: string
          id: string
          image_url: string
          modifiers: Json
          name_ar: string
          name_en: string
          price_with_vat: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          modifiers?: Json
          name_ar: string
          name_en: string
          price_with_vat: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          modifiers?: Json
          name_ar?: string
          name_en?: string
          price_with_vat?: number
          updated_at?: string
        }
        Relationships: []
      }
      burgers: {
        Row: {
          created_at: string
          id: string
          image_url: string
          modifiers: Json
          name_ar: string
          name_en: string
          price_with_vat: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          modifiers?: Json
          name_ar: string
          name_en: string
          price_with_vat: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          modifiers?: Json
          name_ar?: string
          name_en?: string
          price_with_vat?: number
          updated_at?: string
        }
        Relationships: []
      }
      canceled_orders: {
        Row: {
          canceled_at: string
          canceled_by: string
          id: string
          order_data: Json
          original_order_id: string
          reason: string | null
        }
        Insert: {
          canceled_at?: string
          canceled_by: string
          id?: string
          order_data: Json
          original_order_id: string
          reason?: string | null
        }
        Update: {
          canceled_at?: string
          canceled_by?: string
          id?: string
          order_data?: Json
          original_order_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "canceled_orders_canceled_by_fkey"
            columns: ["canceled_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "canceled_orders_original_order_id_fkey"
            columns: ["original_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_orders: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          order_number: string
          order_total: number
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          order_number: string
          order_total: number
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          order_number?: string
          order_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "customer_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          created_by: string
          id: string
          last_order_at: string | null
          name: string
          order_count: number
          phone: string
          total_purchases: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by: string
          id?: string
          last_order_at?: string | null
          name: string
          order_count?: number
          phone: string
          total_purchases?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string
          id?: string
          last_order_at?: string | null
          name?: string
          order_count?: number
          phone?: string
          total_purchases?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      eod_reports: {
        Row: {
          average_order_value: number
          best_selling_items: Json | null
          cancelled_orders: number
          card_orders_count: number
          cash_orders_count: number
          completed_orders: number
          created_at: string
          end_date_time: string
          generated_at: string
          generated_by: string
          hourly_sales: Json | null
          id: string
          order_cancellation_rate: number
          order_completion_rate: number
          payment_breakdown: Json | null
          peak_hour: string | null
          pending_orders: number
          report_date: string
          report_number: string | null
          report_type: Database["public"]["Enums"]["report_type"]
          start_date_time: string
          total_card_orders: number
          total_cash_orders: number
          total_orders: number
          total_revenue: number
          total_with_vat: number
          total_without_vat: number
          updated_at: string
          vat_amount: number
        }
        Insert: {
          average_order_value?: number
          best_selling_items?: Json | null
          cancelled_orders?: number
          card_orders_count?: number
          cash_orders_count?: number
          completed_orders?: number
          created_at?: string
          end_date_time: string
          generated_at?: string
          generated_by: string
          hourly_sales?: Json | null
          id?: string
          order_cancellation_rate?: number
          order_completion_rate?: number
          payment_breakdown?: Json | null
          peak_hour?: string | null
          pending_orders?: number
          report_date: string
          report_number?: string | null
          report_type?: Database["public"]["Enums"]["report_type"]
          start_date_time: string
          total_card_orders?: number
          total_cash_orders?: number
          total_orders?: number
          total_revenue?: number
          total_with_vat?: number
          total_without_vat?: number
          updated_at?: string
          vat_amount?: number
        }
        Update: {
          average_order_value?: number
          best_selling_items?: Json | null
          cancelled_orders?: number
          card_orders_count?: number
          cash_orders_count?: number
          completed_orders?: number
          created_at?: string
          end_date_time?: string
          generated_at?: string
          generated_by?: string
          hourly_sales?: Json | null
          id?: string
          order_cancellation_rate?: number
          order_completion_rate?: number
          payment_breakdown?: Json | null
          peak_hour?: string | null
          pending_orders?: number
          report_date?: string
          report_number?: string | null
          report_type?: Database["public"]["Enums"]["report_type"]
          start_date_time?: string
          total_card_orders?: number
          total_cash_orders?: number
          total_orders?: number
          total_revenue?: number
          total_with_vat?: number
          total_without_vat?: number
          updated_at?: string
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "eod_reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_modifiers: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: string
          menu_item_id: string
          menu_item_type: string
          name: string
          price: number
          type: Database["public"]["Enums"]["modifier_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: string
          menu_item_id: string
          menu_item_type: string
          name: string
          price?: number
          type: Database["public"]["Enums"]["modifier_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: string
          menu_item_id?: string
          menu_item_type?: string
          name?: string
          price?: number
          type?: Database["public"]["Enums"]["modifier_type"]
          updated_at?: string
        }
        Relationships: []
      }
      mini_pies: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          modifiers: Json | null
          name_ar: string
          name_en: string
          price_with_vat: string
          size: Database["public"]["Enums"]["mini_pie_size"]
          type: Database["public"]["Enums"]["mini_pie_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string
          modifiers?: Json | null
          name_ar: string
          name_en: string
          price_with_vat: string
          size: Database["public"]["Enums"]["mini_pie_size"]
          type: Database["public"]["Enums"]["mini_pie_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          modifiers?: Json | null
          name_ar?: string
          name_en?: string
          price_with_vat?: string
          size?: Database["public"]["Enums"]["mini_pie_size"]
          type?: Database["public"]["Enums"]["mini_pie_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      modified_orders: {
        Row: {
          id: string
          modification_type: Database["public"]["Enums"]["modification_type"]
          modified_at: string
          modified_by: string
          new_data: Json
          original_data: Json
          original_order_id: string
        }
        Insert: {
          id?: string
          modification_type: Database["public"]["Enums"]["modification_type"]
          modified_at?: string
          modified_by: string
          new_data: Json
          original_data: Json
          original_order_id: string
        }
        Update: {
          id?: string
          modification_type?: Database["public"]["Enums"]["modification_type"]
          modified_at?: string
          modified_by?: string
          new_data?: Json
          original_data?: Json
          original_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "modified_orders_modified_by_fkey"
            columns: ["modified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modified_orders_original_order_id_fkey"
            columns: ["original_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_item_modifiers: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string
          menu_item_type: string
          modifier_id: string
          modifier_name: string
          modifier_type: Database["public"]["Enums"]["modifier_type"]
          order_id: string
          price_at_time: number
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id: string
          menu_item_type: string
          modifier_id: string
          modifier_name: string
          modifier_type: Database["public"]["Enums"]["modifier_type"]
          order_id: string
          price_at_time: number
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string
          menu_item_type?: string
          modifier_id?: string
          modifier_name?: string
          modifier_type?: Database["public"]["Enums"]["modifier_type"]
          order_id?: string
          price_at_time?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_item_modifiers_modifier_id_menu_item_modifiers_id_fk"
            columns: ["modifier_id"]
            isOneToOne: false
            referencedRelation: "menu_item_modifiers"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          created_by: string
          customer_name: string | null
          id: string
          items: Json
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          status: Database["public"]["Enums"]["orders_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          customer_name?: string | null
          id?: string
          items: Json
          order_number: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["orders_status"]
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          customer_name?: string | null
          id?: string
          items?: Json
          order_number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["orders_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pies: {
        Row: {
          created_at: string
          id: string
          image_url: string
          modifiers: Json | null
          name_ar: string
          name_en: string
          price_with_vat: number
          size: Database["public"]["Enums"]["pie_size"]
          type: Database["public"]["Enums"]["pie_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          modifiers?: Json | null
          name_ar: string
          name_en: string
          price_with_vat: number
          size: Database["public"]["Enums"]["pie_size"]
          type: Database["public"]["Enums"]["pie_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          modifiers?: Json | null
          name_ar?: string
          name_en?: string
          price_with_vat?: number
          size?: Database["public"]["Enums"]["pie_size"]
          type?: Database["public"]["Enums"]["pie_type"]
          updated_at?: string
        }
        Relationships: []
      }
      pizzas: {
        Row: {
          created_at: string
          crust: Database["public"]["Enums"]["pizza_crust"] | null
          extras: Database["public"]["Enums"]["pizza_extras"] | null
          id: string
          image_url: string
          modifiers: Json | null
          name_ar: string
          name_en: string
          price_with_vat: number
          type: Database["public"]["Enums"]["pizza_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          crust?: Database["public"]["Enums"]["pizza_crust"] | null
          extras?: Database["public"]["Enums"]["pizza_extras"] | null
          id?: string
          image_url: string
          modifiers?: Json | null
          name_ar: string
          name_en: string
          price_with_vat: number
          type: Database["public"]["Enums"]["pizza_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          crust?: Database["public"]["Enums"]["pizza_crust"] | null
          extras?: Database["public"]["Enums"]["pizza_extras"] | null
          id?: string
          image_url?: string
          modifiers?: Json | null
          name_ar?: string
          name_en?: string
          price_with_vat?: number
          type?: Database["public"]["Enums"]["pizza_type"]
          updated_at?: string
        }
        Relationships: []
      }
      sandwiches: {
        Row: {
          created_at: string
          id: string
          image_url: string
          modifiers: Json | null
          name_ar: string
          name_en: string
          price_with_vat: number
          size: Database["public"]["Enums"]["sandwich_size"]
          type: Database["public"]["Enums"]["sandwich_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          modifiers?: Json | null
          name_ar: string
          name_en: string
          price_with_vat: number
          size: Database["public"]["Enums"]["sandwich_size"]
          type: Database["public"]["Enums"]["sandwich_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          modifiers?: Json | null
          name_ar?: string
          name_en?: string
          price_with_vat?: number
          size?: Database["public"]["Enums"]["sandwich_size"]
          type?: Database["public"]["Enums"]["sandwich_type"]
          updated_at?: string
        }
        Relationships: []
      }
      shawarmas: {
        Row: {
          created_at: string
          id: string
          image_url: string
          modifiers: Json
          name_ar: string
          name_en: string
          price_with_vat: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          modifiers?: Json
          name_ar: string
          name_en: string
          price_with_vat: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          modifiers?: Json
          name_ar?: string
          name_en?: string
          price_with_vat?: number
          updated_at?: string
        }
        Relationships: []
      }
      side_orders: {
        Row: {
          created_at: string
          id: string
          image_url: string
          modifiers: Json
          name_ar: string
          name_en: string
          price_with_vat: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          modifiers?: Json
          name_ar: string
          name_en: string
          price_with_vat: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          modifiers?: Json
          name_ar?: string
          name_en?: string
          price_with_vat?: number
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_eod_report_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_next_eod_report_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      has_role_or_higher: {
        Args: { required_role: string }
        Returns: boolean
      }
      set_user_role_claim: {
        Args: { role: string; user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      appetizer_type:
        | "Hummus"
        | "Falafel"
        | "Stuffed Grape Leaves"
        | "Mozzarella Sticks"
        | "Chicken Wings"
        | "Spring Rolls"
      beverage_type:
        | "Coke"
        | "Pepsi"
        | "Sprite"
        | "Fanta"
        | "Water"
        | "Juice"
        | "Tea"
        | "Coffee"
      burger_size: "single" | "double"
      burger_type:
        | "Beef Burger"
        | "Chicken Burger"
        | "Cheese Burger"
        | "Double Burger"
        | "Veggie Burger"
      eod_order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "ready"
        | "completed"
        | "cancelled"
      item_type: "pizza" | "pie" | "sandwich" | "mini_pie"
      mini_pie_size: "small" | "medium" | "large"
      mini_pie_type:
        | "Mini Zaatar Pie"
        | "Mini Cheese Pie"
        | "Mini Spinach Pie"
        | "Mini Meat Pie (Ba'lakiya style)"
        | "Mini Halloumi Cheese Pie"
        | "Mini Hot Dog Pie"
        | "Mini Pizza Pie"
      modification_type:
        | "item_added"
        | "item_removed"
        | "quantity_changed"
        | "item_replaced"
        | "multiple_changes"
      modifier_type: "extra" | "without"
      orders_status: "pending" | "completed" | "canceled" | "modified"
      payment_method: "cash" | "card" | "mixed"
      pie_size: "small" | "medium" | "large"
      pie_type:
        | "Akkawi Cheese"
        | "Halloumi Cheese"
        | "Cream Cheese"
        | "Zaatar"
        | "Labneh & Vegetables"
        | "Muhammara + Akkawi Cheese + Zaatar"
        | "Akkawi Cheese + Zaatar"
        | "Labneh + Zaatar"
        | "Halloumi Cheese + Zaatar"
        | "Sweet Cheese + Akkawi + Mozzarella"
      pizza_crust: "original" | "thin"
      pizza_extras:
        | "cheese"
        | "vegetables"
        | "Pepperoni"
        | "Mortadella"
        | "Chicken"
      pizza_type:
        | "Margherita"
        | "Vegetable"
        | "Pepperoni"
        | "Mortadella"
        | "Chicken"
      report_type: "daily" | "custom" | "weekly" | "monthly"
      sandwich_size: "small" | "medium" | "large"
      sandwich_type:
        | "Beef Sandwich with Cheese"
        | "Chicken Sandwich with Cheese"
        | "Muhammara Sandwich with Cheese"
      shawarma_size: "small" | "medium" | "large"
      shawarma_type: "Chicken Shawarma" | "Beef Shawarma" | "Mix Shawarma"
      side_order_type:
        | "Fries"
        | "Potato Wedges"
        | "Onion Rings"
        | "Coleslaw"
        | "Garlic Bread"
        | "Salad"
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
    Enums: {
      appetizer_type: [
        "Hummus",
        "Falafel",
        "Stuffed Grape Leaves",
        "Mozzarella Sticks",
        "Chicken Wings",
        "Spring Rolls",
      ],
      beverage_type: [
        "Coke",
        "Pepsi",
        "Sprite",
        "Fanta",
        "Water",
        "Juice",
        "Tea",
        "Coffee",
      ],
      burger_size: ["single", "double"],
      burger_type: [
        "Beef Burger",
        "Chicken Burger",
        "Cheese Burger",
        "Double Burger",
        "Veggie Burger",
      ],
      eod_order_status: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "completed",
        "cancelled",
      ],
      item_type: ["pizza", "pie", "sandwich", "mini_pie"],
      mini_pie_size: ["small", "medium", "large"],
      mini_pie_type: [
        "Mini Zaatar Pie",
        "Mini Cheese Pie",
        "Mini Spinach Pie",
        "Mini Meat Pie (Ba'lakiya style)",
        "Mini Halloumi Cheese Pie",
        "Mini Hot Dog Pie",
        "Mini Pizza Pie",
      ],
      modification_type: [
        "item_added",
        "item_removed",
        "quantity_changed",
        "item_replaced",
        "multiple_changes",
      ],
      modifier_type: ["extra", "without"],
      orders_status: ["pending", "completed", "canceled", "modified"],
      payment_method: ["cash", "card", "mixed"],
      pie_size: ["small", "medium", "large"],
      pie_type: [
        "Akkawi Cheese",
        "Halloumi Cheese",
        "Cream Cheese",
        "Zaatar",
        "Labneh & Vegetables",
        "Muhammara + Akkawi Cheese + Zaatar",
        "Akkawi Cheese + Zaatar",
        "Labneh + Zaatar",
        "Halloumi Cheese + Zaatar",
        "Sweet Cheese + Akkawi + Mozzarella",
      ],
      pizza_crust: ["original", "thin"],
      pizza_extras: [
        "cheese",
        "vegetables",
        "Pepperoni",
        "Mortadella",
        "Chicken",
      ],
      pizza_type: [
        "Margherita",
        "Vegetable",
        "Pepperoni",
        "Mortadella",
        "Chicken",
      ],
      report_type: ["daily", "custom", "weekly", "monthly"],
      sandwich_size: ["small", "medium", "large"],
      sandwich_type: [
        "Beef Sandwich with Cheese",
        "Chicken Sandwich with Cheese",
        "Muhammara Sandwich with Cheese",
      ],
      shawarma_size: ["small", "medium", "large"],
      shawarma_type: ["Chicken Shawarma", "Beef Shawarma", "Mix Shawarma"],
      side_order_type: [
        "Fries",
        "Potato Wedges",
        "Onion Rings",
        "Coleslaw",
        "Garlic Bread",
        "Salad",
      ],
    },
  },
} as const

