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
            business_order_counters: {
                Row: {
                    business_id: string
                    last_serial: number
                }
                Insert: {
                    business_id: string
                    last_serial?: number
                }
                Update: {
                    business_id?: string
                    last_serial?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "business_order_counters_business_id_fkey"
                        columns: ["business_id"]
                        isOneToOne: true
                        referencedRelation: "businesses"
                        referencedColumns: ["id"]
                    },
                ]
            }
            business_users: {
                Row: {
                    business_id: string
                    created_at: string
                    id: string
                    invited_at: string | null
                    is_active: boolean | null
                    joined_at: string | null
                    permissions: Json | null
                    role: string
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    business_id: string
                    created_at?: string
                    id?: string
                    invited_at?: string | null
                    is_active?: boolean | null
                    joined_at?: string | null
                    permissions?: Json | null
                    role?: string
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    business_id?: string
                    created_at?: string
                    id?: string
                    invited_at?: string | null
                    is_active?: boolean | null
                    joined_at?: string | null
                    permissions?: Json | null
                    role?: string
                    updated_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "business_users_business_id_businesses_id_fk"
                        columns: ["business_id"]
                        isOneToOne: false
                        referencedRelation: "businesses"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "business_users_user_id_users_id_fk"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            businesses: {
                Row: {
                    address: string | null
                    created_at: string
                    currency: string | null
                    description: string | null
                    email: string | null
                    id: string
                    is_active: boolean | null
                    logo_url: string | null
                    name: string
                    phone: string | null
                    settings: Json | null
                    slug: string | null
                    timezone: string | null
                    updated_at: string
                    website: string | null
                }
                Insert: {
                    address?: string | null
                    created_at?: string
                    currency?: string | null
                    description?: string | null
                    email?: string | null
                    id?: string
                    is_active?: boolean | null
                    logo_url?: string | null
                    name: string
                    phone?: string | null
                    settings?: Json | null
                    slug?: string | null
                    timezone?: string | null
                    updated_at?: string
                    website?: string | null
                }
                Update: {
                    address?: string | null
                    created_at?: string
                    currency?: string | null
                    description?: string | null
                    email?: string | null
                    id?: string
                    is_active?: boolean | null
                    logo_url?: string | null
                    name?: string
                    phone?: string | null
                    settings?: Json | null
                    slug?: string | null
                    timezone?: string | null
                    updated_at?: string
                    website?: string | null
                }
                Relationships: []
            }
            canceled_orders: {
                Row: {
                    business_id: string
                    canceled_at: string
                    canceled_by: string
                    id: string
                    order_data: Json
                    original_order_id: string
                    reason: string | null
                }
                Insert: {
                    business_id: string
                    canceled_at?: string
                    canceled_by: string
                    id?: string
                    order_data: Json
                    original_order_id: string
                    reason?: string | null
                }
                Update: {
                    business_id?: string
                    canceled_at?: string
                    canceled_by?: string
                    id?: string
                    order_data?: Json
                    original_order_id?: string
                    reason?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "canceled_orders_business_id_businesses_id_fk"
                        columns: ["business_id"]
                        isOneToOne: false
                        referencedRelation: "businesses"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "canceled_orders_canceled_by_users_id_fk"
                        columns: ["canceled_by"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            categories: {
                Row: {
                    business_id: string
                    color: string | null
                    created_at: string
                    description: string | null
                    icon: string | null
                    id: string
                    image_url: string | null
                    is_active: boolean | null
                    metadata: Json | null
                    name: string
                    slug: string | null
                    sort_order: number | null
                    updated_at: string
                }
                Insert: {
                    business_id: string
                    color?: string | null
                    created_at?: string
                    description?: string | null
                    icon?: string | null
                    id?: string
                    image_url?: string | null
                    is_active?: boolean | null
                    metadata?: Json | null
                    name: string
                    slug?: string | null
                    sort_order?: number | null
                    updated_at?: string
                }
                Update: {
                    business_id?: string
                    color?: string | null
                    created_at?: string
                    description?: string | null
                    icon?: string | null
                    id?: string
                    image_url?: string | null
                    is_active?: boolean | null
                    metadata?: Json | null
                    name?: string
                    slug?: string | null
                    sort_order?: number | null
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "categories_business_id_businesses_id_fk"
                        columns: ["business_id"]
                        isOneToOne: false
                        referencedRelation: "businesses"
                        referencedColumns: ["id"]
                    },
                ]
            }
            modified_orders: {
                Row: {
                    business_id: string
                    id: string
                    modification_type: Database["public"]["Enums"]["modification_type"]
                    modified_at: string
                    modified_by: string
                    new_data: Json
                    original_data: Json
                    original_order_id: string
                }
                Insert: {
                    business_id: string
                    id?: string
                    modification_type: Database["public"]["Enums"]["modification_type"]
                    modified_at?: string
                    modified_by: string
                    new_data: Json
                    original_data: Json
                    original_order_id: string
                }
                Update: {
                    business_id?: string
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
                        foreignKeyName: "modified_orders_business_id_businesses_id_fk"
                        columns: ["business_id"]
                        isOneToOne: false
                        referencedRelation: "businesses"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "modified_orders_modified_by_users_id_fk"
                        columns: ["modified_by"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            orders: {
                Row: {
                    business_id: string
                    card_amount: number | null
                    cash_amount: number | null
                    cash_received: number | null
                    change_amount: number | null
                    created_at: string
                    created_by: string
                    customer_name: string | null
                    daily_serial: string | null
                    delivery_platform:
                    | Database["public"]["Enums"]["delivery_platform"]
                    | null
                    discount_amount: number | null
                    discount_type: string | null
                    discount_value: number | null
                    event_discount_amount: number | null
                    event_discount_name: string | null
                    event_discount_percentage: number | null
                    id: string
                    items: Json
                    order_number: string
                    payment_method: Database["public"]["Enums"]["payment_method"]
                    serial_date: string | null
                    status: Database["public"]["Enums"]["order_status"]
                    total_amount: number
                    updated_at: string
                }
                Insert: {
                    business_id: string
                    card_amount?: number | null
                    cash_amount?: number | null
                    cash_received?: number | null
                    change_amount?: number | null
                    created_at?: string
                    created_by: string
                    customer_name?: string | null
                    daily_serial?: string | null
                    delivery_platform?:
                    | Database["public"]["Enums"]["delivery_platform"]
                    | null
                    discount_amount?: number | null
                    discount_type?: string | null
                    discount_value?: number | null
                    event_discount_amount?: number | null
                    event_discount_name?: string | null
                    event_discount_percentage?: number | null
                    id?: string
                    items: Json
                    order_number: string
                    payment_method?: Database["public"]["Enums"]["payment_method"]
                    serial_date?: string | null
                    status?: Database["public"]["Enums"]["order_status"]
                    total_amount: number
                    updated_at?: string
                }
                Update: {
                    business_id?: string
                    card_amount?: number | null
                    cash_amount?: number | null
                    cash_received?: number | null
                    change_amount?: number | null
                    created_at?: string
                    created_by?: string
                    customer_name?: string | null
                    daily_serial?: string | null
                    delivery_platform?:
                    | Database["public"]["Enums"]["delivery_platform"]
                    | null
                    discount_amount?: number | null
                    discount_type?: string | null
                    discount_value?: number | null
                    event_discount_amount?: number | null
                    event_discount_name?: string | null
                    event_discount_percentage?: number | null
                    id?: string
                    items?: Json
                    order_number?: string
                    payment_method?: Database["public"]["Enums"]["payment_method"]
                    serial_date?: string | null
                    status?: Database["public"]["Enums"]["order_status"]
                    total_amount?: number
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "orders_business_id_businesses_id_fk"
                        columns: ["business_id"]
                        isOneToOne: false
                        referencedRelation: "businesses"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "orders_created_by_users_id_fk"
                        columns: ["created_by"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            products: {
                Row: {
                    barcode: string | null
                    business_id: string
                    category_id: string
                    cost_price: number | null
                    created_at: string | null
                    description: string | null
                    id: string
                    images: string[] | null
                    is_active: boolean | null
                    is_featured: boolean | null
                    low_stock_threshold: number | null
                    metadata: Json | null
                    modifiers: Json | null
                    name: string
                    name_ar: string | null
                    price: number
                    sku: string | null
                    stock_quantity: number | null
                    tags: string[] | null
                    updated_at: string | null
                    variants: Json | null
                }
                Insert: {
                    barcode?: string | null
                    business_id: string
                    category_id: string
                    cost_price?: number | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    images?: string[] | null
                    is_active?: boolean | null
                    is_featured?: boolean | null
                    low_stock_threshold?: number | null
                    metadata?: Json | null
                    modifiers?: Json | null
                    name: string
                    name_ar?: string | null
                    price?: number
                    sku?: string | null
                    stock_quantity?: number | null
                    tags?: string[] | null
                    updated_at?: string | null
                    variants?: Json | null
                }
                Update: {
                    barcode?: string | null
                    business_id?: string
                    category_id?: string
                    cost_price?: number | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    images?: string[] | null
                    is_active?: boolean | null
                    is_featured?: boolean | null
                    low_stock_threshold?: number | null
                    metadata?: Json | null
                    modifiers?: Json | null
                    name?: string
                    name_ar?: string | null
                    price?: number
                    sku?: string | null
                    stock_quantity?: number | null
                    tags?: string[] | null
                    updated_at?: string | null
                    variants?: Json | null
                }
                Relationships: [
                    {
                        foreignKeyName: "products_business_id_businesses_id_fk"
                        columns: ["business_id"]
                        isOneToOne: false
                        referencedRelation: "businesses"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "products_category_id_categories_id_fk"
                        columns: ["category_id"]
                        isOneToOne: false
                        referencedRelation: "categories"
                        referencedColumns: ["id"]
                    },
                ]
            }
            users: {
                Row: {
                    avatar_url: string | null
                    created_at: string | null
                    email: string
                    full_name: string | null
                    id: string
                    is_active: boolean | null
                    metadata: Json | null
                    phone: string | null
                    role: string | null
                    updated_at: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string | null
                    email: string
                    full_name?: string | null
                    id: string
                    is_active?: boolean | null
                    metadata?: Json | null
                    phone?: string | null
                    role?: string | null
                    updated_at?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string | null
                    email?: string
                    full_name?: string | null
                    id?: string
                    is_active?: boolean | null
                    metadata?: Json | null
                    phone?: string | null
                    role?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            get_next_order_serial: {
                Args: { p_business_id: string }
                Returns: number
            }
        }
        Enums: {
            delivery_platform: "keeta" | "hunger_station" | "jahez"
            modification_type:
            | "item_added"
            | "item_removed"
            | "quantity_changed"
            | "item_replaced"
            | "multiple_changes"
            order_status: "completed" | "canceled" | "modified"
            payment_method: "cash" | "card" | "mixed" | "delivery"
            role: "superadmin" | "admin" | "manager" | "staff"
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
            delivery_platform: ["keeta", "hunger_station", "jahez"],
            modification_type: [
                "item_added",
                "item_removed",
                "quantity_changed",
                "item_replaced",
                "multiple_changes",
            ],
            order_status: ["completed", "canceled", "modified"],
            payment_method: ["cash", "card", "mixed", "delivery"],
            role: ["superadmin", "admin", "manager", "staff"],
        },
    },
} as const

