"use client";
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Header from "./Header";
import Footer from "./Footer";
import CategoryTabs from "./CategoryTabs";
import FoodCard from "./FoodCard";
import FoodModal from "./FoodModal";
import CustomizeModal from "./CustomizeModal";
import { useCart } from "@/context/CartContext";

export default function CustomerMenu({ guest = false, menuItems, categories }) {
  const [cat, setCat] = useState("Starters");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const [custom, setCustom] = useState(null);
  const [checkoutError, setCheckoutError] = useState("");
  const [isCheckoutPending, startCheckout] = useTransition();

  const { cart, add, closeCart, checkoutError: ctxError, isCheckoutPending: ctxPending, onCheckout: ctxOnCheckout, openCart } = useCart();

  const filtered = useMemo(
    () =>
      menuItems.filter(
        (x) =>
          (cat === "All" || x.category === cat) &&
          x.name.toLowerCase().includes(q.toLowerCase()),
      ),
    [cat, q, menuItems],
  );

  return (
    <>
      <Header guest={guest} />

      {/* guest warning */}
      {guest && (
        <div className="border-b border-[#dfc0b5] bg-[#fff1ea]">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
            <span className="text-sm text-[#58423a]">
              You're browsing as a guest — sign up to place an order
            </span>

            <Link
              href="/signup"
              className="shrink-0 rounded-full bg-[#a73a05] px-4 py-1.5 text-xs font-medium text-white"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}

      {/* category tabs */}
      <CategoryTabs value={cat} onChange={setCat} categories={categories} />

      {/* main guest page */}
      <main className="mx-auto w-full max-w-7xl px-4 pb-8 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        {/* card er uporer part */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          {/* heading text */}
          <div>
            <h1 className="text-2xl font-bold tracking-[-.64px] sm:text-[32px]">
              Our Signature {cat === "All" ? "Dishes" : cat}
            </h1>
            <p className="mt-2 text-base text-[#58423a]">
              Expertly crafted dishes using traditional techniques and modern
              flair.
            </p>
          </div>

          {/* search items */}
          <div className="relative w-full sm:w-72">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search dishes..."
              className="w-full rounded-full border border-[#dfe3e8] bg-white px-5 py-3 text-sm outline-none focus:border-[#ff7a45]"
            />
          </div>
        </div>

        {/* card */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              guest={guest}
              onOpen={setOpen}
              onAdd={add}
              onCustomize={setCustom}
            />
          ))}
        </div>
        {/* if no item */}
        {!filtered.length && (
          <div className="py-20 text-center text-[#6b7280]">
            No dishes found.
          </div>
        )}
      </main>


      <Footer />

      {/* after login this will work on home page */}
      {/* when click any card */}
      {open && (
        <FoodModal
          item={open}
          onClose={() => setOpen(null)}
          onAdd={add}
          onCustomize={(i) => {
            setOpen(null);
            setCustom(i);
          }}
        />
      )}

      {/* open customize modal */}
      {custom && (
        <CustomizeModal
          item={custom}
          onClose={() => setCustom(null)}
          onAdd={add}
        />
      )}
    </>
  );
}