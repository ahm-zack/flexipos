import { createClient } from '@/utils/supabase/client';
import { categoryClientService } from './category-client-service';

export const supabase = createClient();

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
  isDefault: boolean;
  displayOrder: number;
}

export interface ProductModifier {
  id: string;
  groupId: string;
  groupName: string;
  name: string;
  nameAr?: string;
  price: number;
  isRequired: boolean;
  maxQuantity: number;
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

export const productClientService = {
  // Get all products
  async getProducts(): Promise<Product[]> {
    const stored = localStorage.getItem('flexipos_products');
    const products: Product[] = stored ? JSON.parse(stored) : [];
    
    return products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getProductById(id: string): Promise<Product | null> {
    const stored = localStorage.getItem('flexipos_products');
    const products: Product[] = stored ? JSON.parse(stored) : [];
    
    const product = products.find(p => p.id === id);
    return product || null;
  },

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter(p => p.categoryId === categoryId && p.isActive);
  },

  async getProductsByCategorySlug(businessId: string, categorySlug: string): Promise<{ products: Product[]; category: any }> {
    const category = await categoryClientService.getCategoryBySlug(businessId, categorySlug);
    
    if (!category) {
      throw new Error(`Category with slug "${categorySlug}" not found`);
    }
    
    const products = await this.getProductsByCategory(category.id);
    
    return { products, category };
  },

  async createProduct(productData: NewProduct): Promise<Product> {
    // Validate category exists
    const category = await categoryClientService.getCategoryById(productData.categoryId);
    if (!category) {
      throw new Error(`Category with ID ${productData.categoryId} not found`);
    }

    const newProduct: Product = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...productData,
      images: productData.images || [],
      variants: productData.variants || [],
      modifiers: productData.modifiers || [],
      tags: productData.tags || [],
      isActive: productData.isActive ?? true,
      isFeatured: productData.isFeatured ?? false,
      metadata: productData.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const stored = localStorage.getItem('flexipos_products');
    const products: Product[] = stored ? JSON.parse(stored) : [];
    products.push(newProduct);
    localStorage.setItem('flexipos_products', JSON.stringify(products));

    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<NewProduct>): Promise<Product> {
    // Validate category if provided
    if (updates.categoryId) {
      const category = await categoryClientService.getCategoryById(updates.categoryId);
      if (!category) {
        throw new Error(`Category with ID ${updates.categoryId} not found`);
      }
    }

    const stored = localStorage.getItem('flexipos_products');
    const products: Product[] = stored ? JSON.parse(stored) : [];
    
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      throw new Error(`Product with ID ${id} not found`);
    }

    const updatedProduct: Product = {
      ...products[productIndex],
      ...updates,
      updatedAt: new Date(),
    };

    products[productIndex] = updatedProduct;
    localStorage.setItem('flexipos_products', JSON.stringify(products));

    return updatedProduct;
  },

  async deleteProduct(id: string): Promise<void> {
    const stored = localStorage.getItem('flexipos_products');
    const products: Product[] = stored ? JSON.parse(stored) : [];
    
    const filteredProducts = products.filter(p => p.id !== id);
    localStorage.setItem('flexipos_products', JSON.stringify(filteredProducts));
  },

  async searchProducts(query: string): Promise<Product[]> {
    const products = await this.getProducts();
    const lowercaseQuery = query.toLowerCase();
    
    return products.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.nameAr?.toLowerCase().includes(lowercaseQuery) ||
      product.description?.toLowerCase().includes(lowercaseQuery) ||
      product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  },
};
