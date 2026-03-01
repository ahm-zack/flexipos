// ─── Components ───────────────────────────────────────────────────────────────
export { CustomersList } from './components/customers-list';
export { CustomerCard } from './components/customer-card';
export { CustomerFormDialog } from './components/customer-form-dialog';
export { CustomersStats } from './components/customers-stats';

// ─── Context ──────────────────────────────────────────────────────────────────
export { CustomersProvider, useCustomersContext } from './contexts/customers-context';
export type { CustomerFormData } from './contexts/customers-context';

// ─── Hooks ────────────────────────────────────────────────────────────────────
export {
    useCustomers,
    useCustomer,
    useCustomerSearch,
    useCreateCustomer,
    useUpdateCustomer,
    useDeleteCustomer,
    useRecordCustomerPurchase,
    useUpdateCustomerPurchases,
    useGetOrCreateCustomer,
    customerKeys,
} from './hooks/use-customers';

export type { Customer, CreateCustomerInput, UpdateCustomerInput } from './hooks/use-customers';
