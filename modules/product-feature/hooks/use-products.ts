"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
    ProductQueryParams,
    CacheContext
} from '../types';
import { productClientService, type Product, type NewProduct } from '../services/product-client-service';
import { productKeys } from '../queries/product-keys';

// Cache strategies for different contexts - Following pizza-feature pattern
const CACHE_STRATEGIES = {
    ADMIN: {
        staleTime: 10 * 60 * 1000, // 10 minutes - longer for persistence
        gcTime: 30 * 60 * 1000, // 30 minutes - keep data longer
        refetchOnWindowFocus: false, // Don't refetch when returning to page
        refetchOnMount: false, // Don't refetch if data exists and not stale
    },
    CASHIER: {
        staleTime: 10 * 60 * 1000, // 10 minutes (less frequent changes)
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false, // Menu is more stable
        refetchOnMount: false, // Don't refetch if data exists
    },
    CUSTOMER: {
        staleTime: 15 * 60 * 1000, // 15 minutes (very stable)
        gcTime: 60 * 60 * 1000, // 1 hour
        refetchOnWindowFocus: false, // Customer doesn't need real-time
        refetchOnMount: false, // Don't refetch if data exists
    },
} as const;

// Enhanced fetch function with better error handling
const fetchProducts = async (businessId: string): Promise<Product[]> => {
    try {
        const products = await productClientService.getProducts();
        return products.filter(p => p.businessId === businessId);
    } catch (error) {
        console.error('Error fetching products:', error);
        throw new Error('Failed to load products. Please try again.');
    }
};

const fetchProductsByCategory = async (businessId: string, categoryId: string): Promise<Product[]> => {
    try {
        const products = await productClientService.getProductsByCategory(categoryId);
        return products;
    } catch (error) {
        console.error('Error fetching products by category:', error);
        throw new Error('Failed to load products. Please try again.');
    }
};

const fetchProductsByCategorySlug = async (businessId: string, categorySlug: string) => {
    try {
        const result = await productClientService.getProductsByCategorySlug(businessId, categorySlug);
        return result;
    } catch (error) {
        console.error('Error fetching products by category slug:', error);
        throw new Error('Failed to load products. Please try again.');
    }
};

const createProduct = async (productData: NewProduct): Promise<Product> => {
    try {
        const processedData = {
            ...productData,
            price: typeof productData.price === 'string'
                ? parseFloat(productData.price)
                : productData.price,
        };

        const newProduct = await productClientService.createProduct(processedData);
        return newProduct;
    } catch (error) {
        console.error('Error creating product:', error);
        throw error instanceof Error ? error : new Error('Failed to create product');
    }
};

const updateProduct = async (id: string, productData: Partial<NewProduct>): Promise<Product> => {
    try {
        const processedData = {
            ...productData,
            ...(productData.price && {
                price: typeof productData.price === 'string'
                    ? parseFloat(productData.price)
                    : productData.price,
            }),
        };

        const updatedProduct = await productClientService.updateProduct(id, processedData);
        return updatedProduct;
    } catch (error) {
        console.error('Error updating product:', error);
        throw error instanceof Error ? error : new Error('Failed to update product');
    }
};

const deleteProduct = async (id: string): Promise<void> => {
    try {
        await productClientService.deleteProduct(id);
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error instanceof Error ? error : new Error('Failed to delete product');
    }
};

// Main hooks following pizza-feature pattern

/**
 * Get all products for a business
 */
export function useProducts(businessId: string, context: CacheContext = 'admin', params?: ProductQueryParams) {
    const cacheStrategy = CACHE_STRATEGIES[context.toUpperCase() as keyof typeof CACHE_STRATEGIES];

    return useQuery({
        queryKey: productKeys.list(businessId, JSON.stringify(params)),
        queryFn: () => fetchProducts(businessId),
        ...cacheStrategy,
        enabled: !!businessId,
    });
}

/**
 * Get products by category ID
 */
export function useProductsByCategory(businessId: string, categoryId: string, context: CacheContext = 'admin') {
    const cacheStrategy = CACHE_STRATEGIES[context.toUpperCase() as keyof typeof CACHE_STRATEGIES];

    return useQuery({
        queryKey: productKeys.byCategory(businessId, categoryId),
        queryFn: () => fetchProductsByCategory(businessId, categoryId),
        ...cacheStrategy,
        enabled: !!businessId && !!categoryId,
    });
}

/**
 * Get products by category slug - Main hook for menu pages
 */
