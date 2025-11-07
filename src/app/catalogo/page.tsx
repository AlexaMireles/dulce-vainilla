// src/app/catalogo/page.tsx
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";
import { products } from "../data/products";

export const metadata = {
  title: "Catálogo | Dulce Vainilla",
};

export default function CatalogoPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-center text-3xl font-bold text-rose-500">Catálogo</h1>
      <p className="mt-1 text-center text-sm text-neutral-600">
        Explora nuestras galletas NY, cheesecakes y cupcakes.
      </p>

      <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, idx) => (
          <Reveal key={p.id} delay={idx * 120}>
            <ProductCard
              id={p.id}           
              title={p.name}
              price={p.price}
              image={p.image}
              badge={p.badge}
            />
          </Reveal>
        ))}
      </section>
    </main>
  );
}