import "dotenv/config";
import crypto from "node:crypto";
import postgres from "@prisma/orm-postgres/runtime";
import contractJson from "../prisma/contract.json" with { type: "json" };
import { customizationCatalog, menuCustomizationGroups, menuItems, orders, tables } from "./seed-data.mjs";

const db = postgres({
  contractJson,
  url: process.env.DATABASE_URL,
});

const id = () => crypto.randomUUID();

const imageUrl = (item) => item.image;

const parsePreparationTime = (value) => {
  const minutes = value.match(/(\d+)(?:-(\d+))?/);
  if (!minutes) return { min: 0, max: 0 };
  return {
    min: Number(minutes[1]),
    max: Number(minutes[2] ?? minutes[1]),
  };
};

const categorySlug = (name) => name.toLowerCase().replaceAll(" ", "-");

const roles = ["ADMIN", "WAITER", "CHEF", "CUSTOMER"];
const categoryNames = ["Starters", "Pizza", "Burgers", "Drinks", "Desserts"];

async function seed() {
  const roleIds = new Map();
  for (const name of roles) {
    const existing = await db.orm.public.Role.where({ name }).first();
    const role = existing ?? (await db.orm.public.Role.create({ id: id(), name }));
    roleIds.set(name, role.id);
  }

  const categoryIds = new Map();
  for (const [displayOrder, name] of categoryNames.entries()) {
    const slug = categorySlug(name);
    const existing = await db.orm.public.Category.where({ slug }).first();
    const category = existing ?? (await db.orm.public.Category.create({
      id: id(),
      name,
      slug,
      displayOrder,
      isActive: true,
    }));
    categoryIds.set(name, category.id);
  }

  const ingredientIds = new Map();
  for (const item of menuItems) {
    for (const name of item.ingredients ?? []) {
      if (ingredientIds.has(name)) continue;
      const existing = await db.orm.public.Ingredient.where({ name }).first();
      const ingredient = existing ?? (await db.orm.public.Ingredient.create({
        id: id(),
        name,
      }));
      ingredientIds.set(name, ingredient.id);
    }
  }

  const groupIds = new Map();
  for (const [displayOrder, [name, options]] of Object.entries(customizationCatalog).entries()) {
    const existing = await db.orm.public.CustomizationGroup.where({ name }).first();
    const group = existing ?? (await db.orm.public.CustomizationGroup.create({
      id: id(),
      name,
      displayOrder,
    }));
    groupIds.set(name, group.id);

    for (const [optionName, priceDelta] of options) {
      const existingOption = await db.orm.public.CustomizationOption.where({
        groupId: group.id,
        name: optionName,
      }).first();
      if (!existingOption) {
        await db.orm.public.CustomizationOption.create({
          id: id(),
          groupId: group.id,
          name: optionName,
          priceDelta,
          isAvailable: true,
          displayOrder: options.findIndex(([candidate]) => candidate === optionName),
        });
      }
    }
  }

  const menuItemIds = new Map();
  for (const item of menuItems) {
    const preparation = parsePreparationTime(item.preparationTime);
    const existing = await db.orm.public.MenuItem.where({ slug: item.id }).first();
    let menuItem = existing;
    if (!menuItem) {
      menuItem = await db.orm.public.MenuItem.create({
        id: id(),
        slug: item.id,
        name: item.name,
        description: item.description,
        price: String(item.price),
        imageUrl: imageUrl(item),
        isAvailable: true,
        isBuildable: item.buildable,
        preparationTimeMin: preparation.min,
        preparationTimeMax: preparation.max,
        categoryId: categoryIds.get(item.category),
      });
    } else if (menuItem.isBuildable !== item.buildable) {
      await db.orm.public.MenuItem.where({ id: menuItem.id }).update({
        isBuildable: item.buildable,
      });
    }
    menuItemIds.set(item.name, menuItem.id);

    for (const [displayOrder, ingredientName] of (item.ingredients ?? []).entries()) {
      const existingIngredient = await db.orm.public.MenuItemIngredient.where({
        menuItemId: menuItem.id,
        ingredientId: ingredientIds.get(ingredientName),
      }).first();
      if (!existingIngredient) {
        await db.orm.public.MenuItemIngredient.create({
          menuItemId: menuItem.id,
          ingredientId: ingredientIds.get(ingredientName),
          displayOrder,
        });
      }
    }

    const linkedGroupNames = menuCustomizationGroups[item.id] ?? [];
    for (const groupName of linkedGroupNames) {
      const groupId = groupIds.get(groupName);
      const existingGroup = await db.orm.public.MenuItemCustomizationGroup.where({
        menuItemId: menuItem.id,
        groupId,
      }).first();
      if (!existingGroup) {
        await db.orm.public.MenuItemCustomizationGroup.create({
          menuItemId: menuItem.id,
          groupId,
          isRequired: false,
          minimumSelections: 0,
          maximumSelections: 1,
        });
      } else if (existingGroup.isRequired || existingGroup.minimumSelections !== 0) {
        await db.orm.public.MenuItemCustomizationGroup.where({
          menuItemId: menuItem.id,
          groupId,
        }).update({
          isRequired: false,
          minimumSelections: 0,
        });
      }
    }
  }

  const zoneIds = new Map();
  for (const table of tables) {
    if (zoneIds.has(table.zone)) continue;
    const existing = await db.orm.public.TableZone.where({ name: table.zone }).first();
    const zone = existing ?? (await db.orm.public.TableZone.create({ id: id(), name: table.zone }));
    zoneIds.set(table.zone, zone.id);
  }

  const tableIds = new Map();
  for (const table of tables) {
    const existing = await db.orm.public.RestaurantTable.where({ tableNumber: table.number }).first();
    const restaurantTable = existing ?? (await db.orm.public.RestaurantTable.create({
      id: id(),
      tableNumber: table.number,
      seatingCapacity: table.seats,
      zoneId: zoneIds.get(table.zone),
      status: "AVAILABLE",
    }));
    tableIds.set(table.number, restaurantTable.id);
  }

  for (const sourceOrder of orders) {
    const existing = await db.orm.public.Order.where({ orderNumber: sourceOrder.id }).first();
    if (existing) continue;

    const orderId = id();
    await db.orm.public.Order.create({
      id: orderId,
      orderNumber: sourceOrder.id,
      customerId: null,
      tableId: null,
      status: sourceOrder.status === "In Kitchen" ? "IN_KITCHEN" : "PAID",
      etaMinutes: sourceOrder.status === "In Kitchen" ? 10 : null,
      subtotal: String(sourceOrder.subtotal),
      taxRate: "5",
      taxAmount: String(sourceOrder.tax),
      total: String(sourceOrder.total),
    });

    for (const sourceItem of sourceOrder.items) {
      await db.orm.public.OrderItem.create({
        id: id(),
        orderId,
        menuItemId: menuItemIds.get(sourceItem.name) ?? null,
        itemNameSnapshot: sourceItem.name,
        quantity: sourceItem.qty,
        unitPrice: String(sourceItem.price),
        subtotal: String(sourceItem.qty * sourceItem.price),
      });
    }

    const billId = id();
    await db.orm.public.Bill.create({
      id: billId,
      orderId,
      subtotal: String(sourceOrder.subtotal),
      taxRate: "5",
      taxAmount: String(sourceOrder.tax),
      total: String(sourceOrder.total),
      status: sourceOrder.status === "Paid" ? "PAID" : "UNPAID",
    });
  }

  console.log(JSON.stringify({
    roles: roleIds.size,
    categories: categoryIds.size,
    ingredients: ingredientIds.size,
    menuItems: menuItemIds.size,
    tables: tableIds.size,
    orders: orders.length,
  }));
}

try {
  await seed();
} finally {
  await db.close();
}