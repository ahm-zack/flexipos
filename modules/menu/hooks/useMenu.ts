import { useQuery } from '@tanstack/react-query';
import { categorySupabaseService } from '@/modules/product-feature/services/category-supabase-service';
import { useProducts } from '@/modules/product-feature/hooks/useProducts';
import type { Product } from '@/modules/product-feature/services/product-supabase-service';

// New dynamic menu hook that uses categories and products
export function useMenu(businessId: string) {
    // Get all categories for this business
    const { data: categories = [], isLoading: categoriesLoading } = useQuery({
        queryKey: ['categories', businessId],
        queryFn: () => categorySupabaseService.getCategories(businessId),
        enabled: !!businessId,
    });

    // Get all products for this business
    const { data: products = [], isLoading: productsLoading } = useProducts(businessId);

    // Group products by category
    const menuByCategory = categories.reduce((acc, category) => {
        acc[category.slug || category.name.toLowerCase()] = products.filter(
            product => product.categoryId === category.id
        );
        return acc;
    }, {} as Record<string, Product[]>);

    return {
        categories,
        products,
        menuByCategory,
        isLoading: categoriesLoading || productsLoading,
    };
}