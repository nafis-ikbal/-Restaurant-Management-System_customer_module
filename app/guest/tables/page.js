import TableGrid from "@/components/TableGrid";
import { getTableData } from "@/lib/table-data";

export const dynamic = "force-dynamic";

export default async function GuestTables() {
  const { tables } = await getTableData();

  return <TableGrid guest tables={tables} />;
}
