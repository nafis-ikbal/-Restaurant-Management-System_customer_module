"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/auth";

const TAX_RATE = 5;
const activeStatuses = new Set(["PENDING", "CONFIRMED"]);

const nextOrderNumber = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = String(Date.now()).slice(-7);
    const orderNumber = `#TT-${suffix}${attempt ? `-${attempt}` : ""}`;
    const existing = await db.orm.public.Order.where({ orderNumber }).first();
    if (!existing) return orderNumber;
  }
  throw new Error("Unable to create a unique order number.");
};

const normalizeCart = (items) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  return items.map((item) => ({
    slug: String(item?.id ?? ""),
    quantity: Number(item?.qty),
    customizations: Array.isArray(item?.customizations) ? item.customizations : [],
  }));
};

export async function createOrder(items) {
  const customer = await getCurrentCustomer();
  if (!customer) return { ok: false, error: "Please log in with an approved customer account before ordering." };

  const cart = normalizeCart(items);
  if (!cart || cart.some((item) => !item.slug || !Number.isInteger(item.quantity) || item.quantity < 1)) {
    return { ok: false, error: "Your cart is empty or contains an invalid item." };
  }

  const lineItems = [];
  for (const cartItem of cart) {
    const menuItem = await db.orm.public.MenuItem.where({ slug: cartItem.slug }).first();
    if (!menuItem || !menuItem.isAvailable) {
      return { ok: false, error: "One of the selected items is no longer available." };
    }

    const links = await db.orm.public.MenuItemCustomizationGroup.where({ menuItemId: menuItem.id }).all();
    const allowedGroupIds = new Set(links.map((link) => link.groupId));
    const selectedOptionIds = new Set();
    let unitPrice = Number(menuItem.price);
    const customizations = [];

    for (const selection of cartItem.customizations) {
      const option = await db.orm.public.CustomizationOption.where({ id: String(selection.optionId) }).first();
      if (!option || !allowedGroupIds.has(option.groupId) || selectedOptionIds.has(option.id) || !option.isAvailable) {
        return { ok: false, error: "One of the selected customizations is no longer available." };
      }
      selectedOptionIds.add(option.id);
      unitPrice += Number(option.priceDelta);
      customizations.push({
        optionId: option.id,
        optionNameSnapshot: option.name,
        priceDeltaSnapshot: String(option.priceDelta),
      });
    }

    lineItems.push({
      menuItem,
      quantity: cartItem.quantity,
      unitPrice,
      subtotal: unitPrice * cartItem.quantity,
      customizations,
    });
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0);
  const taxAmount = Math.round(subtotal * TAX_RATE) / 100;
  const total = subtotal + taxAmount;
  const orderId = crypto.randomUUID();
  const billId = crypto.randomUUID();
  const orderNumber = await nextOrderNumber();

  await db.transaction(async (tx) => {
    await tx.orm.public.Order.create({
      id: orderId,
      orderNumber,
      customerId: customer.id,
      tableId: null,
      status: "PLACED",
      etaMinutes: null,
      subtotal: subtotal.toFixed(2),
      taxRate: String(TAX_RATE),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
    });

    for (const lineItem of lineItems) {
      const orderItemId = crypto.randomUUID();
      await tx.orm.public.OrderItem.create({
        id: orderItemId,
        orderId,
        menuItemId: lineItem.menuItem.id,
        itemNameSnapshot: lineItem.menuItem.name,
        quantity: lineItem.quantity,
        unitPrice: lineItem.unitPrice.toFixed(2),
        subtotal: lineItem.subtotal.toFixed(2),
      });
      for (const customization of lineItem.customizations) {
        await tx.orm.public.OrderItemCustomization.create({
          orderItemId,
          optionId: customization.optionId,
          optionNameSnapshot: customization.optionNameSnapshot,
          priceDeltaSnapshot: customization.priceDeltaSnapshot,
        });
      }
    }

    await tx.orm.public.Bill.create({
      id: billId,
      orderId,
      subtotal: subtotal.toFixed(2),
      taxRate: String(TAX_RATE),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
      status: "UNPAID",
    });
  });

  return { ok: true, orderNumber };
}

export async function cancelOrder(orderId) {
  let customer;
  try {
    customer = await getCurrentCustomer();
    if (!customer) {
      return { ok: false, error: "Please log in before cancelling an order." };
    }

    const orderNumber = String(orderId ?? "");
    const order = await db.orm.public.Order.where({
      orderNumber,
      customerId: customer.id,
    }).first();

    if (!order) {
      return { ok: false, error: "Order not found." };
    }
    const bill = await db.orm.public.Bill.where({ orderId: order.id }).first();
    if (bill?.status === "PAID") {
      return {
        ok: false,
        error: "This order has already been paid and can no longer be cancelled.",
      };
    }
    if (order.status !== "PLACED") {
      return { ok: false, error: "This order can no longer be cancelled." };
    }

    await db.orm.public.Order.where({ id: order.id }).update({
      status: "CANCELLED",
    });

    revalidatePath("/orders");
    return { ok: true };
  } catch {
    return { ok: false, error: "Unable to cancel the order. Please try again." };
  }
}

export async function payOrder(orderNumber) {
  const customer = await getCurrentCustomer();
  if (!customer) return { ok: false, error: "Please log in before paying for an order." };

  const order = await db.orm.public.Order.where({ orderNumber, customerId: customer.id }).first();
  if (!order) return { ok: false, error: "Order not found." };
  if (order.status === "CANCELLED") {
    return { ok: false, error: "This order was cancelled and can no longer be paid for." };
  }
  const bill = await db.orm.public.Bill.where({ orderId: order.id }).first();
  if (!bill) return { ok: false, error: "Bill not found." };
  if (bill.status === "PAID") return { ok: true };

  const existingPayments = await db.orm.public.Payment.where({ billId: bill.id }).all();
  if (existingPayments.some((payment) => payment.status === "COMPLETED")) return { ok: true };

  await db.transaction(async (tx) => {
    await tx.orm.public.Payment.create({
      id: crypto.randomUUID(),
      billId: bill.id,
      amount: String(bill.total),
      method: "ONLINE",
      status: "COMPLETED",
      paidAt: new Date().toISOString(),
      transactionReference: `LOCAL-${crypto.randomUUID()}`,
    });
    await tx.orm.public.Bill.where({ id: bill.id }).update({
      status: "PAID",
      paidAt: new Date().toISOString(),
    });
  });

  revalidatePath("/orders");
  revalidatePath("/receipt");
  return { ok: true };
}