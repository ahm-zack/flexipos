import { createClient } from "@/utils/supabase/client";
import { Modifier, NewSandwich, Sandwich } from "@/lib/db/schema";

export const supabase = createClient();

export const sandwichClientService = {
  // Get all sandwiches
  async getSandwiches(): Promise<Sandwich[]> {
    const { data, error } = await supabase
      .from('sandwiches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sandwiches:', error);
      throw new Error(`Failed to fetch sandwiches: ${error.message}`);
    }

    return (data || []).map(this.transformSandwichFromDB);
  },

  // Get single sandwich by ID
  async getSandwichById(id: string): Promise<Sandwich | null> {
    const { data, error } = await supabase
      .from('sandwiches')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Sandwich not found
      }
      console.error('Error fetching sandwich by ID:', error);
      throw new Error(`Failed to fetch sandwich: ${error.message}`);
    }

    return this.transformSandwichFromDB(data);
  },

  // Create new sandwich
  async createSandwich(sandwichData: Omit<NewSandwich, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sandwich> {
    const { data, error } = await supabase
      .from('sandwiches')
      .insert({
        type: sandwichData.type,
        name_ar: sandwichData.nameAr,
        name_en: sandwichData.nameEn,
        size: sandwichData.size,
        image_url: sandwichData.imageUrl || '',
        price_with_vat: parseFloat(sandwichData.priceWithVat),
        modifiers: sandwichData.modifiers || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating sandwich:', error);
      throw new Error(`Failed to create sandwich: ${error.message}`);
    }

    return this.transformSandwichFromDB(data);
  },

  // Update existing sandwich
  async updateSandwich(id: string, updates: Partial<Omit<NewSandwich, 'id' | 'createdAt'>>): Promise<Sandwich> {
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
      .from('sandwiches')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating sandwich:', error);
      throw new Error(`Failed to update sandwich: ${error.message}`);
    }

    return this.transformSandwichFromDB(data);
  },

  // Transform database row to Sandwich type
  transformSandwichFromDB(data: Record<string, unknown>): Sandwich {
    return {
      id: data.id as string,
      type: data.type as Sandwich['type'],
      nameAr: data.name_ar as string,
      nameEn: data.name_en as string,
      size: data.size as Sandwich['size'],
      imageUrl: (data.image_url as string) || '',
      priceWithVat: (data.price_with_vat as number).toString(),
      modifiers: (Array.isArray(data.modifiers) && data.modifiers.length > 0) ? data.modifiers as Modifier[] : [],
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    };
  },

  // Delete sandwich
  async deleteSandwich(id: string): Promise<void> {
    const { error } = await supabase
      .from('sandwiches')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting sandwich:', error);
      throw new Error(`Failed to delete sandwich: ${error.message}`);
    }
  },
};
