import { createClient } from '@/utils/supabase/client';

export const supabase = createClient();

export interface Category {
    id: string;
    businessId: string;
    name: string;
    nameAr?: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
    displayOrder: number;
    isActive: boolean;
    parentCategoryId?: string;
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

export interface NewCategory {
    businessId: string;
    name: string;
    nameAr?: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
    displayOrder?: number;
    isActive?: boolean;
    parentCategoryId?: string;
    metadata?: Record<string, unknown>;
}

export const categoryClientService = {
    async getCategories(businessId: string): Promise<Category[]> {
        const stored = localStorage.getItem('flexipos_categories');
        const categories: Category[] = stored ? JSON.parse(stored) : [];

        return categories
            .filter(c => c.businessId === businessId && c.isActive)
            .sort((a, b) => a.displayOrder - b.displayOrder);
    },

    async getCategoryById(id: string): Promise<Category | null> {
        const stored = localStorage.getItem('flexipos_categories');
        const categories: Category[] = stored ? JSON.parse(stored) : [];

        const category = categories.find(c => c.id === id);
        return category || null;
    },

    async getCategoryBySlug(businessId: string, slug: string): Promise<Category | null> {
        const categories = await this.getCategories(businessId);
        const category = categories.find(c => c.slug === slug);
        return category || null;
    },

    async createCategory(categoryData: NewCategory): Promise<Category> {
        const newCategory: Category = {
            id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...categoryData,
            displayOrder: categoryData.displayOrder || 0,
            isActive: categoryData.isActive ?? true,
            metadata: categoryData.metadata || {},
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const stored = localStorage.getItem('flexipos_categories');
        const categories: Category[] = stored ? JSON.parse(stored) : [];
        categories.push(newCategory);
        localStorage.setItem('flexipos_categories', JSON.stringify(categories));

        return newCategory;
    },

    async updateCategory(id: string, updates: Partial<NewCategory>): Promise<Category> {
        const stored = localStorage.getItem('flexipos_categories');
        const categories: Category[] = stored ? JSON.parse(stored) : [];

        const categoryIndex = categories.findIndex(c => c.id === id);
        if (categoryIndex === -1) {
            throw new Error(`Category with ID ${id} not found`);
        }

        const updatedCategory: Category = {
            ...categories[categoryIndex],
            ...updates,
            updatedAt: new Date(),
        };

        categories[categoryIndex] = updatedCategory;
        localStorage.setItem('flexipos_categories', JSON.stringify(categories));

        return updatedCategory;
    },

    async deleteCategory(id: string): Promise<void> {
        const stored = localStorage.getItem('flexipos_categories');
        const categories: Category[] = stored ? JSON.parse(stored) : [];

        const filteredCategories = categories.filter(c => c.id !== id);
        localStorage.setItem('flexipos_categories', JSON.stringify(filteredCategories));
    },
};
