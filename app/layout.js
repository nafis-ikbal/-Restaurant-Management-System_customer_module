import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata = {
  title: "Tawa & Taste",
  description: "Restaurant Management System — Customer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
