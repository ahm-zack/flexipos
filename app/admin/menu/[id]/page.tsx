// Generate static paths for all menu categories at build time
export async function generateStaticParams() {
  // Return all the menu category IDs that should be pre-generated
  return [
    { id: "appetizers" },
    { id: "beverages" },
    { id: "burger" },
    { id: "shawerma" },
    { id: "sandwich" },
    { id: "mini-pie" },
    { id: "pie" },
    { id: "side-order" },
    { id: "pizza" },
  ];
}

import MenuItemClientPage from "./client-page";

export default function MenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <MenuItemClientPage params={params} />;
}
