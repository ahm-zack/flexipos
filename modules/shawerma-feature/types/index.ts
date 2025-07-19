export interface ShawermaFilters {
    search?: string;

}

export interface ShawermaQueryParams {
    page?: number;
    limit?: number;
    filters?: ShawermaFilters;
}
