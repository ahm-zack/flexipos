"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { SideOrder, Modifier } from '@/lib/db/schema';
import type { CreateSideOrder, UpdateSideOrder } from '@/lib/schemas';
import { sideOrdersClientService } from '@/lib/supabase-queries/side-orders-client-service';
import { sidesKeys } from '../queries/sides-keys';

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

const fetchSides = async (): Promise<SideOrder[]> => {
    try {
        const sides = await sideOrdersClientService.getSideOrders();
        return sides;
    } catch (error) {
        console.error('Error fetching sides:', error);
        throw new Error('Failed to load sides. Please try again.');
    }
};

const createSide = async (sideData: CreateSideOrder): Promise<SideOrder> => {
    try {
        const processedData = {
            ...sideData,
            priceWithVat: typeof sideData.priceWithVat === 'string'
                ? sideData.priceWithVat
                : sideData.priceWithVat.toString(),
        };
        const side = await sideOrdersClientService.createSideOrder(processedData);
        return side;
    } catch (error) {
        console.error('Error creating side:', error);
        throw new Error('Failed to create side. Please try again.');
    }
};

const updateSide = async ({ id, data }: { id: string; data: UpdateSideOrder }): Promise<SideOrder> => {
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

        const side = await sideOrdersClientService.updateSideOrder(id, processedData);
        return side;
    } catch (error) {
        console.error('Error updating side:', error);
        throw new Error('Failed to update side. Please try again.');
    }
};

const deleteSide = async (id: string): Promise<void> => {
    try {
        await sideOrdersClientService.deleteSideOrder(id);
    } catch (error) {
        console.error('Error deleting side:', error);
        throw new Error('Failed to delete side. Please try again.');
    }
};

export const useSides = (context: 'admin' | 'cashier' | 'customer' = 'admin') => {
    const config = CACHE_STRATEGIES[context.toUpperCase() as keyof typeof CACHE_STRATEGIES];

    return useQuery({
        queryKey: sidesKeys.lists(),
        queryFn: fetchSides,
        ...config,
        retry: 2,
    });
};

export const useCreateSide = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createSide,
        onSuccess: (newSide) => {
            queryClient.setQueryData<SideOrder[]>(sidesKeys.lists(), (old) => {
                if (!old) return [newSide];
                return [newSide, ...old];
            });
            queryClient.invalidateQueries({ queryKey: sidesKeys.lists() });
            toast.success(`"${newSide.nameEn}" created successfully! 🍟`);
        },
        onError: (error) => {
            toast.error(`Failed to create side: ${error.message}`);
        },
    });
};

export const useUpdateSide = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateSide,
        onSuccess: (updatedSide) => {
            queryClient.setQueryData<SideOrder[]>(sidesKeys.lists(), (old) => {
                if (!old) return [updatedSide];
                return old.map(side =>
                    side.id === updatedSide.id ? updatedSide : side
                );
            });
            queryClient.invalidateQueries({ queryKey: sidesKeys.lists() });
            toast.success(`"${updatedSide.nameEn}" updated successfully! 🍟`);
        },
        onError: (error) => {
            toast.error(`Failed to update side: ${error.message}`);
        },
    });
};

export const useDeleteSide = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteSide,
        onSuccess: (_, deletedId) => {
            queryClient.setQueryData<SideOrder[]>(sidesKeys.lists(), (old) => {
                if (!old) return [];
                return old.filter(side => side.id !== deletedId);
            });
            queryClient.invalidateQueries({ queryKey: sidesKeys.lists() });
            toast.success('Side deleted successfully! 🗑️');
        },
        onError: (error) => {
            toast.error(`Failed to delete side: ${error.message}`);
        },
    });
};

export const useRefreshSides = () => {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: sidesKeys.lists() });
        toast.info('Refreshing side data...');
    };
};

export const useSidePrefetch = () => {
    const queryClient = useQueryClient();

    const prefetchSide = (id: string) => {
        queryClient.prefetchQuery({
            queryKey: sidesKeys.detail(id),
            queryFn: () => sideOrdersClientService.getSideOrderById(id),
            staleTime: 5 * 60 * 1000,
        });
    };

    return { prefetchSide };
};
