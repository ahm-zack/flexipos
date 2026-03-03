[
{
"table_name": "business_order_counters",
"column_name": "business_id",
"ordinal_position": 1,
"column_default": null,
"is_nullable": "NO",
"data_type": "uuid",
"udt_name": "uuid",
"character_maximum_length": null
},
{
"table_name": "business_order_counters",
"column_name": "last_serial",
"ordinal_position": 2,
"column_default": "0",
"is_nullable": "NO",
"data_type": "integer",
"udt_name": "int4",
"character_maximum_length": null
},
{
"table_name": "business_users",
"column_name": "id",
"ordinal_position": 1,
"column_default": "gen_random_uuid()",
"is_nullable": "NO",
"data_type": "uuid",
"udt_name": "uuid",
"character_maximum_length": null
},
{
"table_name": "business_users",
"column_name": "business_id",
"ordinal_position": 2,
"column_default": null,
"is_nullable": "NO",
"data_type": "uuid",
"udt_name": "uuid",
"character_maximum_length": null
},
{
"table_name": "business_users",
"column_name": "user_id",
"ordinal_position": 3,
"column_default": null,
"is_nullable": "NO",
"data_type": "uuid",
"udt_name": "uuid",
"character_maximum_length": null
},
{
"table_name": "business_users",
"column_name": "role",
"ordinal_position": 4,
"column_default": "'cashier'::text",
"is_nullable": "NO",
"data_type": "text",
"udt_name": "text",
"character_maximum_length": null
},
{
"table_name": "business_users",
"column_name": "permissions",
"ordinal_position": 5,
"column_default": "'{}'::jsonb",
"is_nullable": "YES",
"data_type": "jsonb",
"udt_name": "jsonb",
"character_maximum_length": null
},
{
"table_name": "business_users",
"column_name": "is_active",
"ordinal_position": 6,
"column_default": "true",
"is_nullable": "YES",
"data_type": "boolean",
"udt_name": "bool",
"character_maximum_length": null
},
{
"table_name": "business_users",
"column_name": "invited_at",
"ordinal_position": 7,
"column_default": "now()",
"is_nullable": "YES",
"data_type": "timestamp with time zone",
"udt_name": "timestamptz",
"character_maximum_length": null
},
{
"table_name": "business_users",
"column_name": "joined_at",
"ordinal_position": 8,
"column_default": null,
"is_nullable": "YES",
"data_type": "timestamp with time zone",
"udt_name": "timestamptz",
"character_maximum_length": null
},
{
"table_name": "business_users",
"column_name": "created_at",
"ordinal_position": 9,
"column_default": "now()",
"is_nullable": "NO",
"data_type": "timestamp with time zone",
"udt_name": "timestamptz",
"character_maximum_length": null
},
{
"table_name": "business_users",
"column_name": "updated_at",
"ordinal_position": 10,
"column_default": "now()",
"is_nullable": "NO",
"data_type": "timestamp with time zone",
"udt_name": "timestamptz",
"character_maximum_length": null
},
{
"table_name": "businesses",
"column_name": "id",
"ordinal_position": 1,
"column_default": "gen_random_uuid()",
"is_nullable": "NO",
"data_type": "uuid",
"udt_name": "uuid",
"character_maximum_length": null
},
{
"table_name": "businesses",
"column_name": "name",
"ordinal_position": 2,
"column_default": null,
"is_nullable": "NO",
"data_type": "text",
"udt_name": "text",
"character_maximum_length": null
},
{
"table_name": "businesses",
"column_name": "slug",
"ordinal_position": 3,
"column_default": null,
"is_nullable": "YES",
"data_type": "text",
"udt_name": "text",
"character_maximum_length": null
},
{
"table_name": "businesses",
"column_name": "description",
"ordinal_position": 4,
"column_default": null,
"is_nullable": "YES",
"data_type": "text",
"udt_name": "text",
"character_maximum_length": null
},
{
"table_name": "businesses",
"column_name": "logo_url",
"ordinal_position": 5,
"column_default": null,
"is_nullable": "YES",
"data_type": "text",
"udt_name": "text",
"character_maximum_length": null
},
{
"table_name": "businesses",
"column_name": "address",
"ordinal_position": 6,
"column_default": null,
"is_nullable": "YES",
"data_type": "text",
"udt_name": "text",
"character_maximum_length": null
},
{
"table_name": "businesses",
"column_name": "phone",
"ordinal_position": 7,
"column_default": null,
"is_nullable": "YES",
"data_type": "text",
"udt_name": "text",
"character_maximum_length": null
},
{
"table_name": "businesses",
"column_name": "email",
"ordinal_position": 8,
"column_default": null,
"is_nullable": "YES",
"data_type": "text",
"udt_name": "text",
"character_maximum_length": null
},
{
"table_name": "businesses",
"column_name": "website",
"ordinal_position": 9,
"column_default": null,
"is_nullable": "YES",
"data_type": "text",
"udt_name": "text",
"character_maximum_length": null
},
{
"table_name": "businesses",
"column_name": "timezone",
"ordinal_position": 10,
"column_default": "'UTC'::text",
"is_nullable": "YES",
"data_type": "text",
"udt_name": "text",
"character_maximum_length": null
},
{
"table_name": "businesses",
"column_name": "currency",
"ordinal_position": 11,
"column_default": "'USD'::text",
"is_nullable": "YES",
"data_type": "text",
"udt_name": "text",
"character_maximum_length": null
},
{
"table_name": "businesses",
"column_name": "settings",
"ordinal_position": 12,
"column_default": "'{}'::jsonb",
"is_nullable": "YES",
"data_type": "jsonb",
"udt_name": "jsonb",
"character_maximum_length": null
},
{
"table_name": "businesses",
"column_name": "is_active",
"ordinal_position": 13,
"column_default": "true",
"is_nullable": "YES",
"data_type": "boolean",
"udt_name": "bool",
"character_maximum_length": null
},
{
"table_name": "businesses",
"column_name": "created_at",
"ordinal_position": 14,
"column_default": "now()",
"is_nullable": "NO",
"data_type": "timestamp with time zone",
"udt_name": "timestamptz",
"character_maximum_length": null
},
{
"table_name": "businesses",
"column_name": "updated_at",
"ordinal_position": 15,
"column_default": "now()",
"is_nullable": "NO",
"data_type": "timestamp with time zone",
"udt_name": "timestamptz",
"character_maximum_length": null
},
{
"table_name": "canceled_orders",
"column_name": "id",
"ordinal_position": 1,
"column_default": "gen_random_uuid()",
"is_nullable": "NO",
"data_type": "uuid",
"udt_name": "uuid",
"character_maximum_length": null
},
{
"table_name": "canceled_orders",
"column_name": "original_order_id",
"ordinal_position": 2,
"column_default": null,
"is_nullable": "NO",
"data_type": "uuid",
"udt_name": "uuid",
"character_maximum_length": null
},
{
"table_name": "canceled_orders",
"column_name": "canceled_at",
"ordinal_position": 3,
"column_default": "now()",
"is_nullable": "NO",
"data_type": "timestamp with time zone",
"udt_name": "timestamptz",
"character_maximum_length": null
},
{
"table_name": "canceled_orders",
"column_name": "canceled_by",
"ordinal_position": 4,
"column_default": null,
"is_nullable": "NO",
"data_type": "uuid",
"udt_name": "uuid",
"character_maximum_length": null
},
{
"table_name": "canceled_orders",
"column_name": "reason",
"ordinal_position": 5,
"column_default": null,
"is_nullable": "YES",
"data_type": "text",
"udt_name": "text",
"character_maximum_length": null
},
{
"table_name": "canceled_orders",
"column_name": "order_data",
"ordinal_position": 6,
"column_default": null,
"is_nullable": "NO",
"data_type": "jsonb",
"udt_name": "jsonb",
"character_maximum_length": null
},
{
"table_name": "canceled_orders",
"column_name": "business_id",
"ordinal_position": 7,
"column_default": null,
"is_nullable": "NO",
"data_type": "uuid",
"udt_name": "uuid",
"character_maximum_length": null
},
{
"table_name": "categories",
"column_name": "id",
"ordinal_position": 1,
"column_default": "gen_random_uuid()",
"is_nullable": "NO",
"data_type": "uuid",
"udt_name": "uuid",
"character_maximum_length": null
},
{
"table_name": "categories",
"column_name": "business_id",
"ordinal_position": 2,
"column_default": null,
"is_nullable": "NO",
"data_type": "uuid",
"udt_name": "uuid",
"character_maximum_length": null
},
{
"table_name": "categories",
"column_name": "name",
"ordinal_position": 3,
"column_default": null,
"is_nullable": "NO",
"data_type": "text",
"udt_name": "text",
"character_maximum_length": null
},
{
"table_name": "categories",
"column_name": "slug",
"ordinal_position": 4,
"column_default": null,
"is_nullable": "YES",
"data_type": "text",
"udt_name": "text",
"character_maximum_length": null
},
{
"table_name": "categories",
"column_name": "description",
"ordinal_position": 5,
"column_default": null,
"is_nullable": "YES",
"data_type": "text",
"udt_name": "text",
"character_maximum_length": null
},
{
"table_name": "categories",
"column_name": "icon",
"ordinal_position": 6,
"column_default": null,
"is_nullable": "YES",
"data_type": "text",
"udt_name": "text",
"character_maximum_length": null
},
{
"table_name": "categories",
"column_name": "color",
"ordinal_position": 7,
"column_default": "'#3b82f6'::text",
"is_nullable": "YES",
"data_type": "text",
"udt_name": "text",
"character_maximum_length": null
},
{
"table_name": "categories",
"column_name": "image_url",
"ordinal_position": 8,
"column_default": null,
"is_nullable": "YES",
"data_type": "text",
"udt_name": "text",
"character_maximum_length": null
},
{
"table_name": "categories",
"column_name": "sort_order",
"ordinal_position": 9,
"column_default": "0",
"is_nullable": "YES",
"data_type": "integer",
"udt_name": "int4",
"character_maximum_length": null
},
{
"table_name": "categories",
"column_name": "is_active",
"ordinal_position": 10,
"column_default": "true",
"is_nullable": "YES",
"data_type": "boolean",
"udt_name": "bool",
"character_maximum_length": null
},
{
"table_name": "categories",
"column_name": "metadata",
"ordinal_position": 11,
"column_default": "'{}'::jsonb",
"is_nullable": "YES",
"data_type": "jsonb",
"udt_name": "jsonb",
"character_maximum_length": null
},
{
"table_name": "categories",
"column_name": "created_at",
"ordinal_position": 12,
"column_default": "now()",
"is_nullable": "NO",
"data_type": "timestamp with time zone",
"udt_name": "timestamptz",
"character_maximum_length": null
},
{
"table_name": "categories",
"column_name": "updated_at",
"ordinal_position": 13,
"column_default": "now()",
"is_nullable": "NO",
"data_type": "timestamp with time zone",
"udt_name": "timestamptz",
"character_maximum_length": null
},
{
"table_name": "customers",
"column_name": "id",
"ordinal_position": 1,
"column_default": "gen_random_uuid()",
"is_nullable": "NO",
"data_type": "uuid",
"udt_name": "uuid",
"character_maximum_length": null
},
{
"table_name": "customers",
"column_name": "business_id",
"ordinal_position": 2,
"column_default": null,
"is_nullable": "NO",
"data_type": "uuid",
"udt_name": "uuid",
"character_maximum_length": null
},
{
"table_name": "customers",
"column_name": "name",
"ordinal_position": 3,
"column_default": null,
"is_nullable": "NO",
"data_type": "text",
"udt_name": "text",
"character_maximum_length": null
},
{
"table_name": "customers",
"column_name": "phone",
"ordinal_position": 4,
"column_default": null,
"is_nullable": "NO",
"data_type": "text",
"udt_name": "text",
"character_maximum_length": null
},
{
"table_name": "customers",
"column_name": "address",
"ordinal_position": 5,
"column_default": null,
"is_nullable": "YES",
"data_type": "text",
"udt_name": "text",
"character_maximum_length": null
},
{
"table_name": "customers",
"column_name": "total_purchases",
"ordinal_position": 6,
"column_default": "'0'::numeric",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "customers",
"column_name": "order_count",
"ordinal_position": 7,
"column_default": "0",
"is_nullable": "NO",
"data_type": "integer",
"udt_name": "int4",
"character_maximum_length": null
},
{
"table_name": "customers",
"column_name": "last_order_at",
"ordinal_position": 8,
"column_default": null,
"is_nullable": "YES",
"data_type": "timestamp with time zone",
"udt_name": "timestamptz",
"character_maximum_length": null
},
{
"table_name": "customers",
"column_name": "created_at",
"ordinal_position": 9,
"column_default": "now()",
"is_nullable": "NO",
"data_type": "timestamp with time zone",
"udt_name": "timestamptz",
"character_maximum_length": null
},
{
"table_name": "customers",
"column_name": "updated_at",
"ordinal_position": 10,
"column_default": "now()",
"is_nullable": "NO",
"data_type": "timestamp with time zone",
"udt_name": "timestamptz",
"character_maximum_length": null
},
{
"table_name": "customers",
"column_name": "created_by",
"ordinal_position": 11,
"column_default": null,
"is_nullable": "NO",
"data_type": "uuid",
"udt_name": "uuid",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "id",
"ordinal_position": 1,
"column_default": "gen_random_uuid()",
"is_nullable": "NO",
"data_type": "uuid",
"udt_name": "uuid",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "business_id",
"ordinal_position": 2,
"column_default": null,
"is_nullable": "NO",
"data_type": "uuid",
"udt_name": "uuid",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "total_revenue",
"ordinal_position": 3,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "total_orders",
"ordinal_position": 4,
"column_default": "0",
"is_nullable": "NO",
"data_type": "integer",
"udt_name": "int4",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "cash_total",
"ordinal_position": 5,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "card_total",
"ordinal_position": 6,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "mixed_cash_total",
"ordinal_position": 7,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "mixed_card_total",
"ordinal_position": 8,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "delivery_total",
"ordinal_position": 9,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "delivery_keeta_total",
"ordinal_position": 10,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "delivery_hunger_station_total",
"ordinal_position": 11,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "delivery_jahez_total",
"ordinal_position": 12,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "current_day",
"ordinal_position": 13,
"column_default": "CURRENT_DATE",
"is_nullable": "NO",
"data_type": "date",
"udt_name": "date",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "daily_total",
"ordinal_position": 14,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "daily_orders",
"ordinal_position": 15,
"column_default": "0",
"is_nullable": "NO",
"data_type": "integer",
"udt_name": "int4",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "daily_cash",
"ordinal_position": 16,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "daily_card",
"ordinal_position": 17,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "daily_mixed",
"ordinal_position": 18,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "daily_keeta",
"ordinal_position": 19,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "daily_hunger_station",
"ordinal_position": 20,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "daily_jahez",
"ordinal_position": 21,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "current_week_start",
"ordinal_position": 22,
"column_default": "(date_trunc('week'::text, (CURRENT_DATE)::timestamp with time zone))::date",
"is_nullable": "NO",
"data_type": "date",
"udt_name": "date",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "weekly_total",
"ordinal_position": 23,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "weekly_orders",
"ordinal_position": 24,
"column_default": "0",
"is_nullable": "NO",
"data_type": "integer",
"udt_name": "int4",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "weekly_cash",
"ordinal_position": 25,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "weekly_card",
"ordinal_position": 26,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "weekly_mixed",
"ordinal_position": 27,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "weekly_keeta",
"ordinal_position": 28,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "weekly_hunger_station",
"ordinal_position": 29,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "weekly_jahez",
"ordinal_position": 30,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "current_month_start",
"ordinal_position": 31,
"column_default": "(date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone))::date",
"is_nullable": "NO",
"data_type": "date",
"udt_name": "date",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "monthly_total",
"ordinal_position": 32,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "monthly_orders",
"ordinal_position": 33,
"column_default": "0",
"is_nullable": "NO",
"data_type": "integer",
"udt_name": "int4",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "monthly_cash",
"ordinal_position": 34,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "monthly_card",
"ordinal_position": 35,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "monthly_mixed",
"ordinal_position": 36,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "monthly_keeta",
"ordinal_position": 37,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "monthly_hunger_station",
"ordinal_position": 38,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "monthly_jahez",
"ordinal_position": 39,
"column_default": "0",
"is_nullable": "NO",
"data_type": "numeric",
"udt_name": "numeric",
"character_maximum_length": null
},
{
"table_name": "dashboard_metrics",
"column_name": "updated_at",
"ordinal_position": 40,
"column_default": "now()",
"is_nullable": "NO",
"data_type": "timestamp with time zone",
"udt_name": "timestamptz",
"character_maximum_length": null
},
{
"table_name": "eod_reports",
"column_name": "id",
"ordinal_position": 1,
"column_default": "gen_random_uuid()",
"is_nullable": "NO",
"data_type": "uuid",
"udt_name": "uuid",
"character_maximum_length": null
},
{
"table_name": "eod_reports",
"column_name": "business_id",
"ordinal_position": 2,
"column_default": null,
"is_nullable": "NO",
"data_type": "uuid",
"udt_name": "uuid",
"character_maximum_length": null
}
]

