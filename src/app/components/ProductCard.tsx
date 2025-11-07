"use client";

import Image from "next/image";
import { useCart } from "../context/CartContext";

type Props = {
  id: string;
  title: string;
  price: number;
  image: string;
  badge?: string;
};

export default function ProductCard({ id, title, price, image, badge }: Props) {
  const { addToCart } = useCart();

  return (
    <article className="rounded-2xl border border-rose-100 bg-white/70 p-5 shadow-sm dv-hover-card">
      <div className="relative">
        {badge && (
          <span className="absolute left-2 top-2 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-600">
            {badge}
          </span>
        )}
        <div className="aspect-square w-full grid place-items-center rounded-xl bg-rose-50 overflow-hidden">
          <Image
            src={image}
            alt={title}
            width={220}
            height={220}
            className="h-40 w-40 object-contain"
            priority={false}
          />
        </div>
      </div>

      <h3 className="mt-4 text-center font-semibold">{title}</h3>
      <p className="text-center text-sm text-neutral-600">
        {price.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
      </p>

      <button
        className="btn-dv mt-3 w-full"
        onClick={() => addToCart({ id, title, price, image })}
      >
        Agregar
      </button>
    </article>
  );
}