import { createClient } from '@/utils/supabase/client';
import type { Burger, NewBurger, Modifier } from '@/lib/db/schema';

export const supabase = createClient();

export const burgersClientService = {
    // Get all burgers
    async getBurgers(): Promise<Burger[]> {
        const { data, error } = await supabase
            .from('burgers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching burgers:', error);
            throw new Error(`Failed to fetch burgers: ${error.message}`);
        }

        return (data || []).map(burger => ({
            id: burger.id,
            nameAr: burger.name_ar,
            nameEn: burger.name_en,
            imageUrl: burger.image_url,
            priceWithVat: burger.price_with_vat.toString(),
            modifiers: Array.isArray(burger.modifiers) ? burger.modifiers as Modifier[] : [],
            createdAt: new Date(burger.created_at),
            updatedAt: new Date(burger.updated_at),
        }));
    },

    async getBurgerById(id: string): Promise<Burger | null> {
        const { data, error } = await supabase
            .from('burgers')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Not found
            }
            console.error('Error fetching burger by ID:', error);
            throw new Error(`Failed to fetch burger: ${error.message}`);
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

    async createBurger(burgerData: Omit<NewBurger, 'id' | 'createdAt' | 'updatedAt'>): Promise<Burger> {
        const { data, error } = await supabase
            .from('burgers')
            .insert({
                name_ar: burgerData.nameAr,
                name_en: burgerData.nameEn,
                image_url: burgerData.imageUrl,
                price_with_vat: parseFloat(burgerData.priceWithVat),
                modifiers: burgerData.modifiers || [],
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating burger:', error);
            throw new Error(`Failed to create burger: ${error.message}`);
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

    async updateBurger(id: string, updates: Partial<Omit<NewBurger, 'id' | 'createdAt'>>): Promise<Burger> {
        const updateData: Record<string, unknown> = {};
        if (updates.nameAr !== undefined) updateData.name_ar = updates.nameAr;
        if (updates.nameEn !== undefined) updateData.name_en = updates.nameEn;
        if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
        if (updates.priceWithVat !== undefined) updateData.price_with_vat = parseFloat(updates.priceWithVat);
        if (updates.modifiers !== undefined) updateData.modifiers = updates.modifiers;
        updateData.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('burgers')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating burger:', error);
            throw new Error(`Failed to update burger: ${error.message}`);
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

    async deleteBurger(id: string): Promise<void> {
        const { error } = await supabase
            .from('burgers')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting burger:', error);
            throw new Error(`Failed to delete burger: ${error.message}`);
        }
    },
};
