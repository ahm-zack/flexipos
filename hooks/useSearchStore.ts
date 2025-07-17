import { create } from "zustand";

interface MenuSearchStore {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filterItems: <T extends { nameEn?: string; nameAr?: string; type?: string; size?: string | null; crust?: string | null }>(items: T[]) => T[];
    filterSandwiches: <T extends { nameEn?: string; nameAr?: string; type?: string; size?: string }>(sandwiches: T[]) => T[];
    filterPizzas: <T extends { nameEn?: string; nameAr?: string; type?: string; crust?: string | null }>(pizzas: T[]) => T[];
    filterPies: <T extends { nameEn?: string; nameAr?: string; type?: string; size?: string }>(pies: T[]) => T[];
    filterMiniPies: <T extends { nameEn?: string; nameAr?: string; type?: string; size?: string }>(miniPies: T[]) => T[];
    filterAppetizers: <T extends { nameEn?: string; nameAr?: string }>(appetizers: T[]) => T[];
    filterBurgers: <T extends { nameEn?: string; nameAr?: string }>(burgers: T[]) => T[];
    filterBeverages: <T extends { nameEn?: string; nameAr?: string }>(beverages: T[]) => T[];
    filterSideOrders: <T extends { nameEn?: string; nameAr?: string }>(sideOrders: T[]) => T[];
    filterShawarma: <T extends { nameEn?: string; nameAr?: string }>(shawarma: T[]) => T[];
}

export const useSearchStore = create<MenuSearchStore>((set, get) => ({
    searchTerm: "",
    setSearchTerm: (term) => set({ searchTerm: term }),

    // Generic filter function
    filterItems: (items) => {
        const { searchTerm } = get();
        const filtered = items?.filter((item) =>
            item.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.size?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.crust?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        return filtered || [];
    },

    // Product-specific filter functions for backward compatibility
    filterSandwiches: (items) => {
        const { searchTerm } = get();
        const filtered = items?.filter((item) =>
            item.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.size?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        return filtered || [];
    },

    filterPizzas: (items) => {
        const { searchTerm } = get();
        const filtered = items?.filter((item) =>
            item.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.crust && item.crust.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        return filtered || [];
    },

    filterPies: (items) => {
        const { searchTerm } = get();
        const filtered = items?.filter((item) =>
            item.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.size?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        return filtered || [];
    },

    filterMiniPies: (items) => {
        const { searchTerm } = get();
        const filtered = items?.filter((item) =>
            item.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.size?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        return filtered || [];
    },

    // Newest 5 items filters
    filterAppetizers: <T extends { nameEn?: string; nameAr?: string }>(items: T[]) => {
        const { searchTerm } = get();
        const filtered = items?.filter((item) =>
            item.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.nameAr?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return filtered || [];
    },
    filterBurgers: <T extends { nameEn?: string; nameAr?: string }>(items: T[]) => {
        const { searchTerm } = get();
        const filtered = items?.filter((item) =>
            item.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.nameAr?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return filtered || [];
    },
    filterBeverages: <T extends { nameEn?: string; nameAr?: string }>(items: T[]) => {
        const { searchTerm } = get();
        const filtered = items?.filter((item) =>
            item.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.nameAr?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return filtered || [];
    },
    filterSideOrders: <T extends { nameEn?: string; nameAr?: string }>(items: T[]) => {
        const { searchTerm } = get();
        const filtered = items?.filter((item) =>
            item.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.nameAr?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return filtered || [];
    },
    filterShawarma: <T extends { nameEn?: string; nameAr?: string }>(items: T[]) => {
        const { searchTerm } = get();
        const filtered = items?.filter((item) =>
            item.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.nameAr?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return filtered || [];
    },
}));