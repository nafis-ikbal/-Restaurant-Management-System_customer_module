"use client";
import { useMemo, useState } from "react";
import { X } from "lucide-react";
import Modal from "./Modal";
import MenuImage from "./MenuImage";

export default function CustomizeModal({ item, onClose, onAdd }) {
  const groups = useMemo(() => item.customizationGroups ?? [], [item.customizationGroups]);
  const [selected, setSelected] = useState(() => {
    const initial = {};
    for (const group of groups) {
      if (group.isRequired && group.options[0]) initial[group.name] = group.options[0].name;
    }
    return initial;
  });
  const [qty, setQty] = useState(1);
  const total = useMemo(() => {
    let x = item.price;
    Object.entries(selected).forEach(([g, v]) => {
      const group = groups.find((candidate) => candidate.name === g);
      const option = group?.options.find((candidate) => candidate.name === v);
      if (option) x += option.priceDelta;
    });
    return x * qty;
  }, [groups, item, qty, selected]);
  const pick = (group, option) =>
    setSelected((current) => ({ ...current, [group.name]: option.name }));

  return (
    <Modal onClose={onClose} wide>
      <div className="p-6">
        {/* img er uporer part */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Customize Your {item.name.includes("Pizza") ? "Pizza" : "Meal"}
            </h2>
            <p className="mt-1 text-sm text-[#6b7280]">
              Personalize your order.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close customization"
            title="Close"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#ff7a45] text-white shadow transition hover:bg-[#e86632]"
          >
            <X size={21} strokeWidth={1.8} />
          </button>
        </div>

        <MenuImage src={item.image} alt="" className="mt-5 h-44 w-full rounded-xl" />

        {groups.map((group) => (
          <section key={group.id} className="mt-5">
            <h3 className="mb-3 font-semibold">{group.name}</h3>
            <div className="flex flex-wrap gap-2">
              {group.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => pick(group, option)}
                  className={`rounded-full border px-4 py-2 text-sm ${selected[group.name] === option.name ? "border-[#ff7a45] bg-[#ff7a45] text-white" : "border-[#dfe3e8] bg-[#f6f7f8] text-[#58423a]"}`}
                >
                  {option.name}
                  {option.priceDelta ? ` +$${option.priceDelta.toFixed(2)}` : ""}
                  {selected[group.name] === option.name ? " ✓" : ""}
                </button>
              ))}
            </div>
          </section>
        ))}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#eee] pt-5">
          <div className="flex items-center rounded-full bg-[#e5e8ee]">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="h-10 w-10"
            >
              -
            </button>
            <span className="w-8 text-center font-semibold">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="h-10 w-10">
              +
            </button>
          </div>
          <div className="text-lg font-bold">${total.toFixed(2)}</div>
          <button
            onClick={() => {
              onAdd({
                ...item,
                price: total / qty,
                customized: true,
                qty,
                customizations: groups
                  .map((group) => {
                    const name = selected[group.name];
                    return group.options.find((option) => option.name === name);
                  })
                  .filter(Boolean)
                  .map((option) => ({
                    optionId: option.id,
                    optionName: option.name,
                    priceDelta: option.priceDelta,
                  })),
              });
              onClose();
            }}
            className="rounded-xl bg-[#ff7a45] px-5 py-3 font-semibold text-white"
          >
            Add to Order
          </button>
        </div>
      </div>
    </Modal>
  );
}
