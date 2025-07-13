// Sandwich Feature Module
// Centralized exports for all sandwich-related components and hooks

// Components
export { SandwichGrid } from './components/sandwich-grid';
export { CreateSandwichForm } from './components/create-sandwich-form';
export { EditSandwichForm } from './components/edit-sandwich-form';
export { SandwichManagementView } from './components/sandwich-management-view';
export { SandwichCashierView } from './components/sandwich-cashier-view';

// Hooks
export {
  useSandwiches,
  useSandwich,
  useCreateSandwich,
  useUpdateSandwich,
  useDeleteSandwich,
} from './hooks/use-sandwiches';

// Query Keys
export { sandwichKeys } from './queries/sandwich-keys';
