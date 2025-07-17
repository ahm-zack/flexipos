
"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Appetizer, Modifier } from '@/lib/db/schema';
import type { CreateAppetizer, UpdateAppetizer } from '@/lib/schemas';
import { appetizersClientService } from '@/lib/supabase-queries/appetizers-client-service';
import { appetizersKeys } from '../queries/appetizers-keys';

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

const fetchAppetizers = async (): Promise<Appetizer[]> => {
    try {
        const appetizers = await appetizersClientService.getAppetizers();
        return appetizers;
    } catch (error) {
        console.error('Error fetching appetizers:', error);
        throw new Error('Failed to load appetizers. Please try again.');
    }
};

const createAppetizer = async (appetizerData: CreateAppetizer): Promise<Appetizer> => {
    try {
        const processedData = {
            ...appetizerData,
            priceWithVat: typeof appetizerData.priceWithVat === 'string'
                ? appetizerData.priceWithVat
                : appetizerData.priceWithVat.toString(),
        };
        const appetizer = await appetizersClientService.createAppetizer(processedData);
        return appetizer;
    } catch (error) {
        console.error('Error creating appetizer:', error);
        throw new Error('Failed to create appetizer. Please try again.');
    }
};

const updateAppetizer = async ({ id, data }: { id: string; data: UpdateAppetizer }): Promise<Appetizer> => {
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

        const appetizer = await appetizersClientService.updateAppetizer(id, processedData);
        return appetizer;
    } catch (error) {
        console.error('Error updating appetizer:', error);
        throw new Error('Failed to update appetizer. Please try again.');
    }
};

const deleteAppetizer = async (id: string): Promise<void> => {
    try {
        await appetizersClientService.deleteAppetizer(id);
    } catch (error) {
        console.error('Error deleting appetizer:', error);
        throw new Error('Failed to delete appetizer. Please try again.');
    }
};

export const useAppetizers = (context: 'admin' | 'cashier' | 'customer' = 'admin') => {
    const config = CACHE_STRATEGIES[context.toUpperCase() as keyof typeof CACHE_STRATEGIES];

    return useQuery({
        queryKey: appetizersKeys.lists(),
        queryFn: fetchAppetizers,
        ...config,
        retry: 2,
    });
};

export const useCreateAppetizer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createAppetizer,
        onSuccess: (newAppetizer) => {
            queryClient.setQueryData<Appetizer[]>(appetizersKeys.lists(), (old) => {
                if (!old) return [newAppetizer];
                return [newAppetizer, ...old];
            });
            queryClient.invalidateQueries({ queryKey: appetizersKeys.lists() });
            toast.success(`"${newAppetizer.nameEn}" created successfully! 🥟`);
        },
        onError: (error) => {
            toast.error(`Failed to create appetizer: ${error.message}`);
        },
    });
};

export const useUpdateAppetizer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateAppetizer,
        onSuccess: (updatedAppetizer) => {
            queryClient.setQueryData<Appetizer[]>(appetizersKeys.lists(), (old) => {
                if (!old) return [updatedAppetizer];
                return old.map(appetizer =>
                    appetizer.id === updatedAppetizer.id ? updatedAppetizer : appetizer
                );
            });
            queryClient.invalidateQueries({ queryKey: appetizersKeys.lists() });
            toast.success(`"${updatedAppetizer.nameEn}" updated successfully! 🥟`);
        },
        onError: (error) => {
            toast.error(`Failed to update appetizer: ${error.message}`);
        },
    });
};

export const useDeleteAppetizer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAppetizer,
        onSuccess: (_, deletedId) => {
            queryClient.setQueryData<Appetizer[]>(appetizersKeys.lists(), (old) => {
                if (!old) return [];
                return old.filter(appetizer => appetizer.id !== deletedId);
            });
            queryClient.invalidateQueries({ queryKey: appetizersKeys.lists() });
            toast.success('Appetizer deleted successfully! 🗑️');
        },
        onError: (error) => {
            toast.error(`Failed to delete appetizer: ${error.message}`);
        },
    });
};

export const useRefreshAppetizers = () => {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: appetizersKeys.lists() });
        toast.info('Refreshing appetizer data...');
    };
};

export const useAppetizerPrefetch = () => {
    const queryClient = useQueryClient();

    const prefetchAppetizer = (id: string) => {
        queryClient.prefetchQuery({
            queryKey: appetizersKeys.detail(id),
            queryFn: () => appetizersClientService.getAppetizerById(id),
            staleTime: 5 * 60 * 1000,
        });
    };

    return { prefetchAppetizer };
};
