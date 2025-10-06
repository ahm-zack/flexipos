import { redirect } from "next/navigation";

export default function MenuPage() {
  // Redirect to new inventory system
  redirect("/admin/inventory");
}
