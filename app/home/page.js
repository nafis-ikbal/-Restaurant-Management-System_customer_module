import CustomerMenu from "@/components/CustomerMenu";
import { getMenuData } from "@/lib/menu-data";
import { requireCustomer } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await requireCustomer();
  const menuData = await getMenuData();

  return <CustomerMenu {...menuData} />;
}