[
{
"table_name": "business_order_counters",
"column_name": "business_id",
"foreign_table": "businesses",
"foreign_column": "id",
"delete_rule": "CASCADE"
},
{
"table_name": "business_users",
"column_name": "user_id",
"foreign_table": "users",
"foreign_column": "id",
"delete_rule": "CASCADE"
},
{
"table_name": "business_users",
"column_name": "business_id",
"foreign_table": "businesses",
"foreign_column": "id",
"delete_rule": "CASCADE"
},
{
"table_name": "canceled_orders",
"column_name": "business_id",
"foreign_table": "businesses",
"foreign_column": "id",
"delete_rule": "CASCADE"
},
{
"table_name": "canceled_orders",
"column_name": "canceled_by",
"foreign_table": "users",
"foreign_column": "id",
"delete_rule": "NO ACTION"
},
{
"table_name": "categories",
"column_name": "business_id",
"foreign_table": "businesses",
"foreign_column": "id",
"delete_rule": "CASCADE"
},
{
"table_name": "customers",
"column_name": "business_id",
"foreign_table": "businesses",
"foreign_column": "id",
"delete_rule": "CASCADE"
},
{
"table_name": "customers",
"column_name": "created_by",
"foreign_table": "users",
"foreign_column": "id",
"delete_rule": "NO ACTION"
},
{
"table_name": "dashboard_metrics",
"column_name": "business_id",
"foreign_table": "businesses",
"foreign_column": "id",
"delete_rule": "CASCADE"
},
{
"table_name": "eod_reports",
"column_name": "business_id",
"foreign_table": "businesses",
"foreign_column": "id",
"delete_rule": "CASCADE"
},
{
"table_name": "eod_reports",
"column_name": "generated_by",
"foreign_table": "users",
"foreign_column": "id",
"delete_rule": "NO ACTION"
},
{
"table_name": "modified_orders",
"column_name": "business_id",
"foreign_table": "businesses",
"foreign_column": "id",
"delete_rule": "CASCADE"
},
{
"table_name": "modified_orders",
"column_name": "modified_by",
"foreign_table": "users",
"foreign_column": "id",
"delete_rule": "NO ACTION"
},
{
"table_name": "orders",
"column_name": "created_by",
"foreign_table": "users",
"foreign_column": "id",
"delete_rule": "NO ACTION"
},
{
"table_name": "orders",
"column_name": "business_id",
"foreign_table": "businesses",
"foreign_column": "id",
"delete_rule": "CASCADE"
},
{
"table_name": "products",
"column_name": "category_id",
"foreign_table": "categories",
"foreign_column": "id",
"delete_rule": "CASCADE"
},
{
"table_name": "products",
"column_name": "business_id",
"foreign_table": "businesses",
"foreign_column": "id",
"delete_rule": "CASCADE"
},
{
"table_name": "sales_reports",
"column_name": "business_id",
"foreign_table": "businesses",
"foreign_column": "id",
"delete_rule": "CASCADE"
},
{
"table_name": "sales_reports",
"column_name": "generated_by",
"foreign_table": "users",
"foreign_column": "id",
"delete_rule": "NO ACTION"
}
]

