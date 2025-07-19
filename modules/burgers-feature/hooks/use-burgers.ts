"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Burger, Modifier } from '@/lib/db/schema';
import type { CreateBurger, UpdateBurger } from '@/lib/schemas';
import { burgersClientService } from '@/lib/supabase-queries/burgers-client-service';
import { burgerKeys } from '../queries/burger-keys';

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

const fetchBurgers = async (): Promise<Burger[]> => {
    try {
        const burgers = await burgersClientService.getBurgers();
        return burgers;
    } catch (error) {
        console.error('Error fetching burgers:', error);
        throw new Error('Failed to load burgers. Please try again.');
    }
};

const createBurger = async (burgerData: CreateBurger): Promise<Burger> => {
    try {
        const processedData = {
            ...burgerData,
            priceWithVat: typeof burgerData.priceWithVat === 'string'
                ? burgerData.priceWithVat
                : burgerData.priceWithVat.toString(),
        };
        const burger = await burgersClientService.createBurger(processedData);
        return burger;
    } catch (error) {
        console.error('Error creating burger:', error);
        throw new Error('Failed to create burger. Please try again.');
    }
};

const updateBurger = async ({ id, data }: { id: string; data: UpdateBurger }): Promise<Burger> => {
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

        const burger = await burgersClientService.updateBurger(id, processedData);
        return burger;
    } catch (error) {
        console.error('Error updating burger:', error);
        throw new Error('Failed to update burger. Please try again.');
    }
};

const deleteBurger = async (id: string): Promise<void> => {
    try {
        await burgersClientService.deleteBurger(id);
    } catch (error) {
        console.error('Error deleting burger:', error);
        throw new Error('Failed to delete burger. Please try again.');
    }
};

export const useBurgers = (context: 'admin' | 'cashier' | 'customer' = 'admin') => {
    const config = CACHE_STRATEGIES[context.toUpperCase() as keyof typeof CACHE_STRATEGIES];

    return useQuery({
        queryKey: burgerKeys.lists(),
        queryFn: fetchBurgers,
        ...config,
        retry: 2,
    });
};

export const useCreateBurger = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createBurger,
        onSuccess: (newBurger) => {
            queryClient.setQueryData<Burger[]>(burgerKeys.lists(), (old) => {
                if (!old) return [newBurger];
                return [newBurger, ...old];
            });
            queryClient.invalidateQueries({ queryKey: burgerKeys.lists() });
            toast.success(`"${newBurger.nameEn}" created successfully! 🍔`);
        },
        onError: (error) => {
            toast.error(`Failed to create burger: ${error.message}`);
        },
    });
};

export const useUpdateBurger = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateBurger,
        onSuccess: (updatedBurger) => {
            queryClient.setQueryData<Burger[]>(burgerKeys.lists(), (old) => {
                if (!old) return [updatedBurger];
                return old.map(burger =>
                    burger.id === updatedBurger.id ? updatedBurger : burger
                );
            });
            queryClient.invalidateQueries({ queryKey: burgerKeys.lists() });
            toast.success(`"${updatedBurger.nameEn}" updated successfully! 🍔`);
        },
        onError: (error) => {
            toast.error(`Failed to update burger: ${error.message}`);
        },
    });
};

export const useDeleteBurger = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteBurger,
        onSuccess: (_, deletedId) => {
            queryClient.setQueryData<Burger[]>(burgerKeys.lists(), (old) => {
                if (!old) return [];
                return old.filter(burger => burger.id !== deletedId);
            });
            queryClient.invalidateQueries({ queryKey: burgerKeys.lists() });
            toast.success('Burger deleted successfully! 🗑️');
        },
        onError: (error) => {
            toast.error(`Failed to delete burger: ${error.message}`);
        },
    });
};

export const useRefreshBurgers = () => {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: burgerKeys.lists() });
        toast.info('Refreshing burger data...');
    };
};

export const useBurgerPrefetch = () => {
    const queryClient = useQueryClient();

    const prefetchBurger = (id: string) => {
        queryClient.prefetchQuery({
            queryKey: burgerKeys.detail(id),
            queryFn: () => burgersClientService.getBurgerById(id),
            staleTime: 5 * 60 * 1000,
        });
    };

    return { prefetchBurger };
};
