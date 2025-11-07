import Link from "next/link";

export default async function OrdenConfirmadaPage(
  props: { searchParams: Promise<{ orderId?: string }> }
) {
  const sp = await props.searchParams;           // 👈 await al Promise
  const orderId = sp.orderId ?? "";

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-rose-600">¡Gracias por tu compra! 💛</h1>
      <p className="mt-2 text-neutral-700">
        Hemos enviado la confirmación a tu correo.
        {orderId ? <> Tu folio es <b>#{orderId}</b>.</> : null}
      </p>

      <div className="mt-6 flex gap-4">
        <Link href="/catalogo" className="btn-dv">Seguir comprando</Link>
        <Link href="/" className="text-rose-600 hover:underline">Ir al inicio</Link>
      </div>
    </main>
  );
}
