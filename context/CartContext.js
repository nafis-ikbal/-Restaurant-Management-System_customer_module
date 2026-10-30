"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import CartDrawer from "@/components/CartDrawer";
import { createOrder } from "@/app/orders/actions";

const CartContext = createContext(null);

export function CartProvider({ children, guest = false }) {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [isCheckoutPending, startCheckout] = useTransition();

  const add = (item) =>
    setCart((c) => {
      const i = c.findIndex(
        (x) => x.id === item.id && !!x.customized === !!item.customized,
      );
      if (i < 0) return [...c, { ...item, qty: item.qty || 1 }];
      const n = [...c];
      n[i] = { ...n[i], qty: n[i].qty + (item.qty || 1) };
      return n;
    });

  const onCheckout = () => {
    setCheckoutError("");
    startCheckout(async () => {
      const result = await createOrder(cart);
      if (!result.ok) {
        setCheckoutError(result.error);
        return;
      }
      setCartOpen(false);
      setCart([]);
      router.push("/orders");
    });
  };

  const closeCart = () => setCartOpen(false);
  const openCart = () => setCartOpen(true);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount: cart.length,
        cartOpen,
        openCart,
        closeCart,
        add,
        checkoutError,
        isCheckoutPending,
        onCheckout,
      }}
    >
      {children}
      {!guest && cartOpen && (
        <CartDrawer
          items={cart}
          onClose={closeCart}
          error={checkoutError}
          pending={isCheckoutPending}
          onCheckout={onCheckout}
        />
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}