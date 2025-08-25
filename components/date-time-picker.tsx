"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, Clock, X } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface DateTimePickerProps {
  // Values
  fromDate?: Date;
  toDate?: Date;

  // Callbacks
  onFromDateChange?: (date: Date | undefined) => void;
  onToDateChange?: (date: Date | undefined) => void;
  onClearDates?: () => void;

  // Labels
  fromDateLabel?: string;
  toDateLabel?: string;
  fromTimeLabel?: string;
  toTimeLabel?: string;

  // Layout
  showRange?: boolean; // true for date range, false for single date
  showClearButton?: boolean;
  className?: string;
}

export function DateTimePicker({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onClearDates,
  fromDateLabel = "From Date",
  toDateLabel = "To Date",
  fromTimeLabel = "From Time",
  toTimeLabel = "To Time",
  showRange = true,
  showClearButton = true,
  className = "",
}: DateTimePickerProps) {
  // State for popover open/close
  const [fromDateOpen, setFromDateOpen] = useState(false);
  const [toDateOpen, setToDateOpen] = useState(false);
  const [fromTimeOpen, setFromTimeOpen] = useState(false);
  const [toTimeOpen, setToTimeOpen] = useState(false);

  // Time change handlers
  const handleTimeChange = (
    date: Date | undefined,
    onChange: ((date: Date | undefined) => void) | undefined,
    type: "hour" | "minute" | "ampm",
    value: string | number
  ) => {
    if (!onChange) return;

    const newDate = date ? new Date(date) : new Date();

    switch (type) {
      case "hour":
        const hour12 = typeof value === "string" ? parseInt(value) : value;
        const currentHour = newDate.getHours();
        const isPM = currentHour >= 12;
        const hour24 = isPM
          ? hour12 === 12
            ? 12
            : hour12 + 12
          : hour12 === 12
          ? 0
          : hour12;
        newDate.setHours(hour24, newDate.getMinutes(), 0, 0);
        break;

      case "minute":
        const minutes = typeof value === "string" ? parseInt(value) : value;
        newDate.setHours(newDate.getHours(), minutes, 0, 0);
        break;

      case "ampm":
        const isPMNew = value === "PM";
        const currentHour24 = newDate.getHours();
        const hour12Current = currentHour24 % 12 || 12;
        const newHour24 = isPMNew
          ? hour12Current === 12
            ? 12
            : hour12Current + 12
          : hour12Current === 12
          ? 0
          : hour12Current;
        newDate.setHours(newHour24, newDate.getMinutes(), 0, 0);
        break;
    }

    onChange(newDate);
  };

  // Reset time to 00:00
  const resetTime = (
    date: Date | undefined,
    onChange: ((date: Date | undefined) => void) | undefined,
    setTimeOpen: (open: boolean) => void
  ) => {
    if (!onChange) return;

    const newDate = date ? new Date(date) : new Date();
    newDate.setHours(0, 0, 0, 0);
    onChange(newDate);
    setTimeOpen(false);
  };

  const renderTimeSelector = (
    date: Date | undefined,
    onChange: ((date: Date | undefined) => void) | undefined,
    timeOpen: boolean,
    setTimeOpen: (open: boolean) => void,
    timeLabel: string
  ) => (
    <Popover open={timeOpen} onOpenChange={setTimeOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 sm:w-28 justify-between font-normal"
        >
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span className="truncate text-xs sm:text-sm">
            {date ? format(date, "h:mm a") : timeLabel}
          </span>
          <ChevronDown className="h-4 w-4 ml-1 flex-shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="start">
        <div className="space-y-3">
          <div className="text-sm font-medium">Select Time</div>
          <div className="flex items-center gap-2">
            {/* Hour */}
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Hour</label>
              <select
                className="w-full px-3 py-2 rounded-md bg-background"
                value={date ? date.getHours() % 12 || 12 : 12}
                onChange={(e) =>
                  handleTimeChange(date, onChange, "hour", e.target.value)
                }
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

            {/* Minute */}
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Minute</label>
              <select
                className="w-full px-3 py-2 rounded-md bg-background"
                value={date ? date.getMinutes() : 0}
                onChange={(e) =>
                  handleTimeChange(date, onChange, "minute", e.target.value)
                }
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>

            {/* AM/PM */}
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">AM/PM</label>
              <select
                className="w-full px-3 py-2 rounded-md bg-background"
                value={date ? (date.getHours() >= 12 ? "PM" : "AM") : "AM"}
                onChange={(e) =>
                  handleTimeChange(date, onChange, "ampm", e.target.value)
                }
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
              onClick={() => resetTime(date, onChange, setTimeOpen)}
            >
              Reset
            </Button>
            <Button size="sm" onClick={() => setTimeOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <div
      className={`flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 w-full ${className}`}
    >
      {/* From Date and Time */}
      <div className="flex gap-2 flex-1">
        {/* From Date */}
        <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 sm:w-32 justify-between font-normal"
            >
              <span className="truncate">
                {fromDate ? format(fromDate, "MMM dd") : fromDateLabel}
              </span>
              <ChevronDown className="h-4 w-4 ml-1 flex-shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={fromDate}
              captionLayout="dropdown"
              onSelect={(date) => {
                onFromDateChange?.(date);
                setFromDateOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>

        {/* From Time */}
        {renderTimeSelector(
          fromDate,
          onFromDateChange,
          fromTimeOpen,
          setFromTimeOpen,
          fromTimeLabel
        )}
      </div>

      {/* "To" label and To Date/Time (only if showRange is true) */}
      {showRange && (
        <>
          {/* "To" label */}
          <span className="text-muted-foreground text-sm sm:inline flex justify-center">
            to
          </span>

          {/* To Date and Time */}
          <div className="flex gap-2 flex-1">
            {/* To Date */}
            <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 sm:w-32 justify-between font-normal"
                >
                  <span className="truncate">
                    {toDate ? format(toDate, "MMM dd") : toDateLabel}
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
                  selected={toDate}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    onToDateChange?.(date);
                    setToDateOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>

            {/* To Time */}
            {renderTimeSelector(
              toDate,
              onToDateChange,
              toTimeOpen,
              setToTimeOpen,
              toTimeLabel
            )}
          </div>
        </>
      )}

      {/* Clear Button */}
      {showClearButton && (fromDate || toDate) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearDates}
          className="w-full sm:w-8 sm:h-8 p-2 sm:p-0 hover:bg-muted flex-shrink-0 justify-center"
        >
          <X className="h-4 w-4" />
          <span className="ml-2 sm:hidden">Clear Filters</span>
        </Button>
      )}
    </div>
  );
}
