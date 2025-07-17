import { createClient } from '@/utils/supabase/client';
import type { Beverage, NewBeverage, Modifier } from '@/lib/db/schema';

export const supabase = createClient();

export const beveragesClientService = {
    // Get all beverages
    async getBeverages(): Promise<Beverage[]> {
        const { data, error } = await supabase
            .from('beverages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching beverages:', error);
            throw new Error(`Failed to fetch beverages: ${error.message}`);
        }

        return (data || []).map(beverage => ({
            id: beverage.id,
            nameAr: beverage.name_ar,
            nameEn: beverage.name_en,
            imageUrl: beverage.image_url,
            priceWithVat: beverage.price_with_vat.toString(),
            modifiers: Array.isArray(beverage.modifiers) ? beverage.modifiers as Modifier[] : [],
            createdAt: new Date(beverage.created_at),
            updatedAt: new Date(beverage.updated_at),
        }));
    },

    async getBeverageById(id: string): Promise<Beverage | null> {
        const { data, error } = await supabase
            .from('beverages')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Not found
            }
            console.error('Error fetching beverage by ID:', error);
            throw new Error(`Failed to fetch beverage: ${error.message}`);
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

    async createBeverage(beverageData: Omit<NewBeverage, 'id' | 'createdAt' | 'updatedAt'>): Promise<Beverage> {
        const { data, error } = await supabase
            .from('beverages')
            .insert({
                name_ar: beverageData.nameAr,
                name_en: beverageData.nameEn,
                image_url: beverageData.imageUrl,
                price_with_vat: parseFloat(beverageData.priceWithVat),
                modifiers: beverageData.modifiers || [],
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating beverage:', error);
            throw new Error(`Failed to create beverage: ${error.message}`);
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

    async updateBeverage(id: string, updates: Partial<Omit<NewBeverage, 'id' | 'createdAt'>>): Promise<Beverage> {
        const updateData: Record<string, unknown> = {};
        if (updates.nameAr !== undefined) updateData.name_ar = updates.nameAr;
        if (updates.nameEn !== undefined) updateData.name_en = updates.nameEn;
        if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
        if (updates.priceWithVat !== undefined) updateData.price_with_vat = parseFloat(updates.priceWithVat);
        if (updates.modifiers !== undefined) updateData.modifiers = updates.modifiers;
        updateData.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('beverages')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating beverage:', error);
            throw new Error(`Failed to update beverage: ${error.message}`);
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

    async deleteBeverage(id: string): Promise<void> {
        const { error } = await supabase
            .from('beverages')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting beverage:', error);
            throw new Error(`Failed to delete beverage: ${error.message}`);
        }
    },
};
