"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cancelOrder } from "@/app/orders/actions";
import Header from "./Header";
import Footer from "./Footer";

const stageCodes = ["PLACED", "IN_KITCHEN", "READY", "SERVED"];
const stages = ["Placed", "In Kitchen", "Ready", "Served"];

export default function OrdersView({ orders, error }) {
  const router = useRouter();
  const [cancelledIds, setCancelledIds] = useState([]);
  const [cancelError, setCancelError] = useState("");
  const [isCancelling, startCancel] = useTransition();

  const cancel = (order) => {
    setCancelError("");
    startCancel(async () => {
      const result = await cancelOrder(order.id);
      if (!result.ok) {
        setCancelError(result.error);
        return;
      }
      setCancelledIds((ids) => [...ids, order.id]);
      router.refresh();
    });
  };

  return (
    <>
      <Header />

      <main className="mx-auto max-w-180 px-4 py-8">
        <h1 className="text-2xl font-bold sm:text-[32px]">My Orders</h1>

        <div className="mt-8 space-y-5">
          {error && <p className="text-sm text-[#c52d39]" role="alert">{error}</p>}
          {cancelError && <p className="text-sm text-[#c52d39]" role="alert">{cancelError}</p>}
          {!error && !orders.length && (
            <p className="text-sm text-[#6b7280]">You have no orders yet.</p>
          )}
          {orders.map((o) => {
            const isCancelled = cancelledIds.includes(o.id);
            const topCode = isCancelled ? "CANCELLED" : o.statusCode;
            const topLabel = isCancelled ? "Cancelled" : o.status;
            const currentIndex = stageCodes.indexOf(o.operationalStatus);
            return (
              <article
                key={o.id}
                className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,.05)]"
              >
                {/* order id & top status */}
                <div className="flex justify-between gap-3">
                  <div>
                    <div className="font-semibold">{o.id}</div>
                    <div className="mt-1 text-xs text-[#6b7280]">{o.date}</div>
                  </div>
                  <span
                    className={`flex items-center rounded-full px-3 py-1 text-xs font-semibold ${topCode === "PAID" ? "bg-[#eaf7ea] text-[#34803a]" : "bg-[#fff1ea] text-[#a73a05]"}`}
                  >
                    {topLabel}
                  </span>
                </div>

                {/* operational stages */}
                <div className="mt-6 grid grid-cols-4 gap-1">
                  {stages.map((s, j) => {
                    const active = currentIndex >= 0 && j <= currentIndex;
                    return (
                      <div key={s} className="text-center">
                        <div
                          className={`mx-auto h-6 w-6 rounded-full border-2 ${active ? "border-[#ff7a45] bg-[#ff7a45]" : "border-[#d1d5db] bg-white"}`}
                        >
                          {active && (
                            <span className="text-xs text-white">✓</span>
                          )}
                        </div>
                        <div
                          className={`mt-2 break-words text-[10px] leading-tight ${j === currentIndex ? "font-bold text-[#181c20]" : "text-[#6b7280]"}`}
                        >
                          {s}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* order items */}
                <div className="mt-6 space-y-2 border-t border-[#eee] pt-4">
                  {o.items.map((x, j) => (
                    <div key={j} className="flex justify-between text-sm">
                      <span>
                        {x.qty}× {x.name}
                      </span>
                      <span>${(x.qty * x.price).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 font-bold">
                    <span>Total</span>
                    <span className="text-[#ff7a45]">
                      ${o.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* buttons */}
                <div className="mt-4 flex justify-end">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/receipt?id=${encodeURIComponent(o.id)}`}
                      className="rounded-lg border border-[#ff7a45] px-4 py-2 text-sm font-semibold text-[#a73a05]"
                    >
                      View Receipt
                    </Link>
                    {topCode === "PLACED" && (
                      <button
                        onClick={() => cancel(o)}
                        disabled={isCancelling}
                        className="rounded-lg border border-[#ff7a45] px-4 py-2 text-sm font-semibold text-[#a73a05] disabled:opacity-60"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}
