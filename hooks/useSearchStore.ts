
import { create } from "zustand";

interface MenuSearchStore {
    searchTerm: string;
    currentCategory: string;
    setSearchTerm: (term: string) => void;
    setCurrentCategory: (category: string) => void;
    clearSearch: () => void;
    filterItems: <T extends { nameEn?: string; nameAr?: string; type?: string; size?: string | null; crust?: string | null }>(items: T[]) => T[];
    filterProducts: <T extends { name?: string; nameAr?: string; description?: string }>(products: T[]) => T[];
}

export const useSearchStore = create<MenuSearchStore>((set, get) => ({
    searchTerm: "",
    currentCategory: "",
    setSearchTerm: (term) => set({ searchTerm: term }),
    setCurrentCategory: (category) => set({ currentCategory: category }),
    clearSearch: () => set({ searchTerm: "", currentCategory: "" }),

    // Generic filter function for legacy items (pizzas, pies, etc.)
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

    // Product filter function for dynamic categories
    filterProducts: (products) => {
        const { searchTerm } = get();
        const filtered = products?.filter((product) =>
            product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        return filtered || [];
    },
}));