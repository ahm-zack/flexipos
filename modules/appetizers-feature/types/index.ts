export interface AppetizersFilters {
    search?: string;
}

export interface PizzaQueryParams {
    page?: number;
    limit?: number;
    filters?: AppetizersFilters;
}
