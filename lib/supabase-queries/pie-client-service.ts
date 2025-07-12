import { createClient } from "@/utils/supabase/client";
import { Modifier, NewPie, Pie } from "@/lib/db/schema";

export const supabase = createClient();

export const pieClientService = {
  // Get all pies
  async getPies(): Promise<Pie[]> {
    const { data, error } = await supabase
      .from('pies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pies:', error);
      throw new Error(`Failed to fetch pies: ${error.message}`);
    }

    return (data || []).map(this.transformPieFromDB);
  },

  // Get single pie by ID
  async getPieById(id: string): Promise<Pie | null> {
    const { data, error } = await supabase
      .from('pies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Pie not found
      }
      console.error('Error fetching pie by ID:', error);
      throw new Error(`Failed to fetch pie: ${error.message}`);
    }

    return this.transformPieFromDB(data);
  },

  // Create new pie
  async createPie(pieData: Omit<NewPie, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pie> {
    const { data, error } = await supabase
      .from('pies')
      .insert({
        type: pieData.type,
        name_ar: pieData.nameAr,
        name_en: pieData.nameEn,
        size: pieData.size,
        image_url: pieData.imageUrl || '',
        price_with_vat: parseFloat(pieData.priceWithVat),
        modifiers: pieData.modifiers || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating pie:', error);
      throw new Error(`Failed to create pie: ${error.message}`);
    }

    return this.transformPieFromDB(data);
  },

  // Update existing pie
  async updatePie(id: string, updates: Partial<Omit<NewPie, 'id' | 'createdAt'>>): Promise<Pie> {
    const updateData: Record<string, unknown> = {};
    
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.nameAr !== undefined) updateData.name_ar = updates.nameAr;
    if (updates.nameEn !== undefined) updateData.name_en = updates.nameEn;
    if (updates.size !== undefined) updateData.size = updates.size;
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl || '';
    if (updates.priceWithVat !== undefined) updateData.price_with_vat = parseFloat(updates.priceWithVat);
    if (updates.modifiers !== undefined) updateData.modifiers = updates.modifiers;
    
    // Always update the updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('pies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating pie:', error);
      throw new Error(`Failed to update pie: ${error.message}`);
    }

    return this.transformPieFromDB(data);
  },

  // Transform database row to Pie type
  transformPieFromDB(data: Record<string, unknown>): Pie {
    return {
      id: data.id as string,
      type: data.type as Pie['type'],
      nameAr: data.name_ar as string,
      nameEn: data.name_en as string,
      size: data.size as Pie['size'],
      imageUrl: (data.image_url as string) || '',
      priceWithVat: (data.price_with_vat as number).toString(),
      modifiers: (Array.isArray(data.modifiers) && data.modifiers.length > 0) ? data.modifiers as Modifier[] : [],
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    };
  },

  // Delete pie
  async deletePie(id: string): Promise<void> {
    const { error } = await supabase
      .from('pies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting pie:', error);
      throw new Error(`Failed to delete pie: ${error.message}`);
    }
  },
};

