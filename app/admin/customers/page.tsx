import { CustomersProvider, CustomersList } from "@/modules/customers-feature";

export default function CustomersPage() {
  return (
    <CustomersProvider>
      <CustomersList />
    </CustomersProvider>
  );
}
