import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function CreateMenuItem() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          className="h-14 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <a href="#" className="flex items-center justify-center gap-3">
            <span>Create Item</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
