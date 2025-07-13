import { create } from "zustand";

interface SnadwichStore {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filterSandwiches: <T extends { nameEn?: string; nameAr?: string; type?: string; size?: string }>(sandwiches: T[]) => T[];
}

export const useSearchStore = create<SnadwichStore>((set, get) => ({
    searchTerm: "",
    setSearchTerm: (term) => set({ searchTerm: term }),
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
}));