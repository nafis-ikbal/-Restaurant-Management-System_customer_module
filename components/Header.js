"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Header({ guest = false }) {
  const pathname = usePathname();
  const isTablesPage = pathname?.endsWith("/tables");
  const { cartCount, openCart } = useCart();

  return (
    <header className="sticky top-0 z-40 h-18.5 bg-white shadow-[0_1px_1px_rgba(0,0,0,.05)]">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* home button */}
        <Link
          href={guest ? "/guest" : "/home"}
          className="text-[24px] font-extrabold tracking-[-.24px] text-[#a73a05]"
        >
          Tawa & Taste
        </Link>

        <div className="flex items-center gap-3">
          {/* cart button */}
          {!guest && (
            <button
              onClick={openCart}
              aria-label="Cart"
              title="Cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#58423a] transition hover:bg-[#f5f5f5]"
            >
              <ShoppingCart size={24} strokeWidth={1.8} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#ff7a45] px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* table button */}
          {!isTablesPage && (
            <Link
              href={guest ? "/guest/tables" : "/tables"}
              aria-label="Tables"
              title="View tables"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#58423a] transition hover:bg-[#f5f5f5]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="2em" height="2em"><path fill="currentColor" d="M4.325 9h15.35l-.85-3H5.2zM16.8 11H7.225l-.275 2h10.1zM4 20l1.225-9h-3.55l2-7h16.65l2 7H18.8l1.2 9h-2l-.675-5H6.675L6 20z"/></svg>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
