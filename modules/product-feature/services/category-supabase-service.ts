import { createClient } from '@/utils/supabase/client';
import type { Json, Database } from '@/database.types';

const supabase = createClient();
type CategoryRow = Database['public']['Tables']['categories']['Row'];

export interface Category {
    id: string;
    businessId: string;
    name: string;
    nameAr?: string | null;
    slug: string;
    description?: string | null;
    icon?: string | null;
    color?: string | null;
    displayOrder: number;
    isActive: boolean;
    parentCategoryId?: string | null;
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

export type NewCategory = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;

export const categorySupabaseService = {
    // Get all categories for a business
    async getCategories(businessId: string): Promise<Category[]> {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('business_id', businessId)
            .eq('is_active', true)
            .order('sort_order', { ascending: true })
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching categories:', error);
            throw new Error(`Failed to fetch categories: ${error.message}`);
        }

        // Transform Supabase response to match our Category type
        return (data || []).map((category: CategoryRow) => ({
            id: category.id,
            businessId: category.business_id,
            name: category.name,
            nameAr: null, // Not available in current schema
            slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
            description: category.description,
            icon: category.icon || '📋',
            color: category.color,
            displayOrder: category.sort_order || 0,
            isActive: category.is_active ?? true,
            parentCategoryId: null, // Not available in current schema
            metadata: (typeof category.metadata === 'object' && category.metadata !== null)
                ? category.metadata as Record<string, unknown>
                : {},
            createdAt: new Date(category.created_at || new Date()),
            updatedAt: new Date(category.updated_at || new Date()),
        }));
    },

    // Get a single category
    async getCategory(categoryId: string): Promise<Category | null> {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', categoryId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            console.error('Error fetching category:', error);
            throw new Error(`Failed to fetch category: ${error.message}`);
        }

        return {
            id: data.id,
            businessId: data.business_id,
            name: data.name,
            nameAr: null, // Not available in current schema
            slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
            description: data.description,
            icon: data.icon || '📋',
            color: data.color,
            displayOrder: data.sort_order || 0,
            isActive: data.is_active ?? true,
            parentCategoryId: null, // Not available in current schema
            metadata: (typeof data.metadata === 'object' && data.metadata !== null)
                ? data.metadata as Record<string, unknown>
                : {},
            createdAt: new Date(data.created_at || new Date()),
            updatedAt: new Date(data.updated_at || new Date()),
        };
    },

    // Create a new category
    async createCategory(categoryData: NewCategory): Promise<Category> {
        const { data, error } = await supabase
            .from('categories')
            .insert({
                business_id: categoryData.businessId,
                name: categoryData.name,
                slug: categoryData.slug,
                description: categoryData.description,
                icon: categoryData.icon,
                color: categoryData.color,
                sort_order: categoryData.displayOrder || 0,
                is_active: categoryData.isActive ?? true,
                metadata: (categoryData.metadata || {}) as Json,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating category:', error);
            throw new Error(`Failed to create category: ${error.message}`);
        }

        return {
            id: data.id,
            businessId: data.business_id,
            name: data.name,
            nameAr: null,
            slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
            description: data.description,
            icon: data.icon || '📋',
            color: data.color,
            displayOrder: data.sort_order || 0,
            isActive: data.is_active ?? true,
            parentCategoryId: null,
            metadata: (typeof data.metadata === 'object' && data.metadata !== null)
                ? data.metadata as Record<string, unknown>
                : {},
            createdAt: new Date(data.created_at || new Date()),
            updatedAt: new Date(data.updated_at || new Date()),
        };
    },

    // Update a category
    async updateCategory(categoryId: string, updates: Partial<NewCategory>): Promise<Category> {
        const updateData: Record<string, unknown> = {};

        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.slug !== undefined) updateData.slug = updates.slug;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.icon !== undefined) updateData.icon = updates.icon;
        if (updates.color !== undefined) updateData.color = updates.color;
        if (updates.displayOrder !== undefined) updateData.sort_order = updates.displayOrder;
        if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
        if (updates.metadata !== undefined) updateData.metadata = updates.metadata as Json;

        updateData.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('categories')
            .update(updateData)
            .eq('id', categoryId)
            .select()
            .single();

        if (error) {
            console.error('Error updating category:', error);
            throw new Error(`Failed to update category: ${error.message}`);
        }

        return {
            id: data.id,
            businessId: data.business_id,
            name: data.name,
            nameAr: null,
            slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
            description: data.description,
            icon: data.icon || '📋',
            color: data.color,
            displayOrder: data.sort_order || 0,
            isActive: data.is_active ?? true,
            parentCategoryId: null,
            metadata: (typeof data.metadata === 'object' && data.metadata !== null)
                ? data.metadata as Record<string, unknown>
                : {},
            createdAt: new Date(data.created_at || new Date()),
            updatedAt: new Date(data.updated_at || new Date()),
        };
    },

    // Get a category by slug
    async getCategoryBySlug(businessId: string, slug: string): Promise<Category | null> {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('business_id', businessId)
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            console.error('Error fetching category by slug:', error);
            throw new Error(`Failed to fetch category: ${error.message}`);
        }

        return {
            id: data.id,
            businessId: data.business_id,
            name: data.name,
            nameAr: null,
            slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
            description: data.description,
            icon: data.icon || '📋',
            color: data.color,
            displayOrder: data.sort_order || 0,
            isActive: data.is_active ?? true,
            parentCategoryId: null,
            metadata: (typeof data.metadata === 'object' && data.metadata !== null)
                ? data.metadata as Record<string, unknown>
                : {},
            createdAt: new Date(data.created_at || new Date()),
            updatedAt: new Date(data.updated_at || new Date()),
        };
    },

    // Delete a category (soft delete)
    async deleteCategory(categoryId: string): Promise<void> {
        const { error } = await supabase
            .from('categories')
            .update({
                is_active: false,
                updated_at: new Date().toISOString()
            })
            .eq('id', categoryId);

        if (error) {
            console.error('Error deleting category:', error);
            throw new Error(`Failed to delete category: ${error.message}`);
        }
    },
};