[
{
"routine_name": "get_next_order_serial",
"routine_definition": "\nDECLARE\n next_serial INTEGER;\nBEGIN\n INSERT INTO business_order_counters (business_id, last_serial)\n VALUES (p_business_id, 1)\n ON CONFLICT (business_id)\n DO UPDATE SET last_serial = business_order_counters.last_serial + 1\n RETURNING last_serial INTO next_serial;\n RETURN next_serial;\nEND;\n",
"external_language": "PLPGSQL",
"security_type": "INVOKER"
},
{
"routine_name": "handle_new_auth_user",
"routine_definition": "\nBEGIN\n INSERT INTO public.users (\n id,\n email,\n full_name,\n avatar_url,\n role,\n is_active,\n created_at,\n updated_at\n )\n VALUES (\n NEW.id,\n NEW.email,\n COALESCE(\n NEW.raw_user_meta_data->>'full_name',\n NEW.raw_user_meta_data->>'name'\n ),\n NEW.raw_user_meta_data->>'avatar_url',\n COALESCE(NEW.raw_app_meta_data->>'user_role', 'staff'),\n true,\n now(),\n now()\n )\n ON CONFLICT (id) DO NOTHING; -- code already inserted the row → skip silently\n\n RETURN NEW;\nEND;\n",
"external_language": "PLPGSQL",
"security_type": "DEFINER"
},
{
"routine_name": "handle_new_user",
"routine_definition": "\nBEGIN\n INSERT INTO public.users (id, email, full_name, avatar_url)\n VALUES (\n NEW.id,\n NEW.email,\n COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),\n NEW.raw_user_meta_data->>'avatar_url'\n )\n ON CONFLICT (id) DO UPDATE SET\n email = EXCLUDED.email,\n full_name = EXCLUDED.full_name,\n avatar_url = EXCLUDED.avatar_url,\n updated_at = NOW();\n RETURN NEW;\nEND;\n",
"external_language": "PLPGSQL",
"security_type": "DEFINER"
},
{
"routine_name": "handle_public_user_deleted",
"routine_definition": "\nBEGIN\n -- Delete the auth user. If it no longer exists, do nothing.\n -- Deleting auth.users would normally cascade-delete public.users,\n -- but since this trigger fires AFTER the public.users row is already\n -- gone, there is nothing to cascade — no infinite loop.\n DELETE FROM auth.users WHERE id = OLD.id;\n RETURN OLD;\nEND;\n",
"external_language": "PLPGSQL",
"security_type": "DEFINER"
},
{
"routine_name": "handle_user_update",
"routine_definition": "\nBEGIN\n UPDATE public.users SET\n email = NEW.email,\n full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', full_name),\n avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', avatar_url),\n updated_at = NOW()\n WHERE id = NEW.id;\n RETURN NEW;\nEND;\n",
"external_language": "PLPGSQL",
"security_type": "DEFINER"
},
{
"routine_name": "increment_dashboard_metrics",
"routine_definition": "\nDECLARE\n v_today DATE := CURRENT_DATE;\n v_week_start DATE := date_trunc('week', CURRENT_DATE)::DATE;\n v_month_start DATE := date_trunc('month', CURRENT_DATE)::DATE;\n v_row dashboard_metrics%ROWTYPE;\n v_needs_daily_reset BOOLEAN;\n v_needs_weekly_reset BOOLEAN;\n v_needs_monthly_reset BOOLEAN;\nBEGIN\n -- ── Upsert a row for this business (no-lock on insert path) ────────────────\n INSERT INTO dashboard_metrics (business_id, current_day, current_week_start, current_month_start)\n VALUES (p_business_id, v_today, v_week_start, v_month_start)\n ON CONFLICT (business_id) DO NOTHING;\n\n -- ── Lock and read the row ──────────────────────────────────────────────────\n SELECT * INTO v_row FROM dashboard_metrics\n WHERE business_id = p_business_id\n FOR UPDATE;\n\n -- ── Determine which periods need resetting ─────────────────────────────────\n v_needs_daily_reset := v_row.current_day <> v_today;\n v_needs_weekly_reset := v_row.current_week_start <> v_week_start;\n v_needs_monthly_reset := v_row.current_month_start <> v_month_start;\n\n -- ── Build and execute a single UPDATE ─────────────────────────────────────\n UPDATE dashboard_metrics SET\n -- All-time\n total_revenue = total_revenue + p_total,\n total_orders = total_orders + 1,\n cash_total = cash_total + CASE WHEN p_payment_method = 'cash' THEN p_total ELSE 0 END,\n card_total = card_total + CASE WHEN p_payment_method = 'card' THEN p_total ELSE 0 END,\n mixed_cash_total = mixed_cash_total + CASE WHEN p_payment_method = 'mixed' THEN COALESCE(p_cash_amount, 0) ELSE 0 END,\n mixed_card_total = mixed_card_total + CASE WHEN p_payment_method = 'mixed' THEN COALESCE(p_card_amount, 0) ELSE 0 END,\n delivery_total = delivery_total + CASE WHEN p_payment_method = 'delivery' THEN p_total ELSE 0 END,\n delivery_keeta_total = delivery_keeta_total + CASE WHEN p_delivery_platform = 'keeta' THEN p_total ELSE 0 END,\n delivery_hunger_station_total = delivery_hunger_station_total + CASE WHEN p_delivery_platform = 'hunger_station' THEN p_total ELSE 0 END,\n delivery_jahez_total = delivery_jahez_total + CASE WHEN p_delivery_platform = 'jahez' THEN p_total ELSE 0 END,\n\n -- Daily (reset if new day)\n current_day = v_today,\n daily_total = CASE WHEN v_needs_daily_reset THEN p_total ELSE daily_total + p_total END,\n daily_orders = CASE WHEN v_needs_daily_reset THEN 1 ELSE daily_orders + 1 END,\n daily_cash = CASE WHEN v_needs_daily_reset THEN CASE WHEN p_payment_method='cash' THEN p_total ELSE 0 END ELSE daily_cash + CASE WHEN p_payment_method='cash' THEN p_total ELSE 0 END END,\n daily_card = CASE WHEN v_needs_daily_reset THEN CASE WHEN p_payment_method='card' THEN p_total ELSE 0 END ELSE daily_card + CASE WHEN p_payment_method='card' THEN p_total ELSE 0 END END,\n daily_mixed = CASE WHEN v_needs_daily_reset THEN CASE WHEN p_payment_method='mixed' THEN p_total ELSE 0 END ELSE daily_mixed + CASE WHEN p_payment_method='mixed' THEN p_total ELSE 0 END END,\n daily_keeta = CASE WHEN v_needs_daily_reset THEN CASE WHEN p_delivery_platform='keeta' THEN p_total ELSE 0 END ELSE daily_keeta + CASE WHEN p_delivery_platform='keeta' THEN p_total ELSE 0 END END,\n daily_hunger_station = CASE WHEN v_needs_daily_reset THEN CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END ELSE daily_hunger_station + CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END END,\n daily_jahez = CASE WHEN v_needs_daily_reset THEN CASE WHEN p_delivery_platform='jahez' THEN p_total ELSE 0 END ELSE daily_jahez + CASE WHEN p_delivery_platform='jahez' THEN p_total ELSE 0 END END,\n\n -- Weekly (reset if new week)\n current_week_start = v_week_start,\n weekly_total = CASE WHEN v_needs_weekly_reset THEN p_total ELSE weekly_total + p_total END,\n weekly_orders = CASE WHEN v_needs_weekly_reset THEN 1 ELSE weekly_orders + 1 END,\n weekly_cash = CASE WHEN v_needs_weekly_reset THEN CASE WHEN p_payment_method='cash' THEN p_total ELSE 0 END ELSE weekly_cash + CASE WHEN p_payment_method='cash' THEN p_total ELSE 0 END END,\n weekly_card = CASE WHEN v_needs_weekly_reset THEN CASE WHEN p_payment_method='card' THEN p_total ELSE 0 END ELSE weekly_card + CASE WHEN p_payment_method='card' THEN p_total ELSE 0 END END,\n weekly_mixed = CASE WHEN v_needs_weekly_reset THEN CASE WHEN p_payment_method='mixed' THEN p_total ELSE 0 END ELSE weekly_mixed + CASE WHEN p_payment_method='mixed' THEN p_total ELSE 0 END END,\n weekly_keeta = CASE WHEN v_needs_weekly_reset THEN CASE WHEN p_delivery_platform='keeta' THEN p_total ELSE 0 END ELSE weekly_keeta + CASE WHEN p_delivery_platform='keeta' THEN p_total ELSE 0 END END,\n weekly_hunger_station = CASE WHEN v_needs_weekly_reset THEN CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END ELSE weekly_hunger_station + CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END END,\n weekly_jahez = CASE WHEN v_needs_weekly_reset THEN CASE WHEN p_delivery_platform='jahez' THEN p_total ELSE 0 END ELSE weekly_jahez + CASE WHEN p_delivery_platform='jahez' THEN p_total ELSE 0 END END,\n\n -- Monthly (reset if new month)\n current_month_start = v_month_start,\n monthly_total = CASE WHEN v_needs_monthly_reset THEN p_total ELSE monthly_total + p_total END,\n monthly_orders = CASE WHEN v_needs_monthly_reset THEN 1 ELSE monthly_orders + 1 END,\n monthly_cash = CASE WHEN v_needs_monthly_reset THEN CASE WHEN p_payment_method='cash' THEN p_total ELSE 0 END ELSE monthly_cash + CASE WHEN p_payment_method='cash' THEN p_total ELSE 0 END END,\n monthly_card = CASE WHEN v_needs_monthly_reset THEN CASE WHEN p_payment_method='card' THEN p_total ELSE 0 END ELSE monthly_card + CASE WHEN p_payment_method='card' THEN p_total ELSE 0 END END,\n monthly_mixed = CASE WHEN v_needs_monthly_reset THEN CASE WHEN p_payment_method='mixed' THEN p_total ELSE 0 END ELSE monthly_mixed + CASE WHEN p_payment_method='mixed' THEN p_total ELSE 0 END END,\n monthly_keeta = CASE WHEN v_needs_monthly_reset THEN CASE WHEN p_delivery_platform='keeta' THEN p_total ELSE 0 END ELSE monthly_keeta + CASE WHEN p_delivery_platform='keeta' THEN p_total ELSE 0 END END,\n monthly_hunger_station = CASE WHEN v_needs_monthly_reset THEN CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END ELSE monthly_hunger_station + CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END END,\n monthly_jahez = CASE WHEN v_needs_monthly_reset THEN CASE WHEN p_delivery_platform='jahez' THEN p_total ELSE 0 END ELSE monthly_jahez + CASE WHEN p_delivery_platform='jahez' THEN p_total ELSE 0 END END,\n\n updated_at = now()\n WHERE business_id = p_business_id;\nEND;\n",
"external_language": "PLPGSQL",
"security_type": "INVOKER"
},
{
"routine_name": "update_updated_at_column",
"routine_definition": "\nBEGIN\n NEW.updated_at = NOW();\n RETURN NEW;\nEND;\n",
"external_language": "PLPGSQL",
"security_type": "INVOKER"
}
]

