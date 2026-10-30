import { db } from "@/lib/db";

const reservationStatuses = new Set(["PENDING", "CONFIRMED"]);

const timeToMinutes = (value) => {
  const [hours, minutes] = String(value).slice(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
};

const dateKey = (value) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const tableNumberValue = (value) => {
  const match = String(value ?? "").match(/\d+/);
  return match ? Number(match[0]) : null;
};

const compareTableNumber = (a, b) => {
  const numA = tableNumberValue(a);
  const numB = tableNumberValue(b);
  if (numA !== null && numB !== null && numA !== numB) return numA - numB;
  return String(a ?? "").localeCompare(String(b ?? ""), undefined, {
    numeric: true,
  });
};

const isReservedNow = (reservation, now) => {
  if (!reservationStatuses.has(reservation.status)) return false;
  if (String(reservation.reservationDate).slice(0, 10) !== dateKey(now)) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return (
    timeToMinutes(reservation.startTime) <= currentMinutes &&
    currentMinutes < timeToMinutes(reservation.endTime)
  );
};

export async function getTableData() {
  const [tableRows, zoneRows, reservationRows] = await Promise.all([
    db.orm.public.RestaurantTable.all(),
    db.orm.public.TableZone.all(),
    db.orm.public.Reservation.all(),
  ]);

  const zoneById = new Map(zoneRows.map((zone) => [zone.id, zone.name]));
  const now = new Date();
  const reservations = reservationRows.map((reservation) => ({
    tableId: reservation.tableId,
    reservationDate: String(reservation.reservationDate).slice(0, 10),
    startTime: String(reservation.startTime),
    endTime: String(reservation.endTime),
    status: reservation.status,
  }));

  const tables = tableRows.map((table) => ({
    id: table.id,
    number: table.tableNumber,
    seats: table.seatingCapacity,
    zone: zoneById.get(table.zoneId) ?? "Unknown",
    status: table.status,
    booked:
      table.status !== "AVAILABLE" ||
      reservationRows.some(
        (reservation) =>
          reservation.tableId === table.id && isReservedNow(reservation, now),
      ),
  }));
  tables.sort((a, b) => compareTableNumber(a.number, b.number));

  return {
    tables,
    reservations,
  };
}