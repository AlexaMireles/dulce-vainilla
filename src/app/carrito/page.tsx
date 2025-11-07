"use client";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

/* ====== Configuración de entrega ====== */
const CITIES = [
  "Monterrey","San Nicolás de los Garza","San Pedro Garza García","Guadalupe",
  "Apodaca","General Escobedo","Santa Catarina","García",
];
const TIME_SLOTS = ["09:00–14:00", "14:00–19:00", "18:00–21:00"];

function getMinDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

// Envío en **centavos**
function calcularEnvio(cp: string) {
  if (!cp) return 0;
  if (/^64[0-9]{3}$/.test(cp)) return 8900;       // zona 1
  if (/^66[0-5][0-9]{2}$/.test(cp)) return 11900; // zona 2
  if (/^(67|68|65)[0-9]{3}$/.test(cp)) return 15900; // zona 3
  return 0;
}

export default function CarritoPage() {
  // 🛒 AHORA usamos el contexto (precios en PESOS, según tu CartContext)
  const { cart, total: subtotalPesos, decrement, removeLine, clear } = useCart();

  /* 👤 Cliente */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  /* 🎁 Destinatario */
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [cardMessage, setCardMessage] = useState("");

  /* 🚚 Entrega */
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(getMinDate());
  const [deliveryWindow, setDeliveryWindow] = useState(TIME_SLOTS[0]);

  /* 💵 Totales */
  const [shipping, setShipping] = useState(0); // en centavos
  const shippingPesos = shipping / 100;
  const totalFinal = subtotalPesos + shippingPesos;

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
      if (!email || !name || !address) throw new Error("Completa nombre, correo y dirección.");
      if (!postalCode || !city || !deliveryDate || !deliveryWindow)
        throw new Error("Faltan datos de entrega (CP, municipio, fecha u horario).");
      if (!CITIES.includes(city)) throw new Error("El municipio no está dentro del área de entrega.");
      if (deliveryDate <= today) throw new Error("Las entregas se programan con 1 día de anticipación.");
      if (cart.length === 0) throw new Error("Tu carrito está vacío.");

      // La API la alimentamos con precios en **centavos**
      const itemsForApi = cart.map(i => ({
        title: i.title,
        quantity: i.quantity,
        unitPrice: Math.round(i.price * 100), // convertir pesos → centavos
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            email, name, phone,
            address: `${address} · CP ${postalCode || "s/n"} · ${city}, NL`,
          },
          items: itemsForApi,
          shipping, // ya en centavos
          notes: [
            cardMessage && `Tarjeta: ${cardMessage}`,
            `Tipo: Envío a domicilio`,
            `Municipio: ${city}`,
            `Entrega: ${deliveryDate} ${deliveryWindow}`,
            neighborhood && `Colonia/Refs: ${neighborhood}`,
            recipientName && `Destinatario: ${recipientName} (${recipientPhone || "s/tel"})`,
          ].filter(Boolean).join(" | "),
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

  // 🧹 Vista carrito vacío
  if (cart.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold text-rose-600">Carrito de compra</h1>
        <div className="mt-6 bg-white rounded-2xl border p-4">
          <p>Tu carrito está vacío 🛒</p>
          <a href="/catalogo" className="inline-block mt-4 px-4 py-2 rounded-2xl border">Ir al catálogo</a>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold text-rose-600">Carrito de compra</h1>

      {/* LISTA DE PRODUCTOS (desde el contexto) */}
      <div className="mt-6 bg-white rounded-2xl border p-4">
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between py-2 border-b last:border-none">
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm opacity-70">x{item.quantity}</p>
            </div>
            <div className="flex items-center gap-3">
              <span>${(item.price * item.quantity).toFixed(2)}</span>
              <button onClick={() => decrement(item.id)} className="text-sm underline">-1</button>
              <button onClick={() => removeLine(item.id)} className="text-sm underline">Quitar</button>
            </div>
          </div>
        ))}

        <div className="text-right mt-2 space-y-1">
          <p>Subtotal: ${subtotalPesos.toFixed(2)}</p>
          <p>Envío: ${(shippingPesos).toFixed(2)}</p>
          <p className="text-lg font-bold">Total: ${(totalFinal).toFixed(2)}</p>
        </div>
      </div>

      {/* FORMULARIO */}
      {/* (lo tuyo igual; no lo toqué salvo por el submit) */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* … todo tu formulario tal cual … */}
      </form>
    </main>
  );
}

