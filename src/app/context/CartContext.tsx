"use client";

import React, { createContext, useContext, useState } from "react";

type CartItem = {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  decrement: (id: string) => void;
  removeLine: (id: string) => void;
  clear: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCart(prev => {
      const found = prev.find(x => x.id === item.id);
      if (found) {
        return prev.map(x =>
          x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // ↓↓↓ resta UNA unidad; si llega a 0, elimina la línea
  const decrement = (id: string) => {
    setCart(prev =>
      prev.flatMap(x =>
        x.id !== id ? [x] : x.quantity > 1 ? [{ ...x, quantity: x.quantity - 1 }] : []
      )
    );
  };

  // ↓↓↓ elimina TODA la línea (todas las unidades)
  const removeLine = (id: string) => {
    setCart(prev => prev.filter(x => x.id !== id));
  };

  const clear = () => setCart([]);

  const total = cart.reduce((s, x) => s + x.price * x.quantity, 0);
  const count = cart.reduce((s, x) => s + x.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, decrement, removeLine, clear, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}