// Export schemas and validation
export * from './schemas';

// Export database tables and types
export {
    customers,
    customerOrders,
    customerIndexes
} from './db-schema';

// Export database types with aliases to avoid conflicts
export type {
    Customer as DbCustomer,
    NewCustomer as DbNewCustomer,
    CustomerOrder as DbCustomerOrder,
    NewCustomerOrder as DbNewCustomerOrder,
    CustomerWithStats,
    CustomerSearchResult
} from './db-schema';

// Re-export commonly used types for convenience
export type {
    CreateCustomer,
    UpdateCustomer,
    CustomerForm,
    CustomerSearch
} from './schemas';
