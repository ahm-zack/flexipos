import { createClient } from '@/utils/supabase/client';
import type { MiniPie, NewMiniPie, Modifier } from '@/lib/db/schema';

export const supabase = createClient();

export const miniPieClientService = {
    // Get all mini pies
    async getMiniPies(): Promise<MiniPie[]> {
        const { data, error } = await supabase
            .from('mini_pies')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching mini pies:', error);
            throw new Error(`Failed to fetch mini pies: ${error.message}`);
        }

        // Transform Supabase response to match our MiniPie type
        return (data || []).map(miniPie => ({
            id: miniPie.id,
            type: miniPie.type,
            nameAr: miniPie.name_ar,
            nameEn: miniPie.name_en,
            size: miniPie.size,
            imageUrl: miniPie.image_url,
            priceWithVat: miniPie.price_with_vat.toString(),
            modifiers: Array.isArray(miniPie.modifiers) ? miniPie.modifiers as Modifier[] : [],
            createdAt: miniPie.created_at ? new Date(miniPie.created_at) : new Date(),
            updatedAt: miniPie.updated_at ? new Date(miniPie.updated_at) : new Date(),
        }));
    },

    async getMiniPieById(id: string): Promise<MiniPie | null> {
        const { data, error } = await supabase
            .from('mini_pies')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Mini pie not found
            }
            console.error('Error fetching mini pie by ID:', error);
            throw new Error(`Failed to fetch mini pie: ${error.message}`);
        }

        // Transform Supabase response to match our MiniPie type
        return {
            id: data.id,
            type: data.type,
            nameAr: data.name_ar,
            nameEn: data.name_en,
            size: data.size,
            imageUrl: data.image_url,
            priceWithVat: data.price_with_vat.toString(),
            modifiers: Array.isArray(data.modifiers) ? data.modifiers as Modifier[] : [],
            createdAt: data.created_at ? new Date(data.created_at) : new Date(),
            updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
        };
    },

    async createMiniPie(miniPieData: Omit<NewMiniPie, 'id' | 'createdAt' | 'updatedAt'>): Promise<MiniPie> {
        const { data, error } = await supabase
            .from('mini_pies')
            .insert({
                type: miniPieData.type,
                name_ar: miniPieData.nameAr,
                name_en: miniPieData.nameEn,
                size: miniPieData.size,
                image_url: miniPieData.imageUrl,
                price_with_vat: miniPieData.priceWithVat,
                modifiers: miniPieData.modifiers || [],
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating mini pie:', error);
            throw new Error(`Failed to create mini pie: ${error.message}`);
        }

        // Transform response to match our schema
        return {
            id: data.id,
            type: data.type,
            nameAr: data.name_ar,
            nameEn: data.name_en,
            size: data.size,
            imageUrl: data.image_url,
            priceWithVat: data.price_with_vat.toString(),
            modifiers: Array.isArray(data.modifiers) ? data.modifiers as Modifier[] : [],
            createdAt: data.created_at ? new Date(data.created_at) : new Date(),
            updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
        };
    },

    async updateMiniPie(id: string, updates: Partial<Omit<NewMiniPie, 'id' | 'createdAt'>>): Promise<MiniPie> {
        const updateData: Record<string, unknown> = {};

        if (updates.nameAr !== undefined) updateData.name_ar = updates.nameAr;
        if (updates.nameEn !== undefined) updateData.name_en = updates.nameEn;
        if (updates.type !== undefined) updateData.type = updates.type;
        if (updates.size !== undefined) updateData.size = updates.size;
        if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
        if (updates.priceWithVat !== undefined) updateData.price_with_vat = updates.priceWithVat;
        if (updates.modifiers !== undefined) updateData.modifiers = updates.modifiers;

        // Always update the updated_at timestamp
        updateData.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('mini_pies')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating mini pie:', error);
            throw new Error(`Failed to update mini pie: ${error.message}`);
        }

        // Transform response to match our schema
        return {
            id: data.id,
            type: data.type,
            nameAr: data.name_ar,
            nameEn: data.name_en,
            size: data.size,
            imageUrl: data.image_url,
            priceWithVat: data.price_with_vat.toString(),
            modifiers: Array.isArray(data.modifiers) ? data.modifiers as Modifier[] : [],
            createdAt: data.created_at ? new Date(data.created_at) : new Date(),
            updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
        };
    },

    async deleteMiniPie(id: string): Promise<void> {
        const { error } = await supabase
            .from('mini_pies')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting mini pie:', error);
            throw new Error(`Failed to delete mini pie: ${error.message}`);
        }
    },
};