[
{
"trigger_name": "update_products_updated_at",
"event_object_table": "products",
"event_manipulation": "UPDATE",
"action_statement": "EXECUTE FUNCTION update_updated_at_column()",
"action_timing": "BEFORE"
},
{
"trigger_name": "on_public_user_deleted",
"event_object_table": "users",
"event_manipulation": "DELETE",
"action_statement": "EXECUTE FUNCTION handle_public_user_deleted()",
"action_timing": "AFTER"
}
]

[
{
"tablename": "dashboard_metrics",
"policyname": "dashboard_metrics_select",
"roles": "{public}",
"cmd": "SELECT",
"qual": "(business_id IN ( SELECT business_users.business_id\n FROM business_users\n WHERE (business_users.user_id = auth.uid())))",
"with_check": null
},
{
"tablename": "dashboard_metrics",
"policyname": "dashboard_metrics_update",
"roles": "{public}",
"cmd": "ALL",
"qual": "(business_id IN ( SELECT business_users.business_id\n FROM business_users\n WHERE (business_users.user_id = auth.uid())))",
"with_check": null
},
{
"tablename": "eod_reports",
"policyname": "eod_delete",
"roles": "{public}",
"cmd": "DELETE",
"qual": "(business_id IN ( SELECT business_users.business_id\n FROM business_users\n WHERE ((business_users.user_id = auth.uid()) AND (business_users.is_active = true) AND (business_users.role = ANY (ARRAY['admin'::text, 'manager'::text])))))",
"with_check": null
},
{
"tablename": "eod_reports",
"policyname": "eod_insert",
"roles": "{public}",
"cmd": "INSERT",
"qual": null,
"with_check": "(business_id IN ( SELECT business_users.business_id\n FROM business_users\n WHERE ((business_users.user_id = auth.uid()) AND (business_users.is_active = true) AND (business_users.role = ANY (ARRAY['admin'::text, 'manager'::text])))))"
},
{
"tablename": "eod_reports",
"policyname": "eod_select",
"roles": "{public}",
"cmd": "SELECT",
"qual": "(business_id IN ( SELECT business_users.business_id\n FROM business_users\n WHERE ((business_users.user_id = auth.uid()) AND (business_users.is_active = true))))",
"with_check": null
},
{
"tablename": "sales_reports",
"policyname": "sales_delete",
"roles": "{public}",
"cmd": "DELETE",
"qual": "(business_id IN ( SELECT business_users.business_id\n FROM business_users\n WHERE ((business_users.user_id = auth.uid()) AND (business_users.is_active = true) AND (business_users.role = ANY (ARRAY['admin'::text, 'manager'::text])))))",
"with_check": null
},
{
"tablename": "sales_reports",
"policyname": "sales_insert",
"roles": "{public}",
"cmd": "INSERT",
"qual": null,
"with_check": "(business_id IN ( SELECT business_users.business_id\n FROM business_users\n WHERE ((business_users.user_id = auth.uid()) AND (business_users.is_active = true) AND (business_users.role = ANY (ARRAY['admin'::text, 'manager'::text])))))"
},
{
"tablename": "sales_reports",
"policyname": "sales_select",
"roles": "{public}",
"cmd": "SELECT",
"qual": "(business_id IN ( SELECT business_users.business_id\n FROM business_users\n WHERE ((business_users.user_id = auth.uid()) AND (business_users.is_active = true))))",
"with_check": null
}
]

