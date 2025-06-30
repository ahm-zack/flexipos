import type {
  PizzaType,
  PizzaCrust,
  PizzaExtras,
} from '@/lib/db/schema';

export interface PizzaFilters {
  search?: string;
  type?: PizzaType;
  crust?: PizzaCrust;
  extras?: PizzaExtras;
}

export interface PizzaQueryParams {
  page?: number;
  limit?: number;
  filters?: PizzaFilters;
}
