export default function Hero() {
  return (
    <main className="hero-bg">
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-rose-600">Dulce Vainilla 🍪</h1>
        <p className="mt-2 text-neutral-600">
          Repostería artesanal con amor — galletas NY, cheesecakes y cupcakes.
        </p>

        <div className="mt-10 flex items-center justify-center gap-10">
          <img src="/characters/cookie.png" alt="cookie" className="w-16 sm:w-20 animate-dv-float" />
          <img src="/characters/pie.png" alt="pie" className="w-16 sm:w-20 animate-dv-bounce-slow" />
        </div>
      </section>
    </main>
  );
}