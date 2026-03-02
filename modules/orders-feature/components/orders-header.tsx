/**
 * Orders Header Component - Search and filter controls
 */

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  X,
  Banknote,
  CreditCard,
  Split,
  Edit,
  Check,
  Filter,
  Truck,
} from "lucide-react";
import { DateTimePicker } from "@/components/date-time-picker";
import { useOrdersContext } from "../contexts/orders-context";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

// Debounce hook
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export function OrdersHeader() {
  const t = useTranslations("orders");
  const {
    filters,
    setSearchTerm,
    toggleFilter,
    setDateFrom,
    setDateTo,
    clearDateFilters,
  } = useOrdersContext();

  // Debounced search state
  const [input, setInput] = useState(filters.searchTerm);
  const debouncedInput = useDebouncedValue(input, 500);
  useEffect(() => {
    // Only trigger search if input is empty or at least 3 chars
    if (debouncedInput === "" || debouncedInput.length >= 3) {
      setSearchTerm(debouncedInput);
    }
    // Otherwise, do not update searchTerm (keeps previous results)
  }, [debouncedInput, setSearchTerm]);
  useEffect(() => {
    setInput(filters.searchTerm);
  }, [filters.searchTerm]);

  return (
    <div className="space-y-4 mb-6">
      {/* Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
      </div>

      {/* Search and Filters Row */}
      <div className="flex flex-col gap-4">
        {/* Search Bar and Filter Buttons Row - Combined on lg+ screens */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder={t("filters.search")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="pl-10"
            />
            {input && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInput("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Filter Buttons - Compact but always visible */}
          <div className="flex gap-2 flex-wrap lg:flex-nowrap">
            {/* Status Filters */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 flex-shrink-0 min-w-fit"
                >
                  <Filter className="h-4 w-4" />
                  {t("filters.status")}
                  {filters.activeFilters.size > 0 && (
                    <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                      {filters.activeFilters.size}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>
                  {t("filters.orderStatus")}
                </DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.activeFilters.has("completed")}
                  onCheckedChange={() => toggleFilter("completed")}
                >
                  <Check className="me-2 h-4 w-4" />
                  {t("filters.completed")}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.activeFilters.has("canceled")}
                  onCheckedChange={() => toggleFilter("canceled")}
                >
                  <X className="me-2 h-4 w-4" />
                  {t("filters.canceled")}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.activeFilters.has("modified")}
                  onCheckedChange={() => toggleFilter("modified")}
                >
                  <Edit className="me-2 h-4 w-4" />
                  {t("filters.modified")}
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>
                  {t("filters.paymentLabel")}
                </DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.activeFilters.has("cash")}
                  onCheckedChange={() => toggleFilter("cash")}
                >
                  <Banknote className="me-2 h-4 w-4" />
                  {t("filters.cash")}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.activeFilters.has("card")}
                  onCheckedChange={() => toggleFilter("card")}
                >
                  <CreditCard className="me-2 h-4 w-4" />
                  {t("filters.card")}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.activeFilters.has("mixed")}
                  onCheckedChange={() => toggleFilter("mixed")}
                >
                  <Split className="me-2 h-4 w-4" />
                  {t("filters.mixed")}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.activeFilters.has("delivery")}
                  onCheckedChange={() => toggleFilter("delivery")}
                >
                  <Truck className="me-2 h-4 w-4" />
                  {t("filters.delivery")}
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Date Range Filters - Full width row below */}
        <DateTimePicker
          fromDate={filters.dateFrom}
          toDate={filters.dateTo}
          onFromDateChange={setDateFrom}
          onToDateChange={setDateTo}
          onClearDates={clearDateFilters}
          fromDateLabel={t("filters.fromDate")}
          toDateLabel={t("filters.toDate")}
          fromTimeLabel={t("filters.fromTime")}
          toTimeLabel={t("filters.toTime")}
          showRange={true}
          showClearButton={true}
          className=""
        />
      </div>
    </div>
  );
}
