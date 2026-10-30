"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { payOrder } from "@/app/orders/actions";

export default function ReceiptView({ receipt, error }) {
  const router = useRouter();
  const receiptRef = useRef(null);
  const [paid, setPaid] = useState(receipt?.billStatus === "PAID");
  const [message, setMessage] = useState(error ?? "");
  const [isPending, startTransition] = useTransition();

  const isCancelled = receipt?.statusCode === "CANCELLED";

  const pay = () => {
    setMessage("");
    startTransition(async () => {
      const result = await payOrder(receipt.id);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setPaid(true);
      router.push("/orders");
    });
  };

  const downloadPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas-pro")).default;

    const element = receiptRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`receipt-${receipt.id}.pdf`);
  };

  if (!receipt) {
    return (
      <>
        <Header />
        <main className="px-4 py-12">
          <div className="mx-auto max-w-105 text-sm text-[#c52d39]" role="alert">
            {message || "Receipt not found."}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="px-4 py-12">
        <div className="mx-auto max-w-105">
          <div
            ref={receiptRef}
            className="rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,.06)] sm:p-8"
          >
            <div className="text-center">
              <div className="text-2xl font-extrabold text-[#a73a05]">Tawa & Taste</div>
              <p className="mt-1 text-xs text-[#6b7280]">From Our Tawa to Your Table</p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-5 text-center text-sm">
              <div>
                <div className="text-xs text-[#6b7280]">Table</div>
                <div className="mt-1 font-semibold">{receipt.tableNumber ?? "-"}</div>
              </div>
              <div>
                <div className="text-xs text-[#6b7280]">Order ID</div>
                <div className="mt-1 font-semibold">{receipt.id}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-[#6b7280]">Date & Time</div>
                <div className="mt-1 font-semibold">{receipt.placedAt}</div>
              </div>
            </div>

            <div className="my-8 border-t border-dashed border-[#cfc7c2]" />
            {receipt.items.map((item, index) => (
              <div key={`${item.name}-${index}`} className="mb-5 flex justify-between text-sm">
                <span>{item.qty}× {item.name}</span>
                <span>${item.subtotal.toFixed(2)}</span>
              </div>
            ))}

            <div className="my-6 border-t border-dashed border-[#cfc7c2]" />
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>${receipt.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>${receipt.tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-xl font-bold"><span>Total</span><span className="text-[#ff7a45]">${receipt.total.toFixed(2)}</span></div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <button
              onClick={downloadPdf}
              className="w-full rounded-xl border border-[#ff7a45] bg-white py-3 font-semibold text-[#a73a05]"
            >
              Download PDF
            </button>
            {message && <p className="text-sm text-[#c52d39]" role="alert">{message}</p>}
            {!paid && !isCancelled ? (
              <button
                onClick={pay}
                disabled={isPending}
                className="w-full rounded-xl bg-[#ff7a45] py-3 font-semibold text-white disabled:opacity-60"
              >
                {isPending ? "Processing..." : "Pay Now"}
              </button>
            ) : (
              <div
                className={`rounded-xl p-3 text-center text-sm font-semibold ${
                  isCancelled
                    ? "bg-red-50 text-red-700"
                    : "bg-[#eaf7ea] text-[#34803a]"
                }`}
              >
                {isCancelled ? "Order Cancelled" : "Payment completed — Paid"}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}