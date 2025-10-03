// Product Feature Types - Dynamic Category Implementation
// Based on pizza-feature pattern but with category relationships

export interface Product {
    id: string;
    businessId: string;
    categoryId: string; // Relationship to dynamic category
    name: string;
    nameAr?: string;
    description?: string;
    shortDescription?: string;
    sku?: string;
    barcode?: string;
    price: number;
    costPrice?: number;
    images: string[];
    variants: ProductVariant[];
    modifiers: ProductModifier[];
    tags: string[];
    isActive: boolean;
    isFeatured: boolean;
    stockQuantity?: number;
    lowStockThreshold?: number;
    metadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;

    // Computed/joined fields
    category?: Category;
    business?: Business;
}

export interface ProductVariant {
    id: string;
    name: string;
    nameAr?: string;
    price: number;
    sku?: string;
    barcode?: string;
    stockQuantity?: number;
    isDefault: boolean;
    displayOrder: number;
    metadata: Record<string, unknown>;
}

export interface ProductModifier {
    id: string;
    groupId: string;
    groupName: string;
    name: string;
    nameAr?: string;
    price: number;
    isRequired: boolean;
    maxSelections?: number;
    minSelections?: number;
    displayOrder: number;
}

export interface Category {
    id: string;
    businessId: string;
    name: string;
    nameAr?: string;
    slug: string;
    description?: string;
    icon: string;
    color?: string;
    displayOrder: number;
    isActive: boolean;
    parentCategoryId?: string;
    metadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;

    // Computed fields
    productCount?: number;
    children?: Category[];
    parent?: Category;
}

export interface Business {
    id: string;
    name: string;
    slug: string;
    type: BusinessType;
    settings: BusinessSettings;
    branding: BusinessBranding;
    address: BusinessAddress;
    contact: BusinessContact;
    vatSettings: VatSettings;
    timezone: string;
    currency: string;
    language: string;
    createdAt: string;
    updatedAt: string;
}

export type BusinessType =
    | 'restaurant'
    | 'retail'
    | 'service'
    | 'cafe'
    | 'bakery'
    | 'pharmacy'
    | 'grocery';

export interface BusinessSettings {
    enableInventory: boolean;
    enableModifiers: boolean;
    enableVariants: boolean;
    enableReservations: boolean;
    enableDelivery: boolean;
    enableTakeaway: boolean;
    enableDineIn: boolean;
    enableLoyalty: boolean;
    orderNumberPrefix: string;
    defaultLanguage: string;
    enableMultiLanguage: boolean;
}

export interface BusinessBranding {
    logo?: string;
    favicon?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    theme: 'light' | 'dark' | 'auto';
}

export interface BusinessAddress {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

export interface BusinessContact {
    phone: string;
    email: string;
    website?: string;
    socialMedia?: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        linkedin?: string;
    };
}

export interface VatSettings {
    enabled: boolean;
    rate: number;
    number?: string;
    inclusive: boolean;
}

// API Types - Following pizza-feature pattern
export interface CreateProductData {
    businessId: string;
    categoryId: string;
    name: string;
    nameAr?: string;
    description?: string;
    price: number;
    images?: string[];
    variants?: Omit<ProductVariant, 'id'>[];
    modifiers?: string[]; // modifier group IDs
    tags?: string[];
    isActive?: boolean;
    isFeatured?: boolean;
    stockQuantity?: number;
    metadata?: Record<string, unknown>;
}

export interface UpdateProductData extends Partial<Omit<CreateProductData, 'businessId'>> {
    id: string;
}

export interface CreateCategoryData {
    businessId: string;
    name: string;
    nameAr?: string;
    slug?: string;
    description?: string;
    icon?: string;
    color?: string;
    displayOrder?: number;
    metadata?: Record<string, unknown>;
}

export interface UpdateCategoryData extends Partial<Omit<CreateCategoryData, 'businessId'>> {
    id: string;
}

// Query and Filter Types - Following pizza-feature pattern
export interface ProductFilters {
    search?: string;
    categoryId?: string;
    categorySlug?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    tags?: string[];
    priceRange?: {
        min?: number;
        max?: number;
    };
    stockStatus?: 'in-stock' | 'low-stock' | 'out-of-stock';
}

export interface ProductQueryParams {
    page?: number;
    limit?: number;
    filters?: ProductFilters;
    sortBy?: 'name' | 'price' | 'created' | 'updated' | 'featured';
    sortOrder?: 'asc' | 'desc';
}

export interface CategoryFilters {
    search?: string;
    isActive?: boolean;
    parentCategoryId?: string;
}

export interface CategoryQueryParams {
    page?: number;
    limit?: number;
    filters?: CategoryFilters;
    sortBy?: 'name' | 'displayOrder' | 'created';
    sortOrder?: 'asc' | 'desc';
}

// Cache Context Types - Following pizza-feature pattern
export type CacheContext = 'admin' | 'cashier' | 'customer';

// Response Types
export interface ProductsResponse {
    products: Product[];
    category?: Category;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface CategoriesResponse {
    categories: Category[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}