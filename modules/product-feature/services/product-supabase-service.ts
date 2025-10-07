import { createClient } from '@/utils/supabase/client';
import type { Json, Database } from '@/database.types';

export interface Product {
    id: string;
    businessId: string;
    categoryId: string;
    name: string;
    nameAr?: string;
    description?: string;
    sku?: string;
    barcode?: string;
    price: number;
    images: string[];
    variants: ProductVariant[];
    modifiers: ProductModifier[];
    tags: string[];
    isActive: boolean;
    isFeatured: boolean;
    stockQuantity?: number;
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductVariant {
    id: string;
    name: string;
    nameAr?: string;
    price: number;
    sku?: string;
    isDefault: boolean;
    isActive: boolean;
    metadata: Record<string, unknown>;
}

export interface ProductModifier {
    id: string;
    name: string;
    nameAr?: string;
    type: 'single' | 'multiple';
    isRequired: boolean;
    maxSelections?: number;
    minSelections?: number;
    options: ModifierOption[];
    displayOrder: number;
    isActive: boolean;
    metadata: Record<string, unknown>;
}

export interface ModifierOption {
    id: string;
    name: string;
    nameAr?: string;
    price: number;
    isDefault: boolean;
    isActive: boolean;
    metadata: Record<string, unknown>;
}

export interface NewProduct {
    businessId: string;
    categoryId: string;
    name: string;
    nameAr?: string;
    description?: string;
    sku?: string;
    barcode?: string;
    price: number;
    images?: string[];
    variants?: ProductVariant[];
    modifiers?: ProductModifier[];
    tags?: string[];
    isActive?: boolean;
    isFeatured?: boolean;
    stockQuantity?: number;
    metadata?: Record<string, unknown>;
}

class ProductSupabaseService {
    private supabase = createClient();

    /**
     * Get all products for a business
     */
    async getProducts(businessId: string): Promise<Product[]> {
        try {
            const { data, error } = await this.supabase
                .from('products')
                .select('*')
                .eq('business_id', businessId)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching products:', error);
                throw new Error(`Failed to fetch products: ${error.message}`);
            }

            // Transform Supabase response to match our Product type
            return data?.map(item => this.transformSupabaseProduct(item)) || [];
        } catch (error) {
            // Handle any other errors gracefully
            console.warn('Product service error, returning empty list:', error);
            return [];
        }
    }

    /**
     * Get products by category
     */
    async getProductsByCategory(businessId: string, categoryId: string): Promise<Product[]> {
        try {
            const { data, error } = await this.supabase
                .from('products')
                .select('*')
                .eq('business_id', businessId)
                .eq('category_id', categoryId)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching products by category:', error);
                throw new Error(`Failed to fetch products: ${error.message}`);
            }

            // Transform Supabase response to match our Product type
            return data?.map((item: Record<string, unknown>) => this.transformSupabaseProduct(item)) || [];
        } catch (error) {
            // Handle any other errors gracefully
            console.warn('Product service error, returning empty list:', error);
            return [];
        }
    }

    /**
     * Get a single product by ID
     */
    async getProductById(id: string): Promise<Product | null> {
        const { data, error } = await this.supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            console.error('Error fetching product:', error);
            throw new Error(`Failed to fetch product: ${error.message}`);
        }

        return data ? this.transformSupabaseProduct(data) : null;
    }

    /**
     * Create a new product
     */
    async createProduct(productData: NewProduct): Promise<Product> {
        const insertData: Database['public']['Tables']['products']['Insert'] = {
            business_id: productData.businessId,
            category_id: productData.categoryId,
            name: productData.name,
            name_ar: productData.nameAr || null,
            description: productData.description || null,
            sku: productData.sku || null,
            barcode: productData.barcode || null,
            price: productData.price,
            images: productData.images || null,
            variants: (productData.variants || []) as unknown as Json,
            modifiers: (productData.modifiers || []) as unknown as Json,
            tags: productData.tags || null,
            is_active: productData.isActive ?? true,
            is_featured: productData.isFeatured ?? false,
            stock_quantity: productData.stockQuantity || null,
            metadata: (productData.metadata || {}) as Json,
        };

        const { data, error } = await this.supabase
            .from('products')
            .insert(insertData)
            .select()
            .single();

        if (error) {
            console.error('Error creating product:', error);
            throw new Error(`Failed to create product: ${error.message}`);
        }

        return this.transformSupabaseProduct(data);
    }

    /**
     * Update a product
     */
    async updateProduct(id: string, updates: Partial<NewProduct>): Promise<Product> {
        const updateData: Record<string, unknown> = {};

        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.nameAr !== undefined) updateData.name_ar = updates.nameAr;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.sku !== undefined) updateData.sku = updates.sku;
        if (updates.barcode !== undefined) updateData.barcode = updates.barcode;
        if (updates.price !== undefined) updateData.price = updates.price;
        if (updates.images !== undefined) updateData.images = updates.images as Json;
        if (updates.variants !== undefined) updateData.variants = updates.variants as unknown as Json;
        if (updates.modifiers !== undefined) updateData.modifiers = updates.modifiers as unknown as Json;
        if (updates.tags !== undefined) updateData.tags = updates.tags as Json;
        if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
        if (updates.isFeatured !== undefined) updateData.is_featured = updates.isFeatured;
        if (updates.stockQuantity !== undefined) updateData.stock_quantity = updates.stockQuantity;
        if (updates.metadata !== undefined) updateData.metadata = updates.metadata as Json;

        updateData.updated_at = new Date().toISOString();

        const { data, error } = await this.supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating product:', error);
            throw new Error(`Failed to update product: ${error.message}`);
        }

        return this.transformSupabaseProduct(data);
    }

    /**
     * Delete a product (hard delete)
     */
    async deleteProduct(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting product:', error);
            throw new Error(`Failed to delete product: ${error.message}`);
        }
    }

    /**
     * Transform Supabase data to our Product interface
     */
    private transformSupabaseProduct(item: Record<string, unknown>): Product {
        return {
            id: item.id as string,
            businessId: item.business_id as string,
            categoryId: item.category_id as string,
            name: item.name as string,
            nameAr: (item.name_ar as string) || undefined,
            description: (item.description as string) || undefined,
            sku: (item.sku as string) || undefined,
            barcode: (item.barcode as string) || undefined,
            price: item.price as number,
            images: Array.isArray(item.images) ? item.images as string[] : [],
            variants: Array.isArray(item.variants) ? item.variants as ProductVariant[] : [],
            modifiers: Array.isArray(item.modifiers) ? item.modifiers as ProductModifier[] : [],
            tags: Array.isArray(item.tags) ? item.tags as string[] : [],
            isActive: item.is_active as boolean,
            isFeatured: item.is_featured as boolean,
            stockQuantity: (item.stock_quantity as number) || undefined,
            metadata: (typeof item.metadata === 'object' && item.metadata !== null)
                ? item.metadata as Record<string, unknown>
                : {},
            createdAt: new Date(item.created_at as string),
            updatedAt: new Date(item.updated_at as string),
        };
    }
}

export const productSupabaseService = new ProductSupabaseService();