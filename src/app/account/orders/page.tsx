import { redirect } from "next/navigation";

export default function AccountOrdersRedirectPage() {
  redirect("/dashboard/orders");
}
