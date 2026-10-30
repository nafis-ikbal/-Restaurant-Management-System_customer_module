"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function CartDrawer({ items, onClose, onCheckout, error, pending }) {
  const router = useRouter();
  const total = items.reduce((s, x) => s + x.price * x.qty, 0);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-title"
      className="fixed inset-0 z-50 bg-black/30"
    >
      <aside className="ml-auto flex h-full w-full max-w-md flex-col bg-white p-6 shadow-2xl">
        <div className="flex shrink-0 items-center justify-between">
          <h2 id="cart-title" className="text-2xl font-bold">
            Your Cart
          </h2>
          <button
            onClick={onClose}
            aria-label="Close cart"
            title="Close"
            className="grid h-10 w-10 place-items-center rounded-full bg-[#ff7a45] text-white shadow transition hover:bg-[#e86632]"
          >
            <X size={21} strokeWidth={1.8} />
          </button>
        </div>

        {/*  item which addd to cart */}
        <div className="mt-6 min-h-0 flex-1 space-y-4 overflow-y-auto">
          {items.length ? (
            items.map((x, i) => (
              <div
                key={i}
                className="flex justify-between border-b border-[#eee] pb-3"
              >
                <div>
                  <div className="font-semibold">
                    {x.qty}× {x.name}
                  </div>
                  {x.customized && (
                    <div className="text-xs text-[#6b7280]">Customized</div>
                  )}
                </div>
                <span>${(x.price * x.qty).toFixed(2)}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#6b7280]">Your cart is empty.</p>
          )}
        </div>

        {/* total & order button */}
        <div className="mt-8 shrink-0">
          {items.length > 0 && (
            <>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              {error && <p className="mt-3 text-sm text-[#c52d39]" role="alert">{error}</p>}
            </>
          )}
          <button
            onClick={() => {
              if (items.length > 0) onCheckout();
              else {
                onClose();
                router.push("/orders");
              }
            }}
            disabled={pending}
            className="mt-4 w-full rounded-xl bg-[#ff7a45] py-3 font-semibold text-white"
          >
            {pending ? "Creating Order..." : "Go to My Orders"}
          </button>
        </div>
      </aside>
    </div>
  );
}
