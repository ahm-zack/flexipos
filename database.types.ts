export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            // Add table types as needed
            [key: string]: {
                Row: Record<string, unknown>
                Insert: Record<string, unknown>
                Update: Record<string, unknown>
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            get_next_daily_serial: {
                Args: Record<PropertyKey, never>
                Returns: {
                    serial: string
                    serial_date: string
                }[]
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
