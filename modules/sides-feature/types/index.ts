export interface SidesFilters {
    search?: string;

}

export interface SidesQueryParams {
    page?: number;
    limit?: number;
    filters?: SidesFilters;
}
