"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Modal from "@/components/Modal";
import { createReservation } from "@/app/reserve/actions";

const WORK_OPEN_MINUTES = 11 * 60;
const WORK_CLOSE_MINUTES = 23 * 60;
const RESERVATION_DURATION_MINUTES = 120;
const MAX_START_MINUTES = WORK_CLOSE_MINUTES - RESERVATION_DURATION_MINUTES;
const MINUTE_STEP = 5;

const reservationStatuses = new Set(["PENDING", "CONFIRMED"]);

function days() {
  return Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });
}

const dateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const timeToMinutes = (value) => {
  const [time, meridiem] = value.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

function minutesToTime24(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function minutesToMeridiem(minutes) {
  const meridiem = minutes >= 12 * 60 ? "PM" : "AM";
  let hours = Math.floor(minutes / 60) % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${String(minutes % 60).padStart(2, "0")} ${meridiem}`;
}

function tableIsBooked(table, day, time, reservations) {
  if (table.status !== "AVAILABLE") return true;

  const selectedDate = dateKey(day);
  const selectedStart = timeToMinutes(time);
  const selectedEnd = selectedStart + 120;

  return reservations.some((reservation) => {
    if (reservation.tableId !== table.id) return false;
    if (!reservationStatuses.has(reservation.status)) return false;
    if (reservation.reservationDate !== selectedDate) return false;

    const reservationStart = timeToMinutes(reservation.startTime);
    const reservationEnd = timeToMinutes(reservation.endTime);
    return reservationStart < selectedEnd && reservationEnd > selectedStart;
  });
}

function minutesToDraft(minutes) {
  const safe = Number.isInteger(minutes) ? minutes : 19 * 60;
  const hours24 = Math.floor(safe / 60);
  const snappedMinute = Math.min(55, Math.round((safe % 60) / MINUTE_STEP) * MINUTE_STEP);
  return {
    hour12: hours24 % 12 === 0 ? 12 : hours24 % 12,
    minute: snappedMinute,
    meridiem: hours24 >= 12 ? "PM" : "AM",
  };
}

function draftToMinutes(hour12, minute, meridiem) {
  let hours24 = hour12 % 12;
  if (meridiem === "PM") hours24 += 12;
  return hours24 * 60 + minute;
}

function CustomTimePicker({ initialMinutes, onConfirm, onCancel }) {
  const initial = minutesToDraft(initialMinutes);
  const [hour12, setHour12] = useState(initial.hour12);
  const [minute, setMinute] = useState(initial.minute);
  const [meridiem, setMeridiem] = useState(initial.meridiem);

  const draftMinutes = draftToMinutes(hour12, minute, meridiem);
  const valid =
    draftMinutes >= WORK_OPEN_MINUTES && draftMinutes <= MAX_START_MINUTES;

  const optionClass = (active) =>
    `rounded-lg border px-3 py-2 text-sm font-semibold transition ${
      active
        ? "border-[#ff7a45] bg-[#ff7a45] text-white"
        : "border-[#e5e8ee] bg-white text-[#58423a] hover:border-[#ff7a45]"
    }`;

  return (
    <Modal onClose={onCancel}>
      <div className="relative p-6 sm:p-7">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close custom time picker"
          className="absolute right-5 top-5 rounded-full p-1 text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#58423a]"
        >
          <X size={20} />
        </button>

        <h2 className="mt-2 text-2xl font-bold">Select Custom Time</h2>
        <p className="mt-1 text-sm text-[#6b7280]">
          Working hours 11:00 AM – 11:00 PM · latest start 9:00 PM
        </p>

        <div className="mt-5 rounded-xl bg-[#fff8f4] p-4 text-center">
          <span className="text-3xl font-bold tracking-[-.64px] text-[#181c20]">
            {minutesToMeridiem(draftMinutes)}
          </span>
        </div>

        <h3 className="mt-5 text-sm font-semibold">Hour</h3>
        <div className="mt-2 grid grid-cols-6 gap-2">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
            <button
              key={hour}
              type="button"
              onClick={() => setHour12(hour)}
              aria-pressed={hour12 === hour}
              className={optionClass(hour12 === hour)}
            >
              {hour}
            </button>
          ))}
        </div>

        <h3 className="mt-5 text-sm font-semibold">Minute</h3>
        <div className="mt-2 grid grid-cols-6 gap-2">
          {Array.from({ length: 60 / MINUTE_STEP }, (_, i) => i * MINUTE_STEP).map(
            (value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMinute(value)}
                aria-pressed={minute === value}
                className={optionClass(minute === value)}
              >
                {String(value).padStart(2, "0")}
              </button>
            ),
          )}
        </div>

        <h3 className="mt-5 text-sm font-semibold">AM / PM</h3>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {["AM", "PM"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMeridiem(option)}
              aria-pressed={meridiem === option}
              className={optionClass(meridiem === option)}
            >
              {option}
            </button>
          ))}
        </div>

        {!valid && (
          <p className="mt-4 text-sm text-[#c52d39]" role="alert">
            Please choose a start time between 11:00 AM and 9:00 PM.
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[#ff7a45] px-5 py-3 font-semibold text-[#a73a05] transition hover:bg-[#fff1ea]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(draftMinutes)}
            disabled={!valid}
            className="flex-1 rounded-xl bg-[#ff7a45] px-5 py-3 font-semibold text-white transition hover:bg-[#e86632] disabled:opacity-60"
          >
            Confirm Time
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function ReserveView({ tables, reservations }) {
  const router = useRouter();
  const ds = days();
  const [day, setDay] = useState(0);
  const [time, setTime] = useState("7:00 PM");
  const [custom, setCustom] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sel, setSel] = useState(null);
  const [guestCount, setGuestCount] = useState(2);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();
  const times = ["11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM", "7:00 PM"];
  const visible = useMemo(
    () =>
      tables.map((table) => ({
        ...table,
        booked: tableIsBooked(table, ds[day], time, reservations),
      })),
    [day, reservations, tables, time, ds],
  );

  const selectFixedTime = (option) => {
    setCustom(false);
    setTime(option);
  };

  const confirmCustomTime = (minutes) => {
    if (
      !Number.isInteger(minutes) ||
      minutes < WORK_OPEN_MINUTES ||
      minutes > MAX_START_MINUTES
    ) {
      return;
    }
    setCustom(true);
    setTime(minutesToMeridiem(minutes));
    setPickerOpen(false);
  };

  const confirmReservation = () => {
    setError("");
    setSuccess("");
    const startMinutes = timeToMinutes(time);
    const endMinutes = startMinutes + RESERVATION_DURATION_MINUTES;

    if (startMinutes < WORK_OPEN_MINUTES || endMinutes > WORK_CLOSE_MINUTES) {
      setError("Please choose a time within the restaurant's working hours.");
      return;
    }

    const formatTime = (minutes) => minutesToTime24(minutes);

    startTransition(async () => {
      const result = await createReservation({
        tableId: sel.id,
        reservationDate: dateKey(ds[day]),
        startTime: formatTime(startMinutes),
        endTime: formatTime(endMinutes),
        guestCount,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSel(null);
      setSuccess("Reservation confirmed!");
      router.refresh();
    });
  };

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <h1 className="text-2xl font-bold sm:text-[32px]">Reserve a Table</h1>

        <section className="mt-8">
          <h2 className="text-sm font-semibold">Select Date</h2>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {ds.map((date, index) => (
              <button
                key={index}
                onClick={() => setDay(index)}
                className={`h-20 w-16 shrink-0 rounded-xl border text-center ${index === day ? "border-[#ff7a45] bg-[#ff7a45] text-white shadow-[0_4px_10px_rgba(255,122,69,.2)]" : "border-[#e5e8ee] bg-white text-[#58423a]"}`}
              >
                <div className="text-xs">
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div className="mt-1 text-2xl font-bold">{date.getDate()}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-7">
          <h2 className="text-sm font-semibold">Select Time</h2>
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-2">
            {times.map((option) => (
              <button
                key={option}
                onClick={() => selectFixedTime(option)}
                className={`shrink-0 rounded-lg border px-4 py-2.5 text-sm font-semibold sm:px-6 ${!custom && time === option ? "border-[#ff7a45] bg-[#ff7a45] text-white" : "border-[#e5e8ee] bg-white text-[#58423a]"}`}
              >
                {option}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className={`shrink-0 rounded-lg border px-4 py-2.5 text-sm font-semibold sm:px-6 ${custom ? "border-[#ff7a45] bg-[#ff7a45] text-white" : "border-[#e5e8ee] bg-white text-[#58423a]"}`}
            >
              {custom ? `Custom · ${time}` : "Select Other's Time"}
            </button>
          </div>
        </section>

        {pickerOpen && (
          <CustomTimePicker
            initialMinutes={timeToMinutes(time)}
            onConfirm={confirmCustomTime}
            onCancel={() => setPickerOpen(false)}
          />
        )}

        {success && (
          <p
            className="mt-6 rounded-lg bg-[#eaf7ea] px-4 py-3 text-sm font-medium text-[#34803a]"
            role="status"
          >
            {success}
          </p>
        )}

        <div className="mt-8 flex gap-6 text-sm">
          <span className="flex items-center gap-2">
            <i className="h-3 w-3 rounded-full bg-[#4caf50]" />
            Available
          </span>
          <span className="flex items-center gap-2">
            <i className="h-3 w-3 rounded-full bg-[#e63946]" />
            Booked
          </span>
        </div>

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((table) => (
            <button
              key={table.id}
              disabled={table.booked}
              onClick={() => setSel(table)}
              className={`min-h-31.5 rounded-xl border p-4.5 text-left ${table.booked ? "border-[#f2d3d5] bg-[#fffafa] opacity-80" : "border-[#d8e8d9] bg-white hover:border-[#ff7a45]"}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold">Table {table.number}</h3>
                </div>
                <span
                  className={`rounded-md px-2 py-1 text-xs ${table.booked ? "bg-[#fde9ea] text-[#c52d39]" : "bg-[#eaf7ea] text-[#34803a]"}`}
                >
                  {table.booked ? "Booked" : "Available"}
                </span>
              </div>

              <p className="mt-3 text-sm text-[#58423a]">Seats: {table.seats}</p>

              <p className="mt-1 text-xs text-[#6b7280]">{table.zone}</p>
            </button>
          ))}
        </section>
      </main>

      <Footer />

      {sel && (
        <Modal onClose={() => setSel(null)}>
          <div className="relative p-8">
            <button
              type="button"
              onClick={() => setSel(null)}
              aria-label="Close reservation confirmation"
              className="absolute right-5 top-5 rounded-full p-1 text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#58423a]"
            >
              <X size={20} />
            </button>

            <h2 className="mt-2 text-2xl font-bold">Confirm Reservation</h2>

            <div className="mt-5 rounded-xl bg-[#fafafa] p-4">
              <div className="font-semibold">Table {sel.number}</div>
              <div className="mt-1 text-sm text-[#6b7280]">
                {sel.seats} seats · {sel.zone}
              </div>
              <div className="mt-1 text-sm text-[#6b7280]">
                {ds[day].toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                · {time}
              </div>
            </div>

            <label className="mt-5 block text-sm font-semibold">Party Size</label>

            <select
              value={guestCount}
              onChange={(event) => setGuestCount(Number(event.target.value))}
              className="mt-2 w-full rounded-lg border border-[#dfe3e8] p-3"
            >
              {[2, 3, 4, 5, 6].map((count) => (
                <option key={count} value={count}>
                  {count} guests
                </option>
              ))}
            </select>

            {error && (
              <p className="mt-3 text-sm text-[#c52d39]" role="alert">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={confirmReservation}
              disabled={isPending}
              className="mt-7 block w-full rounded-xl bg-[#ff7a45] py-4 text-center font-semibold text-white disabled:opacity-60"
            >
              {isPending ? "Confirming..." : "Confirm Reservation"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}