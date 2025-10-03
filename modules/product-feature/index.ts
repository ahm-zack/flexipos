// Types
export type * from './types';

// Hooks
export * from './hooks/use-products';
export * from './hooks/use-categories';

// Components
export { ProductGrid } from './components/product-grid';
export { ProductCashierView } from './components/product-cashier-view';
export { ProductManagementView } from './components/product-management-view';
export { ProductManagementCard } from './components/product-management-card';
export { ProductCashierCard } from './components/product-cashier-card';
export { CreateProductForm } from './components/create-product-form';
export { EditProductForm } from './components/edit-product-form';

// Page Components
export { ProductCashierPage } from './components/product-cashier-page';
export { ProductManagementPage } from './components/product-management-page';

// Services
export { productClientService } from './services/product-client-service';
export { categoryClientService } from './services/category-client-service';

// Service Types
export type { Product, NewProduct, ProductVariant, ProductModifier } from './services/product-client-service';
export type { Category, NewCategory } from './services/category-client-service';

// Query Keys
export { productKeys, categoryKeys, productCategoryKeys } from './queries/product-keys';

// Re-export main types for convenience
export type {
    ProductQueryParams,
    CacheContext,
} from './types';