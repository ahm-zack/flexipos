import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productClientService } from '@/modules/product-feature';
import type { NewProduct, Product } from '@/modules/product-feature/services/product-client-service';

// Query Keys for consistent caching
export const productKeys = {
    all: ['products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (businessId: string, categorySlug?: string) =>
        categorySlug
            ? [...productKeys.lists(), businessId, categorySlug] as const
            : [...productKeys.lists(), businessId] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (id: string) => [...productKeys.details(), id] as const,
};

// Default business ID
const DEFAULT_BUSINESS_ID = "default-business-id";

export function useProducts(businessId: string = DEFAULT_BUSINESS_ID, categorySlug?: string) {
    return useQuery({
        queryKey: productKeys.list(businessId, categorySlug),
        queryFn: async () => {
            if (categorySlug) {
                const result = await productClientService.getProductsByCategorySlug(businessId, categorySlug);
                return result;
            } else {
                const products = await productClientService.getProducts();
                return { products, category: null };
            }
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: NewProduct) => productClientService.createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: Partial<NewProduct> & { id: string }) =>
            productClientService.updateProduct(id, data),
        onSuccess: (updatedProduct) => {
            queryClient.setQueryData(productKeys.detail(updatedProduct.id), updatedProduct);
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => productClientService.deleteProduct(id),
        onSuccess: (_, deletedId) => {
            queryClient.removeQueries({ queryKey: productKeys.detail(deletedId) });
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
}