export function useProductsByCategorySlug(businessId: string, categorySlug: string, context: CacheContext = 'admin') {
    const cacheStrategy = CACHE_STRATEGIES[context.toUpperCase() as keyof typeof CACHE_STRATEGIES];

    return useQuery({
        queryKey: productKeys.byCategorySlug(businessId, categorySlug),
        queryFn: () => fetchProductsByCategorySlug(businessId, categorySlug),
        ...cacheStrategy,
        enabled: !!businessId && !!categorySlug,
    });
}

/**
 * Get single product by ID
 */
export function useProduct(id: string, context: CacheContext = 'admin') {
    const cacheStrategy = CACHE_STRATEGIES[context.toUpperCase() as keyof typeof CACHE_STRATEGIES];

    return useQuery({
        queryKey: productKeys.detail(id),
        queryFn: () => productClientService.getProductById(id),
        ...cacheStrategy,
        enabled: !!id,
    });
}

/**
 * Search products
 */
export function useSearchProducts(businessId: string, query: string, context: CacheContext = 'admin') {
    const cacheStrategy = CACHE_STRATEGIES[context.toUpperCase() as keyof typeof CACHE_STRATEGIES];

    return useQuery({
        queryKey: productKeys.search(businessId, query),
        queryFn: () => productClientService.searchProducts(query),
        ...cacheStrategy,
        enabled: !!businessId && !!query && query.length >= 2, // Only search with 2+ characters
    });
}

// Mutation hooks

/**
 * Create product mutation
 */
export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createProduct,
        onSuccess: (newProduct, variables) => {
            // Invalidate products list for the business
            queryClient.invalidateQueries({
                queryKey: productKeys.list(variables.businessId),
            });

            // Invalidate category-specific queries
            queryClient.invalidateQueries({
                queryKey: productKeys.byCategory(variables.businessId, variables.categoryId),
            });

            // Add the new product to cache
            queryClient.setQueryData(
                productKeys.detail(newProduct.id),
                newProduct
            );

            toast.success(`Product "${newProduct.name}" created successfully`);
            console.log(`✅ Product "${newProduct.name}" created successfully`);
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to create product';
            toast.error(message);
            console.error('❌ Failed to create product:', error);
        },
    });
}

/**
 * Update product mutation
 */
export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<NewProduct> & { id: string }) => updateProduct(data.id, data),
        onSuccess: (updatedProduct, variables) => {
            // Update the specific product in cache
            queryClient.setQueryData(
                productKeys.detail(variables.id),
                updatedProduct
            );

            // Invalidate products lists to reflect changes
            queryClient.invalidateQueries({
                queryKey: productKeys.lists(),
            });

            // If category changed, invalidate both old and new category queries
            if (variables.categoryId) {
                queryClient.invalidateQueries({
                    queryKey: productKeys.byCategory(updatedProduct.businessId, variables.categoryId),
                });
            }

            toast.success(`Product "${updatedProduct.name}" updated successfully`);
            console.log(`✅ Product "${updatedProduct.name}" updated successfully`);
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to update product';
            toast.error(message);
            console.error('❌ Failed to update product:', error);
        },
    });
}

/**
 * Delete product mutation
 */
export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteProduct,
        onSuccess: (_, deletedId) => {
            // Remove from cache
            queryClient.removeQueries({
                queryKey: productKeys.detail(deletedId),
            });

            // Invalidate products lists to reflect deletion
            queryClient.invalidateQueries({
                queryKey: productKeys.lists(),
            });

            toast.success('Product deleted successfully');
            console.log(`✅ Product deleted successfully`);
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to delete product';
            toast.error(message);
            console.error('❌ Failed to delete product:', error);
        },
    });
}

/**
 * Bulk operations
 */
export function useBulkUpdateProducts() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (updates: (Partial<NewProduct> & { id: string })[]) => {
            const results = await Promise.all(
                updates.map(update => updateProduct(update.id, update))
            );
            return results;
        },
        onSuccess: (updatedProducts) => {
            // Update each product in cache
            updatedProducts.forEach(product => {
                queryClient.setQueryData(
                    productKeys.detail(product.id),
                    product
                );
            });

            // Invalidate lists
            queryClient.invalidateQueries({
                queryKey: productKeys.lists(),
            });

            toast.success(`Bulk update completed for ${updatedProducts.length} products`);
            console.log(`✅ Bulk update completed for ${updatedProducts.length} products`);
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to bulk update products';
            toast.error(message);
            console.error('❌ Failed to bulk update products:', error);
        },
    });
}