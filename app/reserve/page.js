import ReserveView from "@/components/ReserveView";
import { getTableData } from "@/lib/table-data";
import { requireCustomer } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Reserve() {
  await requireCustomer();
  const { tables, reservations } = await getTableData();

  return <ReserveView tables={tables} reservations={reservations} />;
}