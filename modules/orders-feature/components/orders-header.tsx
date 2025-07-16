/**
 * Orders Header Component - Search and filter controls
 */

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  ChevronDown,
  Clock,
} from "lucide-react";
import { useOrdersContext } from "../contexts/orders-context";
import { format } from "date-fns";
import { useState, useEffect } from "react";

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
  const [fromDateOpen, setFromDateOpen] = useState(false);
  const [toDateOpen, setToDateOpen] = useState(false);
  const [fromTimeOpen, setFromTimeOpen] = useState(false);
  const [toTimeOpen, setToTimeOpen] = useState(false);

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
        <h1 className="text-3xl font-bold">Orders</h1>
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
              placeholder="Search by order number..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="pl-10 pr-10"
            />
            {input && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInput("")}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filter Buttons - Inline on lg+ screens */}
          <div className="flex flex-col sm:flex-row gap-2 lg:flex-row lg:gap-2">
            {/* Payment Method Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 min-w-fit"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Payment</span>
                  <span className="sm:hidden">Payment Methods</span>
                  {(filters.activeFilters.has("cash") ||
                    filters.activeFilters.has("card") ||
                    filters.activeFilters.has("mixed")) && (
                    <span className="ml-1 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs">
                      {
                        [...filters.activeFilters].filter((f) =>
                          ["cash", "card", "mixed"].includes(f)
                        ).length
                      }
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Payment Methods</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filters.activeFilters.has("cash")}
                  onCheckedChange={() => toggleFilter("cash")}
                >
                  <Banknote className="mr-2 h-4 w-4" />
                  Cash
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.activeFilters.has("card")}
                  onCheckedChange={() => toggleFilter("card")}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Card
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.activeFilters.has("mixed")}
                  onCheckedChange={() => toggleFilter("mixed")}
                >
                  <Split className="mr-2 h-4 w-4" />
                  Mixed
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Status Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 min-w-fit"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Status</span>
                  <span className="sm:hidden">Order Status</span>
                  {(filters.activeFilters.has("completed") ||
                    filters.activeFilters.has("modified") ||
                    filters.activeFilters.has("canceled")) && (
                    <span className="ml-1 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs">
                      {
                        [...filters.activeFilters].filter((f) =>
                          ["completed", "modified", "canceled"].includes(f)
                        ).length
                      }
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Order Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filters.activeFilters.has("completed")}
                  onCheckedChange={() => toggleFilter("completed")}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Completed
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.activeFilters.has("modified")}
                  onCheckedChange={() => toggleFilter("modified")}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Modified
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.activeFilters.has("canceled")}
                  onCheckedChange={() => toggleFilter("canceled")}
                >
                  <X className="mr-2 h-4 w-4" />
                  Canceled
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Date Range Filters - Full width row below */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 w-full">
          {/* Date/Time Row 1 - From Date and Time */}
          <div className="flex gap-2 flex-1">
            {/* From Date Popover */}
            <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 sm:w-32 justify-between font-normal"
                >
                  <span className="truncate">
                    {filters.dateFrom
                      ? format(filters.dateFrom, "MMM dd")
                      : "From Date"}
                  </span>
                  <ChevronDown className="h-4 w-4 ml-1 flex-shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={filters.dateFrom}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setDateFrom(date);
                    setFromDateOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>

            {/* From Time Popover */}
            <Popover open={fromTimeOpen} onOpenChange={setFromTimeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 sm:w-28 justify-between font-normal"
                >
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate text-xs sm:text-sm">
                    {filters.dateFrom
                      ? format(filters.dateFrom, "h:mm a")
                      : "From Time"}
                  </span>
                  <ChevronDown className="h-4 w-4 ml-1 flex-shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4" align="start">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Select Time</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">
                        Hour
                      </label>
                      <select
                        className="w-full px-3 py-2 rounded-md bg-background"
                        value={
                          filters.dateFrom
                            ? filters.dateFrom.getHours() % 12 || 12
                            : 12
                        }
                        onChange={(e) => {
                          const hour12 = parseInt(e.target.value);
                          const date = filters.dateFrom
                            ? new Date(filters.dateFrom)
                            : new Date();
                          const currentHour = date.getHours();
                          const isPM = currentHour >= 12;
                          const hour24 = isPM
                            ? hour12 === 12
                              ? 12
                              : hour12 + 12
                            : hour12 === 12
                            ? 0
                            : hour12;
                          date.setHours(hour24, date.getMinutes(), 0, 0);
                          setDateFrom(date);
                        }}
                      >
                        {Array.from({ length: 12 }, (_, i) => {
                          const hour = i + 1;
                          return (
                            <option key={hour} value={hour}>
                              {hour}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">
                        Minute
                      </label>
                      <select
                        className="w-full px-3 py-2 rounded-md bg-background"
                        value={
                          filters.dateFrom ? filters.dateFrom.getMinutes() : 0
                        }
                        onChange={(e) => {
                          const minutes = parseInt(e.target.value);
                          const date = filters.dateFrom
                            ? new Date(filters.dateFrom)
                            : new Date();
                          date.setHours(date.getHours(), minutes, 0, 0);
                          setDateFrom(date);
                        }}
                      >
                        {Array.from({ length: 60 }, (_, i) => (
                          <option key={i} value={i}>
                            {i.toString().padStart(2, "0")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">
                        AM/PM
                      </label>
                      <select
                        className="w-full px-3 py-2 rounded-md bg-background"
                        value={
                          filters.dateFrom
                            ? filters.dateFrom.getHours() >= 12
                              ? "PM"
                              : "AM"
                            : "AM"
                        }
                        onChange={(e) => {
                          const isPM = e.target.value === "PM";
                          const date = filters.dateFrom
                            ? new Date(filters.dateFrom)
                            : new Date();
                          const currentHour = date.getHours();
                          const hour12 = currentHour % 12 || 12;
                          const hour24 = isPM
                            ? hour12 === 12
                              ? 12
                              : hour12 + 12
                            : hour12 === 12
                            ? 0
                            : hour12;
                          date.setHours(hour24, date.getMinutes(), 0, 0);
                          setDateFrom(date);
                        }}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const date = filters.dateFrom
                          ? new Date(filters.dateFrom)
                          : new Date();
                        date.setHours(0, 0, 0, 0);
                        setDateFrom(date);
                        setFromTimeOpen(false);
                      }}
                    >
                      Reset
                    </Button>
                    <Button size="sm" onClick={() => setFromTimeOpen(false)}>
                      Done
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* "To" label for mobile - hidden on desktop */}
          <span className="text-muted-foreground text-sm sm:inline flex justify-center">
            to
          </span>

          {/* Date/Time Row 2 - To Date and Time */}
          <div className="flex gap-2 flex-1">
            {/* To Date Popover */}
            <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 sm:w-32 justify-between font-normal"
                >
                  <span className="truncate">
                    {filters.dateTo
                      ? format(filters.dateTo, "MMM dd")
                      : "To Date"}
                  </span>
                  <ChevronDown className="h-4 w-4 ml-1 flex-shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={filters.dateTo}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setDateTo(date);
                    setToDateOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>

            {/* To Time Popover */}
            <Popover open={toTimeOpen} onOpenChange={setToTimeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 sm:w-28 justify-between font-normal"
                >
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate text-xs sm:text-sm">
                    {filters.dateTo
                      ? format(filters.dateTo, "h:mm a")
                      : "To Time"}
                  </span>
                  <ChevronDown className="h-4 w-4 ml-1 flex-shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4" align="start">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Select Time</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">
                        Hour
                      </label>
                      <select
                        className="w-full px-3 py-2 rounded-md bg-background"
                        value={
                          filters.dateTo
                            ? filters.dateTo.getHours() % 12 || 12
                            : 12
                        }
                        onChange={(e) => {
                          const hour12 = parseInt(e.target.value);
                          const date = filters.dateTo
                            ? new Date(filters.dateTo)
                            : new Date();
                          const currentHour = date.getHours();
                          const isPM = currentHour >= 12;
                          const hour24 = isPM
                            ? hour12 === 12
                              ? 12
                              : hour12 + 12
                            : hour12 === 12
                            ? 0
                            : hour12;
                          date.setHours(hour24, date.getMinutes(), 0, 0);
                          setDateTo(date);
                        }}
                      >
                        {Array.from({ length: 12 }, (_, i) => {
                          const hour = i + 1;
                          return (
                            <option key={hour} value={hour}>
                              {hour}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">
                        Minute
                      </label>
                      <select
                        className="w-full px-3 py-2 rounded-md bg-background"
                        value={filters.dateTo ? filters.dateTo.getMinutes() : 0}
                        onChange={(e) => {
                          const minutes = parseInt(e.target.value);
                          const date = filters.dateTo
                            ? new Date(filters.dateTo)
                            : new Date();
                          date.setHours(date.getHours(), minutes, 0, 0);
                          setDateTo(date);
                        }}
                      >
                        {Array.from({ length: 60 }, (_, i) => (
                          <option key={i} value={i}>
                            {i.toString().padStart(2, "0")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">
                        AM/PM
                      </label>
                      <select
                        className="w-full px-3 py-2 rounded-md bg-background"
                        value={
                          filters.dateTo
                            ? filters.dateTo.getHours() >= 12
                              ? "PM"
                              : "AM"
                            : "AM"
                        }
                        onChange={(e) => {
                          const isPM = e.target.value === "PM";
                          const date = filters.dateTo
                            ? new Date(filters.dateTo)
                            : new Date();
                          const currentHour = date.getHours();
                          const hour12 = currentHour % 12 || 12;
                          const hour24 = isPM
                            ? hour12 === 12
                              ? 12
                              : hour12 + 12
                            : hour12 === 12
                            ? 0
                            : hour12;
                          date.setHours(hour24, date.getMinutes(), 0, 0);
                          setDateTo(date);
                        }}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const date = filters.dateTo
                          ? new Date(filters.dateTo)
                          : new Date();
                        date.setHours(0, 0, 0, 0);
                        setDateTo(date);
                        setToTimeOpen(false);
                      }}
                    >
                      Reset
                    </Button>
                    <Button size="sm" onClick={() => setToTimeOpen(false)}>
                      Done
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Clear Date Filters Button - Full width on mobile */}
          {(filters.dateFrom || filters.dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDateFilters}
              className="w-full sm:w-8 sm:h-8 p-2 sm:p-0 hover:bg-muted flex-shrink-0 justify-center"
            >
              <X className="h-4 w-4" />
              <span className="ml-2 sm:hidden">Clear Filters</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
