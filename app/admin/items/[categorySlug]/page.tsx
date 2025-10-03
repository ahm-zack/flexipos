import {
  ProductManagementPage,
  categoryClientService,
} from "@/modules/product-feature";
import type { Category } from "@/modules/product-feature/services/category-client-service";
import { QueryClient } from "@tanstack/react-query";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { categoryKeys } from "@/modules/product-feature/queries/product-keys";
import { notFound } from "next/navigation";

const DEFAULT_BUSINESS_ID = "default-business-id";

interface CategoryPageProps {
  params: Promise<{
    categorySlug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes for admin
      },
    },
  });

  try {
    // Pre-fetch categories for SSR hydration
    await queryClient.prefetchQuery({
      queryKey: categoryKeys.list(DEFAULT_BUSINESS_ID),
      queryFn: () => categoryClientService.getCategories(DEFAULT_BUSINESS_ID),
    });

    // Get the specific category to verify it exists
    const categories = await categoryClientService.getCategories(
      DEFAULT_BUSINESS_ID
    );
    const category = categories.find((cat) => cat.slug === categorySlug);

    if (!category) {
      notFound();
    }

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductManagementPage categorySlug={categorySlug} />
      </HydrationBoundary>
    );
  } catch (error) {
    console.error("Error loading category:", error);
    notFound();
  }
}

/**
 * Generate static paths for all category slugs
 * This enables SSG for all category pages
 */
export async function generateStaticParams() {
  try {
    const categories = await categoryClientService.getCategories(
      DEFAULT_BUSINESS_ID
    );

    return categories
      .filter((category: Category) => category.isActive)
      .map((category: Category) => ({
        categorySlug: category.slug,
      }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}
