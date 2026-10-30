"use client";
import { LockKeyhole, Plus } from "lucide-react";
import MenuImage from "./MenuImage";

export default function FoodCard({ item, guest, onOpen, onAdd, onCustomize }) {
  // item img, name, price, description
  const cardContent = (
    <>
      <MenuImage src={item.image} alt={item.name} className="h-56 w-full" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-semibold leading-7 text-[#181c20]">
            {item.name}
          </h3>
          <span className="shrink-0 text-xl font-bold leading-7 text-[#ff7a45]">
            ${item.price.toFixed(2)}
          </span>
        </div>
        <p className="mt-2 min-h-10 text-sm leading-5 text-[#58423a]">
          {item.description}
        </p>
      </div>
    </>
  );

  return (
    <article className="overflow-hidden rounded-2xl border border-transparent bg-white shadow-[0_1px_2px_rgba(0,0,0,.03)] transition-[border-color,box-shadow] hover:border-[#ff7a45]/40 hover:shadow-[0_8px_24px_-8px_rgba(255,122,69,0.35),0_3px_10px_rgba(0,0,0,0.06)]">
      {/* card click funtionality */}
      {guest ? (
        <div>{cardContent}</div>
      ) : (
        <button
          className="block w-full text-left"
          onClick={() => onOpen(item)}
        >
          {cardContent}
        </button>
      )}

      {/* lock icon when guest view */}
      {guest ? (
        <div className="px-5 pb-5 pt-0">
          <div className="flex justify-end">
            <span
              aria-label="Sign in to order"
              title="Sign in to order"
              className="grid h-12 w-12 place-items-center rounded-full bg-[#e5e8ee] text-[#58423a]"
            >
              <LockKeyhole size={18} strokeWidth={1.8} />
            </span>
          </div>
        </div>
      ) :
      // customize & + icon when login
      (
        <div className="px-5 pb-5 pt-0">
          <div className="flex justify-end">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onCustomize(item)}
                title={`Customize ${item.name}`}
                className="rounded-full border border-[#ff7a45] px-5 py-2 text-sm font-semibold text-[#a73a05] transition hover:-translate-y-0.5 hover:bg-[#fff1ea] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a45] focus-visible:ring-offset-2"
              >
                Customize
              </button>
              <button
                onClick={() => onAdd(item)}
                aria-label={`Add ${item.name} to cart`}
                title={`Add ${item.name} to cart`}
                className="group grid h-12 w-12 place-items-center rounded-full bg-[#ff7a45] text-2xl text-white transition hover:-translate-y-0.5 hover:bg-[#e86632] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a45] focus-visible:ring-offset-2"
              >
                <Plus
                  size={22}
                  strokeWidth={2}
                  className="transition-transform group-hover:rotate-90"
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
