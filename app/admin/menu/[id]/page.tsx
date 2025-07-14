"use client";
import { AppetizersMenuPage } from "@/modules/menu-items-pages/appetizers-menu-Page";
import { BeveragesMenuPage } from "@/modules/menu-items-pages/beverages-menu-page";
import { BurgersMenuPage } from "@/modules/menu-items-pages/burgers-menu-page";
import { MiniPiesMenuPage } from "@/modules/menu-items-pages/mini-pies-menu-page";
import { PiesMenuPage } from "@/modules/menu-items-pages/pies-menu-page";
import { PizzasMenuPage } from "@/modules/menu-items-pages/pizzas-menu-page";
import { SandwichesMenuPage } from "@/modules/menu-items-pages/sandwiches-menu-page";
import { ShawermasMenuPage } from "@/modules/menu-items-pages/shawermas-menu-page";
import { SideOrdersMenuPage } from "@/modules/menu-items-pages/side-orders-menu-page";
import { use } from "react";

const pages = {
  appetizers: AppetizersMenuPage,
  beverages: BeveragesMenuPage,
  burger: BurgersMenuPage,
  shawerma: ShawermasMenuPage,
  sandwich: SandwichesMenuPage,
  "mini-pie": MiniPiesMenuPage,
  pie: PiesMenuPage,
  "side-order": SideOrdersMenuPage,
  pizza: PizzasMenuPage,
};

export default function MenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const Component = pages[id as keyof typeof pages];
  if (!id || !Component) {
    return <div>Menu item not found</div>;
  }

  return <Component />;
}
