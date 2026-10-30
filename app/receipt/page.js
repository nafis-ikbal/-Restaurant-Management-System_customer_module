import ReceiptView from "@/components/ReceiptView";
import { requireCustomer } from "@/lib/auth";
import { getCustomerReceipt } from "@/lib/order-data";

export const dynamic = "force-dynamic";

export default async function Receipt({ searchParams }) {
  const params = await searchParams;
  const customer = await requireCustomer();
  const receipt = params?.id
    ? await getCustomerReceipt(customer.id, params.id)
    : null;

  return <ReceiptView receipt={receipt} error="" />;
}