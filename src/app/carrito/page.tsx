"use client";

import { useState } from "react";

/* ====== Configuración de entrega ====== */
const CITIES = [
  "Monterrey",
  "San Nicolás de los Garza",
  "San Pedro Garza García",
  "Guadalupe",
  "Apodaca",
  "General Escobedo",
  "Santa Catarina",
  "García",
];

const TIME_SLOTS = ["09:00–14:00", "14:00–19:00", "18:00–21:00"];

function getMinDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1); // mañana
  return d.toISOString().slice(0, 10);
}

// Envío por CP (centavos). Ajusta rangos y costos a tu gusto.
function calcularEnvio(cp: string) {
  if (!cp) return 0;
  if (/^64[0-9]{3}$/.test(cp)) return 8900;   // zona 1
  if (/^66[0-5][0-9]{2}$/.test(cp)) return 11900; // zona 2
  if (/^(67|68|65)[0-9]{3}$/.test(cp)) return 15900; // zona 3
  return 0;
}

export default function CarritoPage() {
  /* 🛒 Carrito (demo en centavos) */
  const [cart] = useState([{ title: "Caja de Galletas Vainilla", quantity: 1, price: 25000 }]);

  /* 👤 Cliente */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  /* 🎁 Destinatario */
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [cardMessage, setCardMessage] = useState("");

  /* 🚚 Entrega (solo domicilio) */
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(getMinDate());
  const [deliveryWindow, setDeliveryWindow] = useState(TIME_SLOTS[0]);

  /* 💵 Totales */
  const [shipping, setShipping] = useState(0);
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + shipping;

  /* UI */
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onPostalChange(cp: string) {
    setPostalCode(cp);
    setShipping(calcularEnvio(cp));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const today = new Date().toISOString().slice(0, 10);

      // Validaciones básicas
      if (!email || !name || !address) {
        setMsg("Completa nombre, correo y dirección.");
        setLoading(false);
        return;
      }
      if (!postalCode || !city || !deliveryDate || !deliveryWindow) {
        setMsg("Faltan datos de entrega (CP, municipio, fecha u horario).");
        setLoading(false);
        return;
      }
      if (!CITIES.includes(city)) {
        setMsg("El municipio no está dentro del área de entrega.");
        setLoading(false);
        return;
      }
      if (deliveryDate <= today) {
        setMsg("Las entregas se programan con 1 día de anticipación.");
        setLoading(false);
        return;
      }

      // Payload para la API (/api/orders)
      const payload = {
        customer: {
          email,
          name,
          phone,
          // concatenamos dirección con CP y municipio
          address: `${address} · CP ${postalCode || "s/n"} · ${city}, NL`,
        },
        recipient: {
          name: recipientName || undefined,
          phone: recipientPhone || undefined,
        },
        logistics: {
          postalCode,
          city,
          neighborhood,
          deliveryDate,
          deliveryWindow,
          deliveryType: "delivery" as const, // fijo
        },
        cardMessage: cardMessage || undefined,
        items: cart.map((i) => ({
          title: i.title,
          quantity: i.quantity,
          unitPrice: i.price, // ya en centavos
        })),
        notes: "", // si quieres, agrega más notas libres aquí
        shipping, // opcional si lo usas del lado del server
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Lo esencial que espera tu route (y lo nuevo para validar)
          customer: payload.customer,
          items: payload.items,
          shipping: shipping,
          notes: [
            payload.cardMessage && `Tarjeta: ${payload.cardMessage}`,
            `Tipo: Envío a domicilio`,
            `Municipio: ${city}`,
            `Entrega: ${deliveryDate} ${deliveryWindow}`,
            neighborhood && `Colonia/Refs: ${neighborhood}`,
            recipientName && `Destinatario: ${recipientName} (${recipientPhone || "s/tel"})`,
          ]
            .filter(Boolean)
            .join(" | "),
          deliveryDate,
          timeWindow: deliveryWindow,
          city,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo generar el pedido");

      window.location.href = `/orden-confirmada?orderId=${data.orderId}`;
    } catch (err: any) {
      setMsg(err.message || "Error al procesar el pedido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold text-rose-600">Carrito de compra</h1>

      {/* LISTA DE PRODUCTOS */}
      <div className="mt-6 bg-white rounded-2xl border p-4">
        {cart.map((item, idx) => (
          <div key={idx} className="flex justify-between py-2 border-b last:border-none">
            <span>{item.title}</span>
            <span>${(item.price / 100).toFixed(2)}</span>
          </div>
        ))}
        <div className="text-right mt-2 space-y-1">
          <p>Subtotal: ${(subtotal / 100).toFixed(2)}</p>
          <p>Envío: ${(shipping / 100).toFixed(2)}</p>
          <p className="text-lg font-bold">Total: ${(total / 100).toFixed(2)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* DATOS CLIENTE */}
        <section>
          <h2 className="font-semibold text-lg mb-2">Datos del cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="border rounded-lg px-3 py-2" placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="border rounded-lg px-3 py-2" type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="border rounded-lg px-3 py-2" placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input className="border rounded-lg px-3 py-2" placeholder="Dirección completa" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </section>

        {/* DATOS DEL DESTINATARIO (opcional) */}
        <section>
          <h2 className="font-semibold text-lg mb-2">Datos del destinatario (opcional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="border rounded-lg px-3 py-2" placeholder="Nombre del destinatario" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
            <input className="border rounded-lg px-3 py-2" placeholder="Teléfono del destinatario" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} />
          </div>
          <textarea className="border rounded-lg px-3 py-2 w-full mt-2" placeholder="Dedicatoria para la tarjeta (opcional)" value={cardMessage} onChange={(e) => setCardMessage(e.target.value)} rows={2} />
        </section>

        {/* ENTREGA (SOLO DOMICILIO) */}
        <section>
          <h2 className="font-semibold text-lg mb-2">Entrega a domicilio</h2>
          <p className="text-sm text-neutral-600 mb-2">Solo dentro del área metropolitana de Monterrey.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="border rounded-lg px-3 py-2" placeholder="Código postal" value={postalCode} onChange={(e) => onPostalChange(e.target.value)} />
            <select className="border rounded-lg px-3 py-2" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Selecciona municipio</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input className="border rounded-lg px-3 py-2" placeholder="Colonia / Referencias" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div>
              <label className="block text-sm mb-1">Fecha de entrega</label>
              <input type="date" className="border rounded-lg px-3 py-2 w-full" min={getMinDate()} value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} required />
              <p className="text-xs text-neutral-600 mt-1">Agenda con al menos 1 día de anticipación.</p>
            </div>
            <div>
              <label className="block text-sm mb-1">Horario</label>
              <select className="border rounded-lg px-3 py-2 w-full" value={deliveryWindow} onChange={(e) => setDeliveryWindow(e.target.value)}>
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* NOTAS */}
        <textarea className="border rounded-lg px-3 py-2 w-full" placeholder="Notas adicionales (opcional)" rows={2} onChange={(e) => setMsg(null)} />

        {/* ACCIONES */}
        {msg && <p className="text-rose-600 font-medium">{msg}</p>}
        <button disabled={loading} type="submit" className="bg-rose-600 text-white rounded-lg px-6 py-2 font-semibold hover:bg-rose-700 disabled:opacity-60">
          {loading ? "Procesando..." : "Confirmar pedido"}
        </button>
      </form>
    </main>
  );
}
