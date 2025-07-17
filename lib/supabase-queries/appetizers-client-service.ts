import { createClient } from '@/utils/supabase/client';
import type { Appetizer, NewAppetizer, Modifier } from '@/lib/db/schema';


export const supabase = createClient();

export const appetizersClientService = {
    // Get all appetizers
    async getAppetizers(): Promise<Appetizer[]> {
        const { data, error } = await supabase
            .from('appetizers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching appetizers:', error);
            throw new Error(`Failed to fetch appetizers: ${error.message}`);
        }

        return (data || []).map(appetizer => ({
            id: appetizer.id,
            nameAr: appetizer.name_ar,
            nameEn: appetizer.name_en,
            imageUrl: appetizer.image_url,
            priceWithVat: appetizer.price_with_vat.toString(),
            modifiers: Array.isArray(appetizer.modifiers) ? appetizer.modifiers as Modifier[] : [],
            createdAt: new Date(appetizer.created_at),
            updatedAt: new Date(appetizer.updated_at),
        }));
    },

    async getAppetizerById(id: string): Promise<Appetizer | null> {
        const { data, error } = await supabase
            .from('appetizers')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Not found
            }
            console.error('Error fetching appetizer by ID:', error);
            throw new Error(`Failed to fetch appetizer: ${error.message}`);
        }

        return {
            id: data.id,
            nameAr: data.name_ar,
            nameEn: data.name_en,
            imageUrl: data.image_url,
            priceWithVat: data.price_with_vat.toString(),
            modifiers: Array.isArray(data.modifiers) ? data.modifiers as Modifier[] : [],
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    },

    async createAppetizer(appetizerData: Omit<NewAppetizer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appetizer> {
        const { data, error } = await supabase
            .from('appetizers')
            .insert({
                name_ar: appetizerData.nameAr,
                name_en: appetizerData.nameEn,
                image_url: appetizerData.imageUrl,
                price_with_vat: parseFloat(appetizerData.priceWithVat),
                modifiers: appetizerData.modifiers || [],
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating appetizer:', error);
            throw new Error(`Failed to create appetizer: ${error.message}`);
        }

        return {
            id: data.id,
            nameAr: data.name_ar,
            nameEn: data.name_en,
            imageUrl: data.image_url,
            priceWithVat: data.price_with_vat.toString(),
            modifiers: Array.isArray(data.modifiers) ? data.modifiers as Modifier[] : [],
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    },

    async updateAppetizer(id: string, updates: Partial<Omit<NewAppetizer, 'id' | 'createdAt'>>): Promise<Appetizer> {
        const updateData: Record<string, unknown> = {};
        if (updates.nameAr !== undefined) updateData.name_ar = updates.nameAr;
        if (updates.nameEn !== undefined) updateData.name_en = updates.nameEn;
        if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
        if (updates.priceWithVat !== undefined) updateData.price_with_vat = parseFloat(updates.priceWithVat);
        if (updates.modifiers !== undefined) updateData.modifiers = updates.modifiers;
        updateData.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('appetizers')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating appetizer:', error);
            throw new Error(`Failed to update appetizer: ${error.message}`);
        }

        return {
            id: data.id,
            nameAr: data.name_ar,
            nameEn: data.name_en,
            imageUrl: data.image_url,
            priceWithVat: data.price_with_vat.toString(),
            modifiers: Array.isArray(data.modifiers) ? data.modifiers as Modifier[] : [],
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    },

    async deleteAppetizer(id: string): Promise<void> {
        const { error } = await supabase
            .from('appetizers')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting appetizer:', error);
            throw new Error(`Failed to delete appetizer: ${error.message}`);
        }
    },
};
