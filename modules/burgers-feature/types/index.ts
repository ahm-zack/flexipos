export interface BurgersFilters {
    search?: string;
}

export interface PizzaQueryParams {
    page?: number;
    limit?: number;
    filters?: BurgersFilters;
}
