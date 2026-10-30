"use server";

import { db } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/auth";

const reservationStatuses = new Set(["PENDING", "CONFIRMED"]);

const parseDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? null
    : value;
};

const parseTime = (value) => {
  if (!/^\d{2}:\d{2}$/.test(value)) return null;
  const [hours, minutes] = value.split(":").map(Number);
  return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60
    ? hours * 60 + minutes
    : null;
};

export async function createReservation({
  tableId,
  reservationDate,
  startTime,
  endTime,
  guestCount,
}) {
  const validDate = parseDate(reservationDate);
  const startMinutes = parseTime(startTime);
  const endMinutes = parseTime(endTime);
  const guests = Number(guestCount);

  if (!tableId || !validDate || startMinutes === null || endMinutes === null) {
    return { ok: false, error: "Please select a valid table, date, and time." };
  }

  if (endMinutes <= startMinutes) {
    return { ok: false, error: "Reservation end time must be after the start time." };
  }

  if (!Number.isInteger(guests) || guests < 1) {
    return { ok: false, error: "Guest count must be a positive whole number." };
  }

  const table = await db.orm.public.RestaurantTable.where({ id: tableId }).first();
  if (!table) return { ok: false, error: "The selected table is no longer available." };
  if (table.status !== "AVAILABLE") {
    return { ok: false, error: "The selected table is currently unavailable." };
  }
  if (guests > table.seatingCapacity) {
    return { ok: false, error: "Guest count exceeds the table capacity." };
  }

  const hasConflict = (reservations) =>
    reservations.some((reservation) => {
      if (!reservationStatuses.has(reservation.status)) return false;
      if (String(reservation.reservationDate).slice(0, 10) !== validDate) return false;

      const existingStart = parseTime(String(reservation.startTime).slice(0, 5));
      const existingEnd = parseTime(String(reservation.endTime).slice(0, 5));
      return (
        existingStart !== null &&
        existingEnd !== null &&
        existingStart < endMinutes &&
        existingEnd > startMinutes
      );
    });

  const reservations = await db.orm.public.Reservation.where({ tableId }).all();
  if (hasConflict(reservations)) {
    return { ok: false, error: "This table is already reserved for that time." };
  }

  const customer = await getCurrentCustomer();
  if (!customer) {
    return {
      ok: false,
      error: "Please log in with an approved customer account before reserving a table.",
    };
  }

  // Serialize concurrent bookings for the same table. The row-level lock on
  // the parent table row makes a simultaneous request wait until this
  // transaction commits, so its overlap re-check observes this insert.
  // Only the lock + overlap re-check + insert are authoritative; the checks
  // above are fast-path rejections that preserve existing error behavior.
  try {
    await db.transaction(async (tx) => {
      const locked = await tx.orm.public.RestaurantTable.where({ id: tableId }).first();
      if (!locked) throw new Error("TABLE_GONE");
      await tx.orm.public.RestaurantTable.where({ id: tableId }).update({
        updatedAt: new Date().toISOString(),
      });

      const freshTable = await tx.orm.public.RestaurantTable.where({ id: tableId }).first();
      if (!freshTable) throw new Error("TABLE_GONE");
      if (freshTable.status !== "AVAILABLE") throw new Error("TABLE_UNAVAILABLE");
      if (guests > freshTable.seatingCapacity) throw new Error("OVER_CAPACITY");

      const freshReservations = await tx.orm.public.Reservation.where({ tableId }).all();
      if (hasConflict(freshReservations)) throw new Error("SLOT_TAKEN");

      await tx.orm.public.Reservation.create({
        customerId: customer.id,
        tableId,
        reservationDate: validDate,
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        guestCount: guests,
        status: "PENDING",
      });
    });
  } catch (error) {
    if (error?.message === "TABLE_GONE") {
      return { ok: false, error: "The selected table is no longer available." };
    }
    if (error?.message === "TABLE_UNAVAILABLE") {
      return { ok: false, error: "The selected table is currently unavailable." };
    }
    if (error?.message === "OVER_CAPACITY") {
      return { ok: false, error: "Guest count exceeds the table capacity." };
    }
    if (error?.message === "SLOT_TAKEN") {
      return { ok: false, error: "This table is already reserved for that time." };
    }
    return { ok: false, error: "Unable to save the reservation. Please try again." };
  }

  return { ok: true };
}