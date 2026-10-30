"use client";
import { Clock3, Plus, X } from "lucide-react";
import Modal from "./Modal";
import MenuImage from "./MenuImage";

export default function FoodModal({ item, onClose, onAdd, onCustomize }) {
  return (
    <Modal onClose={onClose}>
      <div className="relative">
        <MenuImage src={item.image} alt={item.name} className="h-64 w-full rounded-t-2xl" />
        <button
          onClick={onClose}
          aria-label="Close food details"
          title="Close"
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-[#58423a] shadow transition hover:bg-white"
        >
          <X size={21} strokeWidth={1.8} />
        </button>
      </div>

      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a73a05]">
              {item.category}
            </p>
            <h2 className="mt-1 text-2xl font-bold leading-tight text-[#181c20]">
              {item.name}
            </h2>
          </div>
          <span className="shrink-0 text-xl font-bold text-[#ff7a45]">
            ${item.price.toFixed(2)}
          </span>
        </div>
        <p className="mt-4 leading-6 text-[#58423a]">{item.description}</p>

        <div className="mt-6 grid gap-3 rounded-xl bg-[#fff8f4] p-4 sm:grid-cols-[1fr_auto]">
          <div>
            <h3 className="text-sm font-semibold text-[#181c20]">Ingredients</h3>
            <p className="mt-1 text-sm leading-5 text-[#58423a]">
              {item.ingredients?.join(" · ")}
            </p>
          </div>
          <div className="flex items-start gap-2 text-sm text-[#58423a] sm:justify-self-end">
            <Clock3 size={17} className="mt-0.5 text-[#ff7a45]" />
            <span>
              <strong className="block text-[#181c20]">Preparation</strong>
              {item.preparationTime}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          {item.buildable && (
            <button
              onClick={() => onCustomize(item)}
              className="flex-1 rounded-xl border border-[#ff7a45] px-5 py-3 font-semibold text-[#a73a05] transition hover:bg-[#fff1ea]"
            >
              Customize
            </button>
          )}
          <button
            onClick={() => onAdd(item)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#ff7a45] px-5 py-3 font-semibold text-white transition hover:bg-[#e86632]"
          >
            <Plus size={19} strokeWidth={2.4} />
            Add to order
          </button>
        </div>
      </div>
    </Modal>
  );
}
