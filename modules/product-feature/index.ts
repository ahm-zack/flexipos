// Types
export type * from './types';

// Components
export { ProductGrid } from './components/product-grid';
export { ProductCashierView } from './components/product-cashier-view';
export { ProductManagementView } from './components/product-management-view';
export { ProductManagementCard } from './components/product-management-card';
export { ProductCashierCard } from './components/product-cashier-card';
export { CreateProductForm } from './components/create-product-form';
export { EditProductForm } from './components/edit-product-form';
export { CategorySystem } from './components/category-system';
export { CategoryForm } from './components/category-form';

// Page Components
// ProductCashierPage removed - logic moved directly to pages

// Services (Primary: Supabase services)
export { productSupabaseService } from './services/product-supabase-service';
export { categorySupabaseService } from './services/category-supabase-service';
// Legacy service for backward compatibility
export { productClientService } from './services/product-client-service';

// Service Types (Primary: Supabase types)
export type { Product, NewProduct, ProductVariant, ProductModifier } from './services/product-supabase-service';
export type { Category, NewCategory } from './services/category-supabase-service';
// Legacy types for backward compatibility  
export type { Product as ProductLegacy, NewProduct as NewProductLegacy } from './services/product-client-service';

// Query Keys
export { productKeys, categoryKeys, productCategoryKeys } from './queries/product-keys';

// Re-export main types for convenience
export type {
    ProductQueryParams,
    CacheContext,
} from './types';