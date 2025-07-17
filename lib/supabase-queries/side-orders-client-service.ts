import { createClient } from '@/utils/supabase/client';
import type { SideOrder, NewSideOrder, Modifier } from '@/lib/db/schema';

export const supabase = createClient();

export const sideOrdersClientService = {
    // Get all side orders
    async getSideOrders(): Promise<SideOrder[]> {
        const { data, error } = await supabase
            .from('side_orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching side orders:', error);
            throw new Error(`Failed to fetch side orders: ${error.message}`);
        }

        return (data || []).map(sideOrder => ({
            id: sideOrder.id,
            nameAr: sideOrder.name_ar,
            nameEn: sideOrder.name_en,
            imageUrl: sideOrder.image_url,
            priceWithVat: sideOrder.price_with_vat.toString(),
            modifiers: Array.isArray(sideOrder.modifiers) ? sideOrder.modifiers as Modifier[] : [],
            createdAt: new Date(sideOrder.created_at),
            updatedAt: new Date(sideOrder.updated_at),
        }));
    },

    async getSideOrderById(id: string): Promise<SideOrder | null> {
        const { data, error } = await supabase
            .from('side_orders')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Not found
            }
            console.error('Error fetching side order by ID:', error);
            throw new Error(`Failed to fetch side order: ${error.message}`);
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

    async createSideOrder(sideOrderData: Omit<NewSideOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<SideOrder> {
        const { data, error } = await supabase
            .from('side_orders')
            .insert({
                name_ar: sideOrderData.nameAr,
                name_en: sideOrderData.nameEn,
                image_url: sideOrderData.imageUrl,
                price_with_vat: parseFloat(sideOrderData.priceWithVat),
                modifiers: sideOrderData.modifiers || [],
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating side order:', error);
            throw new Error(`Failed to create side order: ${error.message}`);
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

    async updateSideOrder(id: string, updates: Partial<Omit<NewSideOrder, 'id' | 'createdAt'>>): Promise<SideOrder> {
        const updateData: Record<string, unknown> = {};
        if (updates.nameAr !== undefined) updateData.name_ar = updates.nameAr;
        if (updates.nameEn !== undefined) updateData.name_en = updates.nameEn;
        if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
        if (updates.priceWithVat !== undefined) updateData.price_with_vat = parseFloat(updates.priceWithVat);
        if (updates.modifiers !== undefined) updateData.modifiers = updates.modifiers;
        updateData.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('side_orders')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating side order:', error);
            throw new Error(`Failed to update side order: ${error.message}`);
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

    async deleteSideOrder(id: string): Promise<void> {
        const { error } = await supabase
            .from('side_orders')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting side order:', error);
            throw new Error(`Failed to delete side order: ${error.message}`);
        }
    },
};
