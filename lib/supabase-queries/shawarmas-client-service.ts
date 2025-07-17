import { createClient } from '@/utils/supabase/client';
import type { Shawarma, NewShawarma, Modifier } from '@/lib/db/schema';

export const supabase = createClient();

export const shawarmasClientService = {
    // Get all shawarmas
    async getShawarmas(): Promise<Shawarma[]> {
        const { data, error } = await supabase
            .from('shawarmas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching shawarmas:', error);
            throw new Error(`Failed to fetch shawarmas: ${error.message}`);
        }

        return (data || []).map(shawarma => ({
            id: shawarma.id,
            nameAr: shawarma.name_ar,
            nameEn: shawarma.name_en,
            imageUrl: shawarma.image_url,
            priceWithVat: shawarma.price_with_vat.toString(),
            modifiers: Array.isArray(shawarma.modifiers) ? shawarma.modifiers as Modifier[] : [],
            createdAt: new Date(shawarma.created_at),
            updatedAt: new Date(shawarma.updated_at),
        }));
    },

    async getShawarmaById(id: string): Promise<Shawarma | null> {
        const { data, error } = await supabase
            .from('shawarmas')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Not found
            }
            console.error('Error fetching shawarma by ID:', error);
            throw new Error(`Failed to fetch shawarma: ${error.message}`);
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

    async createShawarma(shawarmaData: Omit<NewShawarma, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shawarma> {
        const { data, error } = await supabase
            .from('shawarmas')
            .insert({
                name_ar: shawarmaData.nameAr,
                name_en: shawarmaData.nameEn,
                image_url: shawarmaData.imageUrl,
                price_with_vat: parseFloat(shawarmaData.priceWithVat),
                modifiers: shawarmaData.modifiers || [],
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating shawarma:', error);
            throw new Error(`Failed to create shawarma: ${error.message}`);
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

    async updateShawarma(id: string, updates: Partial<Omit<NewShawarma, 'id' | 'createdAt'>>): Promise<Shawarma> {
        const updateData: Record<string, unknown> = {};
        if (updates.nameAr !== undefined) updateData.name_ar = updates.nameAr;
        if (updates.nameEn !== undefined) updateData.name_en = updates.nameEn;
        if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
        if (updates.priceWithVat !== undefined) updateData.price_with_vat = parseFloat(updates.priceWithVat);
        if (updates.modifiers !== undefined) updateData.modifiers = updates.modifiers;
        updateData.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('shawarmas')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating shawarma:', error);
            throw new Error(`Failed to update shawarma: ${error.message}`);
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

    async deleteShawarma(id: string): Promise<void> {
        const { error } = await supabase
            .from('shawarmas')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting shawarma:', error);
            throw new Error(`Failed to delete shawarma: ${error.message}`);
        }
    },
};
