import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to the main POS dashboard page
  redirect("/admin/menu/pizza");
}
