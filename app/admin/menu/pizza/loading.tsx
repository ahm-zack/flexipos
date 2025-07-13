"use client";
import { PizzaGridSkeleton } from "@/components/ui/pizza-skeleton";

export default function Loading() {
  return <PizzaGridSkeleton count={6} />;
}
