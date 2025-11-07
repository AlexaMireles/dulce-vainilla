// src/app/api/orders/route.ts
export const runtime = "nodejs"; // Resend necesita Node runtime

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendOrderEmails } from "@/lib/mailer";

// Municipios permitidos (AMM)
const METRO_NL = new Set([
  "Monterrey",
  "San Nicolás de los Garza",
  "San Pedro Garza García",
  "Guadalupe",
  "Apodaca",
  "General Escobedo",
  "Santa Catarina",
  "García",
]);

type Body = {
  customer: { email: string; name?: string; phone?: string; address?: string };
  recipient?: { name?: string; phone?: string };
  logistics?: {
    postalCode?: string;
    city?: string;
    neighborhood?: string;
    deliveryDate?: string;     // YYYY-MM-DD
    deliveryWindow?: string;   // "09:00–14:00"
    deliveryType?: "delivery";
  };
  cardMessage?: string;
  items: { title: string; quantity: number; unitPrice: number }[];
  notes?: string;

  // compatibilidad con el carrito (top-level)
  deliveryDate?: string;
  timeWindow?: string;
  city?: string;
  shipping?: number;
  neighborhood?: string; // por si lo mandas arriba
  postalCode?: string;   // por si lo mandas arriba
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

// Fallback de envío por CP (centavos)
function shippingByPostalCode(cp?: string): number {
  if (!cp) return 0;
  if (/^(64\d{3}|66[0-5]\d{2})$/.test(cp)) return 8900;     // $89
  if (/^(67\d{3}|68\d{3}|65\d{3})$/.test(cp)) return 15900; // $159
  return 11900;                                            // default metro
}

type MailItem = { title: string; quantity: number; unitPrice: number };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    if (!body?.customer?.email) {
      return NextResponse.json({ error: "Falta el correo del cliente." }, { status: 400 });
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "No hay productos en el pedido." }, { status: 400 });
    }

    // Tomar datos desde logistics o top-level
    const lg = body.logistics || {};
    const city = (lg.city ?? body.city ?? "").trim();
    const deliveryDateStr = lg.deliveryDate ?? body.deliveryDate;   // YYYY-MM-DD
    const deliveryWindow = lg.deliveryWindow ?? body.timeWindow;    // "09:00–14:00"
    const postalCode = lg.postalCode ?? body.postalCode ?? "";
    const neighborhood = lg.neighborhood ?? body.neighborhood ?? "";

    // Validar municipio
    if (!METRO_NL.has(city)) {
      return NextResponse.json(
        { error: "Solo entregamos en Monterrey y área metropolitana (NL)." },
        { status: 400 }
      );
    }

    // Validar fecha mínima: mañana
    if (!deliveryDateStr) {
      return NextResponse.json({ error: "Selecciona la fecha de entrega." }, { status: 400 });
    }
    const today = startOfDay(new Date());
    const minDate = startOfDay(addDays(today, 1));
    const chosen = startOfDay(new Date(`${deliveryDateStr}T00:00:00`));
    if (isNaN(chosen.getTime()) || chosen < minDate) {
      return NextResponse.json(
        { error: "La entrega debe agendarse con al menos 1 día de anticipación." },
        { status: 400 }
      );
    }

    if (!deliveryWindow) {
      return NextResponse.json({ error: "Selecciona un horario de entrega." }, { status: 400 });
    }

    // Totales
    const subtotal = body.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const shipping =
      typeof body.shipping === "number" ? body.shipping : shippingByPostalCode(postalCode);
    const total = subtotal + shipping;

    // Compactar extras en NOTAS (porque tu modelo Order no tiene estas columnas)
    const extraLines = [
      `Tipo: Envío a domicilio`,
      `Municipio: ${city}`,
      `Entrega: ${deliveryDateStr} (${deliveryWindow})`,
      postalCode && `CP: ${postalCode}`,
      neighborhood && `Colonia/Refs: ${neighborhood}`,
      body.recipient?.name && `Destinatario: ${body.recipient.name} (${body.recipient?.phone || "s/tel"})`,
      body.cardMessage && `Tarjeta: ${body.cardMessage}`,
      body.notes && `Notas: ${body.notes}`,
    ].filter(Boolean);

    // Crear orden
    const order = await prisma.order.create({
      data: {
        email: body.customer.email.toLowerCase().trim(),
        name: (body.customer.name ?? "").trim(),
        phone: (body.customer.phone ?? "").trim(),
        address: (body.customer.address ?? "").trim(),
        notes: extraLines.join(" | "),
        subtotal,
        shipping,
        total,
        items: {
          create: body.items.map((i) => ({
            title: i.title.trim(),
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        },
      },
      include: { items: true },
    });

    // Emails
    await sendOrderEmails({
      orderId: order.id,
      customer: {
        email: order.email,
        name: order.name || undefined,
        phone: order.phone || undefined,
        address: order.address || undefined,
      },
      items: order.items.map((i: MailItem) => ({
        title: i.title,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      amounts: { subtotal, shipping, total },
      notes: order.notes || undefined,
    });

    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch (e) {
    console.error("Error en /api/orders:", e);
    return NextResponse.json({ error: "Error al procesar el pedido" }, { status: 500 });
  }
}
