import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to the inventory management system
  redirect("/admin/inventory");
}
