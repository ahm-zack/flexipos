"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Shawarma, Modifier } from '@/lib/db/schema';
import type { CreateShawarma, UpdateShawarma } from '@/lib/schemas';
import { shawarmasClientService } from '@/lib/supabase-queries/shawarmas-client-service';
import { shawermaKeys } from '../queries/shawerma-keys';

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

const fetchShawarmas = async (): Promise<Shawarma[]> => {
    try {
        const shawarmas = await shawarmasClientService.getShawarmas();
        return shawarmas;
    } catch (error) {
        console.error('Error fetching shawermas:', error);
        throw new Error('Failed to load shawermas. Please try again.');
    }
};

const createShawarma = async (shawarmaData: CreateShawarma): Promise<Shawarma> => {
    try {
        const processedData = {
            ...shawarmaData,
            priceWithVat: typeof shawarmaData.priceWithVat === 'string'
                ? shawarmaData.priceWithVat
                : shawarmaData.priceWithVat.toString(),
        };
        const shawarma = await shawarmasClientService.createShawarma(processedData);
        return shawarma;
    } catch (error) {
        console.error('Error creating shawerma:', error);
        throw new Error('Failed to create shawerma. Please try again.');
    }
};

const updateShawarma = async ({ id, data }: { id: string; data: UpdateShawarma }): Promise<Shawarma> => {
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

        const shawarma = await shawarmasClientService.updateShawarma(id, processedData);
        return shawarma;
    } catch (error) {
        console.error('Error updating shawerma:', error);
        throw new Error('Failed to update shawerma. Please try again.');
    }
};

const deleteShawarma = async (id: string): Promise<void> => {
    try {
        await shawarmasClientService.deleteShawarma(id);
    } catch (error) {
        console.error('Error deleting shawerma:', error);
        throw new Error('Failed to delete shawerma. Please try again.');
    }
};

export const useShawarmas = (context: 'admin' | 'cashier' | 'customer' = 'admin') => {
    const config = CACHE_STRATEGIES[context.toUpperCase() as keyof typeof CACHE_STRATEGIES];

    return useQuery({
        queryKey: shawermaKeys.lists(),
        queryFn: fetchShawarmas,
        ...config,
        retry: 2,
    });
};

export const useCreateShawarma = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createShawarma,
        onSuccess: (newShawarma) => {
            queryClient.setQueryData<Shawarma[]>(shawermaKeys.lists(), (old) => {
                if (!old) return [newShawarma];
                return [newShawarma, ...old];
            });
            queryClient.invalidateQueries({ queryKey: shawermaKeys.lists() });
            toast.success(`"${newShawarma.nameEn}" created successfully! 🌯`);
        },
        onError: (error) => {
            toast.error(`Failed to create shawarma: ${error.message}`);
        },
    });
};

export const useUpdateShawarma = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateShawarma,
        onSuccess: (updatedShawarma) => {
            queryClient.setQueryData<Shawarma[]>(shawermaKeys.lists(), (old) => {
                if (!old) return [updatedShawarma];
                return old.map(shawarma =>
                    shawarma.id === updatedShawarma.id ? updatedShawarma : shawarma
                );
            });
            queryClient.invalidateQueries({ queryKey: shawermaKeys.lists() });
            toast.success(`"${updatedShawarma.nameEn}" updated successfully! 🌯`);
        },
        onError: (error) => {
            toast.error(`Failed to update shawarma: ${error.message}`);
        },
    });
};

export const useDeleteShawarma = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteShawarma,
        onSuccess: (_, deletedId) => {
            queryClient.setQueryData<Shawarma[]>(shawermaKeys.lists(), (old) => {
                if (!old) return [];
                return old.filter(shawarma => shawarma.id !== deletedId);
            });
            queryClient.invalidateQueries({ queryKey: shawermaKeys.lists() });
            toast.success('Shawarma deleted successfully! 🗑️');
        },
        onError: (error) => {
            toast.error(`Failed to delete shawarma: ${error.message}`);
        },
    });
};

export const useRefreshShawarmas = () => {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: shawermaKeys.lists() });
        toast.info('Refreshing shawarma data...');
    };
};

export const useShawarmaPrefetch = () => {
    const queryClient = useQueryClient();

    const prefetchShawarma = (id: string) => {
        queryClient.prefetchQuery({
            queryKey: shawermaKeys.detail(id),
            queryFn: () => shawarmasClientService.getShawarmaById(id),
            staleTime: 5 * 60 * 1000,
        });
    };

    return { prefetchShawarma };
};