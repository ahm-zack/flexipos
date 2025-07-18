"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Beverage, Modifier } from '@/lib/db/schema';
import type { CreateBeverage, UpdateBeverage } from '@/lib/schemas';
import { beveragesClientService } from '@/lib/supabase-queries/beverages-client-service';
import { beveragesKeys } from '../queries/beverages-keys';

const CACHE_STRATEGIES = {
    ADMIN: {
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    },
    CASHIER: {
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    },
    CUSTOMER: {
        staleTime: 15 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    },
} as const;

const fetchBeverages = async (): Promise<Beverage[]> => {
    try {
        const beverages = await beveragesClientService.getBeverages();
        return beverages;
    } catch (error) {
        console.error('Error fetching beverages:', error);
        throw new Error('Failed to load beverages. Please try again.');
    }
};

const createBeverage = async (beverageData: CreateBeverage): Promise<Beverage> => {
    try {
        const processedData = {
            ...beverageData,
            priceWithVat: typeof beverageData.priceWithVat === 'string'
                ? beverageData.priceWithVat
                : beverageData.priceWithVat.toString(),
        };
        const beverage = await beveragesClientService.createBeverage(processedData);
        return beverage;
    } catch (error) {
        console.error('Error creating beverage:', error);
        throw new Error('Failed to create beverage. Please try again.');
    }
};

const updateBeverage = async ({ id, data }: { id: string; data: UpdateBeverage }): Promise<Beverage> => {
    try {
        const processedData: Partial<{
            nameAr?: string;
            nameEn?: string;
            imageUrl?: string;
            priceWithVat?: string;
            modifiers?: Modifier[];
        }> = {};

        if (data.nameAr !== undefined) processedData.nameAr = data.nameAr;
        if (data.nameEn !== undefined) processedData.nameEn = data.nameEn;
        if (data.imageUrl !== undefined) processedData.imageUrl = data.imageUrl;
        if (data.modifiers !== undefined) processedData.modifiers = data.modifiers;
        if (data.priceWithVat !== undefined) {
            processedData.priceWithVat = typeof data.priceWithVat === 'string'
                ? data.priceWithVat
                : data.priceWithVat.toString();
        }

        const beverage = await beveragesClientService.updateBeverage(id, processedData);
        return beverage;
    } catch (error) {
        console.error('Error updating beverage:', error);
        throw new Error('Failed to update beverage. Please try again.');
    }
};

const deleteBeverage = async (id: string): Promise<void> => {
    try {
        await beveragesClientService.deleteBeverage(id);
    } catch (error) {
        console.error('Error deleting beverage:', error);
        throw new Error('Failed to delete beverage. Please try again.');
    }
};

export const useBeverages = (context: 'admin' | 'cashier' | 'customer' = 'admin') => {
    const config = CACHE_STRATEGIES[context.toUpperCase() as keyof typeof CACHE_STRATEGIES];

    return useQuery({
        queryKey: beveragesKeys.lists(),
        queryFn: fetchBeverages,
        ...config,
        retry: 2,
    });
};

export const useCreateBeverage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createBeverage,
        onSuccess: (newBeverage) => {
            queryClient.setQueryData<Beverage[]>(beveragesKeys.lists(), (old) => {
                if (!old) return [newBeverage];
                return [newBeverage, ...old];
            });
            queryClient.invalidateQueries({ queryKey: beveragesKeys.lists() });
            toast.success(`"${newBeverage.nameEn}" created successfully! 🥤`);
        },
        onError: (error) => {
            toast.error(`Failed to create beverage: ${error.message}`);
        },
    });
};

export const useUpdateBeverage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateBeverage,
        onSuccess: (updatedBeverage) => {
            queryClient.setQueryData<Beverage[]>(beveragesKeys.lists(), (old) => {
                if (!old) return [updatedBeverage];
                return old.map(beverage =>
                    beverage.id === updatedBeverage.id ? updatedBeverage : beverage
                );
            });
            queryClient.invalidateQueries({ queryKey: beveragesKeys.lists() });
            toast.success(`"${updatedBeverage.nameEn}" updated successfully! 🥤`);
        },
        onError: (error) => {
            toast.error(`Failed to update beverage: ${error.message}`);
        },
    });
};

export const useDeleteBeverage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteBeverage,
        onSuccess: (_, deletedId) => {
            queryClient.setQueryData<Beverage[]>(beveragesKeys.lists(), (old) => {
                if (!old) return [];
                return old.filter(beverage => beverage.id !== deletedId);
            });
            queryClient.invalidateQueries({ queryKey: beveragesKeys.lists() });
            toast.success('Beverage deleted successfully! 🗑️');
        },
        onError: (error) => {
            toast.error(`Failed to delete beverage: ${error.message}`);
        },
    });
};
