import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productSupabaseService, type Product } from "../services/product-supabase-service";
import { toast } from "sonner";

// Query keys for React Query caching
export const productKeys = {
    all: ['products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (businessId: string) => [...productKeys.lists(), businessId] as const,
    listByCategory: (businessId: string, categoryId: string) => [...productKeys.lists(), businessId, categoryId] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (id: string) => [...productKeys.details(), id] as const,
};

// Hook to get all products for a business
export function useProducts(businessId: string | null) {
    return useQuery({
        queryKey: productKeys.list(businessId || 'no-business'),
        queryFn: () => {
            if (!businessId) {
                throw new Error('Business ID is required to fetch products');
            }
            return productSupabaseService.getProducts(businessId);
        },
        enabled: !!businessId,
    });
}

// Hook to get products by category
export function useProductsByCategory(businessId: string | null, categoryId: string) {
    return useQuery({
        queryKey: productKeys.listByCategory(businessId || 'no-business', categoryId),
        queryFn: () => {
            if (!businessId) {
                throw new Error('Business ID is required to fetch products');
            }
            return productSupabaseService.getProductsByCategory(businessId, categoryId);
        },
        enabled: !!businessId && !!categoryId,
    });
}

// Hook to get a single product
export function useProduct(productId: string) {
    return useQuery({
        queryKey: productKeys.detail(productId),
        queryFn: () => productSupabaseService.getProductById(productId),
        enabled: !!productId,
    });
}

// Hook to create a new product
export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: productSupabaseService.createProduct.bind(productSupabaseService),
        onSuccess: () => {
            // Invalidate and refetch products list
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            toast.success("Product created successfully!");
        },
        onError: (error: Error) => {
            toast.error(`Failed to create product: ${error.message}`);
        },
    });
}

// Hook to update a product
export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Product> }) =>
            productSupabaseService.updateProduct(id, updates),
        onSuccess: (data) => {
            // Update the specific product in cache
            queryClient.setQueryData(productKeys.detail(data.id), data);
            // Invalidate lists to refresh them
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            toast.success("Product updated successfully!");
        },
        onError: (error: Error) => {
            toast.error(`Failed to update product: ${error.message}`);
        },
    });
}

// Hook to delete a product
export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productId: string) => productSupabaseService.deleteProduct(productId),
        onSuccess: (_, productId) => {
            // Remove the product from cache
            queryClient.removeQueries({ queryKey: productKeys.detail(productId) });
            // Invalidate lists to refresh them
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            toast.success("Product deleted successfully!");
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete product: ${error.message}`);
        },
    });
}

// Hook to toggle product active status
export function useToggleProductStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            productSupabaseService.updateProduct(id, { isActive }),
        onSuccess: (data) => {
            // Update the specific product in cache
            queryClient.setQueryData(productKeys.detail(data.id), data);
            // Invalidate lists to refresh them
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            toast.success(`Product ${data.isActive ? 'activated' : 'deactivated'} successfully!`);
        },
        onError: (error: Error) => {
            toast.error(`Failed to update product status: ${error.message}`);
        },
    });
}