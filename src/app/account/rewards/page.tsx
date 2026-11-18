import { redirect } from "next/navigation";

export default function AccountRewardsRedirectPage() {
  redirect("/dashboard/rewards");
}
