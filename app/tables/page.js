import TableGrid from "@/components/TableGrid";
import { getTableData } from "@/lib/table-data";
import { requireCustomer } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Tables() {
  await requireCustomer();
  const { tables } = await getTableData();

  return <TableGrid tables={tables} />;
}