[
{
"indexname": "business_order_counters_pkey",
"tablename": "business_order_counters",
"indexdef": "CREATE UNIQUE INDEX business_order_counters_pkey ON public.business_order_counters USING btree (business_id)"
},
{
"indexname": "business_users_pkey",
"tablename": "business_users",
"indexdef": "CREATE UNIQUE INDEX business_users_pkey ON public.business_users USING btree (id)"
},
{
"indexname": "businesses_pkey",
"tablename": "businesses",
"indexdef": "CREATE UNIQUE INDEX businesses_pkey ON public.businesses USING btree (id)"
},
{
"indexname": "canceled_orders_pkey",
"tablename": "canceled_orders",
"indexdef": "CREATE UNIQUE INDEX canceled_orders_pkey ON public.canceled_orders USING btree (id)"
},
{
"indexname": "categories_pkey",
"tablename": "categories",
"indexdef": "CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id)"
},
{
"indexname": "customers_business_phone_unique",
"tablename": "customers",
"indexdef": "CREATE UNIQUE INDEX customers_business_phone_unique ON public.customers USING btree (business_id, phone)"
},
{
"indexname": "customers_pkey",
"tablename": "customers",
"indexdef": "CREATE UNIQUE INDEX customers_pkey ON public.customers USING btree (id)"
},
{
"indexname": "dashboard_metrics_business_id_idx",
"tablename": "dashboard_metrics",
"indexdef": "CREATE INDEX dashboard_metrics_business_id_idx ON public.dashboard_metrics USING btree (business_id)"
},
{
"indexname": "dashboard_metrics_business_id_key",
"tablename": "dashboard_metrics",
"indexdef": "CREATE UNIQUE INDEX dashboard_metrics_business_id_key ON public.dashboard_metrics USING btree (business_id)"
},
{
"indexname": "dashboard_metrics_pkey",
"tablename": "dashboard_metrics",
"indexdef": "CREATE UNIQUE INDEX dashboard_metrics_pkey ON public.dashboard_metrics USING btree (id)"
},
{
"indexname": "eod_reports_pkey",
"tablename": "eod_reports",
"indexdef": "CREATE UNIQUE INDEX eod_reports_pkey ON public.eod_reports USING btree (id)"
},
{
"indexname": "modified_orders_pkey",
"tablename": "modified_orders",
"indexdef": "CREATE UNIQUE INDEX modified_orders_pkey ON public.modified_orders USING btree (id)"
},
{
"indexname": "orders_pkey",
"tablename": "orders",
"indexdef": "CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id)"
},
{
"indexname": "products_pkey",
"tablename": "products",
"indexdef": "CREATE UNIQUE INDEX products_pkey ON public.products USING btree (id)"
},
{
"indexname": "sales_reports_pkey",
"tablename": "sales_reports",
"indexdef": "CREATE UNIQUE INDEX sales_reports_pkey ON public.sales_reports USING btree (id)"
},
{
"indexname": "users_email_unique",
"tablename": "users",
"indexdef": "CREATE UNIQUE INDEX users_email_unique ON public.users USING btree (email)"
},
{
"indexname": "users_pkey",
"tablename": "users",
"indexdef": "CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id)"
}
]

