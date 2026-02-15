import DynamicMenuClientPage from "./simple-client-page";

// Dynamic route - pages are generated on-demand per authenticated user's business
// Static generation not applicable for multi-tenant routes with auth-specific content
export const dynamic = "force-dynamic";

export default function MenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <DynamicMenuClientPage params={params} />;
}
