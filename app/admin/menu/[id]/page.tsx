import { categorySupabaseService } from "@/modules/product-feature";
import type { Category } from "@/modules/product-feature/services/category-supabase-service";
import DynamicMenuClientPage from "./simple-client-page";

// Generate static paths for all dynamic categories at build time
export async function generateStaticParams() {
  try {
    // During build time, localStorage is not available, so we return empty array
    // This will enable dynamic generation for all category pages
    if (typeof window === "undefined") {
      return [];
    }

    const businessId = "b1234567-89ab-cdef-0123-456789abcdef"; // In real app, get from auth context
    const categories = await categorySupabaseService.getCategories(businessId);

    // Return all category slugs for static generation
    return categories.map((category: Category) => ({
      id: category.slug,
    }));
  } catch (error) {
    console.error(
      "Failed to generate static params for menu categories:",
      error
    );
    // Fallback to empty array - pages will be generated on-demand
    return [];
  }
}

export default function MenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <DynamicMenuClientPage params={params} />;
}
