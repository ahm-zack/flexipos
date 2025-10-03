"use client";

import { use } from "react";
import { ProductCashierPage } from "@/modules/product-feature";

interface DynamicMenuClientPageProps {
  params: Promise<{ id: string }>;
}

export default function DynamicMenuClientPage({
  params,
}: DynamicMenuClientPageProps) {
  const { id: categorySlug } = use(params);

  return <ProductCashierPage categorySlug={categorySlug} />;
}
