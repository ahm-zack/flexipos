// Minimal customer client service stub
export class CustomerClientService {
    async getCustomers() {
        return { success: true, customers: [] };
    }

    async searchByPhone(phone: string) {
        console.log('Searching customer by phone:', phone);
        // Return null for no customer found, or customer object if found
        return null as { id: string; name: string; address?: string } | null;
    }

    async createCustomer(customerData: Record<string, unknown>, createdBy?: string) {
        console.log('Creating customer:', customerData, 'createdBy:', createdBy);
        return { success: true, customer: { id: '1', ...customerData }, id: '1' };
    }

    async updateCustomer(id: string, customerData: Record<string, unknown>) {
        console.log('Updating customer:', id, customerData);
        return { success: true, customer: { id, ...customerData } };
    }

    async deleteCustomer(id: string) {
        console.log('Deleting customer:', id);
        return { success: true };
    }
}

// Export a singleton instance for easy use
export const customerService = new CustomerClientService();
export default CustomerClientService;