[
{
"id": "product-images",
"name": "product-images",
"public": true,
"file_size_limit": 10485760,
"allowed_mime_types": null
}
]

[
{
"enum_name": "delivery_platform",
"enum_value": "keeta"
},
{
"enum_name": "delivery_platform",
"enum_value": "hunger_station"
},
{
"enum_name": "delivery_platform",
"enum_value": "jahez"
},
{
"enum_name": "modification_type",
"enum_value": "item_added"
},
{
"enum_name": "modification_type",
"enum_value": "item_removed"
},
{
"enum_name": "modification_type",
"enum_value": "quantity_changed"
},
{
"enum_name": "modification_type",
"enum_value": "item_replaced"
},
{
"enum_name": "modification_type",
"enum_value": "multiple_changes"
},
{
"enum_name": "order_status",
"enum_value": "completed"
},
{
"enum_name": "order_status",
"enum_value": "canceled"
},
{
"enum_name": "order_status",
"enum_value": "modified"
},
{
"enum_name": "payment_method",
"enum_value": "cash"
},
{
"enum_name": "payment_method",
"enum_value": "card"
},
{
"enum_name": "payment_method",
"enum_value": "mixed"
},
{
"enum_name": "payment_method",
"enum_value": "delivery"
},
{
"enum_name": "report_type",
"enum_value": "eod"
},
{
"enum_name": "report_type",
"enum_value": "sales"
},
{
"enum_name": "report_type",
"enum_value": "weekly"
},
{
"enum_name": "report_type",
"enum_value": "monthly"
},
{
"enum_name": "role",
"enum_value": "superadmin"
},
{
"enum_name": "role",
"enum_value": "admin"
},
{
"enum_name": "role",
"enum_value": "manager"
},
{
"enum_name": "role",
"enum_value": "staff"
}
]
