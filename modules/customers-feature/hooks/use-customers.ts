'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBusinessContext } from '@/modules/providers/components/business-provider';
import { customerService } from '@/lib/supabase-queries/customer-client-service';
import type { Customer } from '@/lib/supabase-queries/customer-client-service';

export type { Customer } from '@/lib/supabase-queries/customer-client-service';

// ─── Query keys ───────────────────────────────────────────────────────────────

export const customerKeys = {
    all: ['customers'] as const,
    lists: () => [...customerKeys.all, 'list'] as const,
    list: (businessId: string) => [...customerKeys.lists(), businessId] as const,
    detail: (id: string) => [...customerKeys.all, 'detail', id] as const,
};

// ─── Read hooks ───────────────────────────────────────────────────────────────

export function useCustomers() {
    const { businessId } = useBusinessContext();
    return useQuery({
        queryKey: customerKeys.list(businessId ?? ''),
        queryFn: () => customerService.getCustomers(businessId!),
        enabled: !!businessId,
    });
}

export function useCustomer(id: string) {
    const { businessId } = useBusinessContext();
    return useQuery({
        queryKey: customerKeys.detail(id),
        queryFn: () => customerService.getCustomerById(id, businessId!),
        enabled: !!businessId && !!id,
    });
}

export function useCustomerSearch(query: string) {
    const { businessId } = useBusinessContext();
    return useQuery({
        queryKey: [...customerKeys.list(businessId ?? ''), 'search', query],
        queryFn: () => customerService.search(query, businessId!),
        enabled: !!businessId && query.length >= 2,
        staleTime: 10_000,
    });
}

// ─── Mutation types ───────────────────────────────────────────────────────────

export interface CreateCustomerInput {
    name: string;
    phone: string;
    address?: string;
    createdBy: string;
}

export interface UpdateCustomerInput {
    id: string;
    name?: string;
    phone?: string;
    address?: string;
}

// ─── Mutation hooks ───────────────────────────────────────────────────────────

export function useCreateCustomer() {
    const queryClient = useQueryClient();
    const { businessId } = useBusinessContext();
    return useMutation({
        mutationFn: (input: CreateCustomerInput) => {
            if (!businessId) throw new Error('No business context');
            return customerService.createCustomer(
                { name: input.name, phone: input.phone, address: input.address },
                businessId,
                input.createdBy
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
        },
    });
}

export function useUpdateCustomer() {
    const queryClient = useQueryClient();
    const { businessId } = useBusinessContext();
    return useMutation({
        mutationFn: ({ id, ...updates }: UpdateCustomerInput) => {
            if (!businessId) throw new Error('No business context');
            return customerService.updateCustomer(id, businessId, updates);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
            queryClient.setQueryData(customerKeys.detail(data.id), data);
        },
    });
}

export function useDeleteCustomer() {
    const queryClient = useQueryClient();
    const { businessId } = useBusinessContext();
    return useMutation({
        mutationFn: (id: string) => {
            if (!businessId) throw new Error('No business context');
            return customerService.deleteCustomer(id, businessId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
        },
    });
}

export function useRecordCustomerPurchase() {
    const queryClient = useQueryClient();
    const { businessId } = useBusinessContext();
    return useMutation({
        mutationFn: async ({
            customerId,
            orderTotal,
        }: {
            customerId: string;
            orderTotal: number;
            orderNumber?: string;
        }) => {
            if (!businessId) throw new Error('No business context');
            await customerService.recordPurchase(customerId, businessId, orderTotal);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
        },
    });
}

// Backward-compat alias used by the cart
export { useRecordCustomerPurchase as useUpdateCustomerPurchases };

export function useGetOrCreateCustomer() {
    const { businessId } = useBusinessContext();
    return async (params: {
        phone: string;
        name: string;
        address?: string;
        createdBy: string;
    }): Promise<Customer> => {
        if (!businessId) throw new Error('No business context');
        return customerService.createCustomer(
            { name: params.name, phone: params.phone, address: params.address },
            businessId,
            params.createdBy
        );
    };
}
