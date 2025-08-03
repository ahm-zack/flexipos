import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerKeys } from '../queries/customer-keys';
import { CustomerClientService } from '@/lib/supabase-queries/customer-client-service';
import type {
    Customer,
    CustomerSearchResult,
    CreateCustomer,
} from '@/lib/customers';

const customerService = new CustomerClientService();

// Search customer by phone number
export const useCustomerSearch = (phone: string) => {
    return useQuery({
        queryKey: customerKeys.searchByPhone(phone),
        queryFn: () => customerService.searchByPhone(phone),
        enabled: !!phone && phone.length > 3, // Only search if phone has more than 3 characters
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Get customers list with pagination
export const useCustomers = (page: number = 1, limit: number = 50) => {
    return useQuery({
        queryKey: customerKeys.list(page, limit),
        queryFn: () => customerService.getCustomersList((page - 1) * limit, limit),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

// Create a new customer
export const useCreateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ customerData, createdBy }: {
            customerData: CreateCustomer;
            createdBy: string
        }): Promise<Customer> =>
            customerService.createCustomer(customerData, createdBy),
        onSuccess: (newCustomer: Customer) => {
            // Invalidate customer lists
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });

            // Update search cache if it exists
            queryClient.setQueryData(
                customerKeys.searchByPhone(newCustomer.phone),
                {
                    id: newCustomer.id,
                    phone: newCustomer.phone,
                    name: newCustomer.name,
                    address: newCustomer.address || undefined,
                    totalPurchases: parseFloat(newCustomer.totalPurchases),
                    orderCount: parseInt(newCustomer.orderCount),
                    lastOrderAt: newCustomer.lastOrderAt ? newCustomer.lastOrderAt.toISOString() : undefined,
                } as CustomerSearchResult
            );
        },
    });
};

// Update customer purchase totals when order is created
export const useUpdateCustomerPurchases = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ customerId, orderTotal, orderNumber }: {
            customerId: string;
            orderTotal: number;
            orderNumber: string;
        }): Promise<Customer> =>
            customerService.updateCustomerPurchases(customerId, orderTotal, orderNumber),
        onSuccess: () => {
            // Invalidate customer lists and search results
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
        },
    });
};
