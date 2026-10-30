"use client";

export default function CategoryTabs({ value, onChange, categories }) {
  return (
    <div className="sticky top-18.5 z-30 overflow-x-auto border-b border-[#eee] bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-w-max w-full max-w-7xl gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4 lg:px-8">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold tracking-[.14px] transition sm:px-6 ${value === c ? "bg-[#ff7a45] text-white shadow-[0_4px_6px_rgba(255,122,69,.25)]" : "bg-[#e5e8ee] text-[#58423a]"}`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
