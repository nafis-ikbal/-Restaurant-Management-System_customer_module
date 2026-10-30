"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import Modal from "./Modal";

export default function TableGrid({ guest = false, tables }) {
  const [selected, setSelected] = useState(null);
  const router = useRouter();
  return (
    <>
      <Header guest={guest} />

      {/* guest view login alert */}
      {guest && (
        <div className="border-b border-[#dfc0b5] bg-[#fff1ea]">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
            <span className="text-sm text-[#58423a]">
              Log in to reserve a table
            </span>
            <Link
              href="/login"
              className="shrink-0 rounded-full bg-[#a73a05] px-4 py-1.5 text-xs font-medium text-white"
            >
              Login
            </Link>
          </div>
        </div>
      )}

      {/* main table page */}
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-[32px]">
              {guest ? "Current Table Availability" : "Table Availability"}
            </h1>
            <p className="mt-2 max-w-2xl text-base text-[#58423a]">
              Check which tables are available and choose a suitable table for
              your visit.
            </p>
          </div>
          {/* for home page (reserve table button) */}
          {!guest && (
            <Link
              href="/reserve"
              className="rounded-lg bg-[#ff7a45] px-6 py-2.5 text-sm font-semibold text-white"
            >
              Reserve a Table
            </Link>
          )}
        </div>

        {/* status indicator */}
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

        {/* table card */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tables.map((t) => (
            <button
              key={t.id}
              disabled={guest || t.booked}
              onClick={() => setSelected(t)}
              className={`min-h-54.25 rounded-xl border p-4 text-left shadow-[0_2px_8px_rgba(0,0,0,.04)] transition sm:p-6 ${t.booked ? "border-[#f0d4d4] bg-[#fffafa]" : "border-[#d8e8d9] bg-white hover:border-[#ff7a45]"}`}
            >
              <div className="flex justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold">Table {t.number}</h3>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${t.booked ? "bg-[#fde9ea] text-[#c52d39]" : "bg-[#eaf7ea] text-[#34803a]"}`}
                >
                  {t.booked ? "Booked" : "Available"}
                </span>
              </div>

              <div className="mt-10 text-sm text-[#58423a]">
                Seats: {t.seats}
              </div>

              <div className="mt-2 text-sm text-[#6b7280]">Zone: {t.zone}</div>

              <div className="mt-8 border-t pt-3 text-sm text-[#6b7280]">
                {t.booked ? "Currently unavailable" : "Select table"}
              </div>
            </button>
          ))}
        </div>
      </main>

      <Footer />

      {selected && (
        <Modal onClose={() => setSelected(null)}>
          <div className="relative p-7">
            <button
              onClick={() => setSelected(null)}
              aria-label="Close table details"
              title="Close"
              className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-[#ff7a45] text-white shadow transition hover:bg-[#e86632]"
            >
              <X size={21} strokeWidth={1.8} />
            </button>
            <div className="mx-auto h-1.5 w-12 rounded-full bg-[#d8d8d8]" />
            <h2 className="mt-8 text-2xl font-bold">Table {selected.number}</h2>
            <p className="mt-2 text-[#58423a]">
              {selected.seats} seats · {selected.zone}
            </p>
            <p className="mt-2 text-sm text-[#6b7280]">
              Confirm this available table.
            </p>
            <button
              onClick={() => {
                setSelected(null);
                router.push("/reserve");
              }}
              className="mt-8 w-full rounded-xl bg-[#ff7a45] py-4 font-semibold text-white"
            >
              Reserve this table
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
