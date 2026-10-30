import { db } from "@/lib/db";

const OPERATIONAL_LABELS = {
  PLACED: "Placed",
  IN_KITCHEN: "In Kitchen",
  READY: "Ready",
  SERVED: "Served",
};

const TOP_STATUS_LABELS = {
  PLACED: "Placed",
  PAID: "Paid",
  CANCELLED: "Cancelled",
};

const formatDate = (value) =>
  new Date(String(value)).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });

const getTopStatus = (order, bill) => {
  if (order.status === "CANCELLED") return "CANCELLED";
  if (bill?.status === "PAID") return "PAID";
  return "PLACED";
};

const getOperationalStatus = (order) =>
  order.status in OPERATIONAL_LABELS ? order.status : null;

const mapOrder = (order, items, bills, tables) => {
  const bill = bills.find((candidate) => candidate.orderId === order.id);
  const table = tables.find((candidate) => candidate.id === order.tableId);
  const topStatus = getTopStatus(order, bill);

  return {
    id: order.orderNumber,
    date: formatDate(order.placedAt),
    status: TOP_STATUS_LABELS[topStatus] ?? topStatus,
    statusCode: topStatus,
    operationalStatus: getOperationalStatus(order),
    tableNumber: table?.tableNumber ?? null,
    items: items
      .filter((item) => item.orderId === order.id)
      .map((item) => ({
        name: item.itemNameSnapshot,
        qty: item.quantity,
        price: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      })),
    subtotal: Number(order.subtotal),
    tax: Number(order.taxAmount),
    total: Number(order.total),
    billStatus: bill?.status ?? "UNPAID",
    billId: bill?.id ?? null,
  };
};

export async function getCustomerOrders(customerId) {
  const [orders, items, bills, tables] = await Promise.all([
    db.orm.public.Order.where({ customerId }).all(),
    db.orm.public.OrderItem.all(),
    db.orm.public.Bill.all(),
    db.orm.public.RestaurantTable.all(),
  ]);

  return orders
    .sort((left, right) => new Date(String(right.placedAt)) - new Date(String(left.placedAt)))
    .map((order) => mapOrder(order, items, bills, tables));
}

export async function getCustomerReceipt(customerId, orderNumber) {
  const order = await db.orm.public.Order.where({ orderNumber, customerId }).first();
  if (!order) return null;

  const [items, bill, table] = await Promise.all([
    db.orm.public.OrderItem.where({ orderId: order.id }).all(),
    db.orm.public.Bill.where({ orderId: order.id }).first(),
    order.tableId
      ? db.orm.public.RestaurantTable.where({ id: order.tableId }).first()
      : Promise.resolve(null),
  ]);

  return {
    ...mapOrder(order, items, bill ? [bill] : [], table ? [table] : []),
    placedAt: formatDate(order.placedAt),
    billId: bill?.id ?? null,
    billStatus: bill?.status ?? "UNPAID",
  };
}