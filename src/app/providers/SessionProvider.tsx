"use client";

import { SessionProvider as NextAuthProvider } from "next-auth/react";
import { CartProvider } from "../context/CartContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthProvider>
      <CartProvider>{children}</CartProvider>
    </NextAuthProvider>
  );
}
