import OrdersView from "@/components/OrdersView";
import { requireCustomer } from "@/lib/auth";
import { getCustomerOrders } from "@/lib/order-data";

export const dynamic = "force-dynamic";

export default async function Orders() {
  const customer = await requireCustomer();
  const orders = await getCustomerOrders(customer.id);

  return <OrdersView orders={orders} error="" />;
}
