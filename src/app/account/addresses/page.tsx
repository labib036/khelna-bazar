import { redirect } from "next/navigation";

export default function AccountAddressesRedirectPage() {
  redirect("/dashboard/addresses");
}
