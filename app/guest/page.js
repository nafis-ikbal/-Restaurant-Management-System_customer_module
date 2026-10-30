import CustomerMenu from "@/components/CustomerMenu";
import { getMenuData } from "@/lib/menu-data";

export const dynamic = "force-dynamic";

export default async function GuestPage() {
  const menuData = await getMenuData();

  return <CustomerMenu guest {...menuData} />;
}
