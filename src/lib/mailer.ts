// src/lib/mailer.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Usa formato "Nombre <email>" para mejor deliverability
const MAIL_FROM =
  process.env.MAIL_FROM?.trim() ||
  "Dulce Vainilla <onboarding@resend.dev>";

const OWNER_EMAIL = (process.env.OWNER_EMAIL ?? "").trim().toLowerCase();

// Helper dinero
const money = (cents: number) =>
  (cents / 100).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

export type OrderEmailPayload = {
  orderId: string;
  customer: { email: string; name?: string; phone?: string; address?: string };
  items: { title: string; quantity: number; unitPrice: number }[];
  amounts: { subtotal: number; shipping: number; total: number };
  notes?: string;
};

// ---------- HTML ----------
const orderHtml = (p: OrderEmailPayload) => {
  const rows = p.items
    .map(
      (i) => `
        <tr>
          <td>${i.title}</td>
          <td style="text-align:center;">${i.quantity}</td>
          <td style="text-align:right;">${money(i.unitPrice)}</td>
          <td style="text-align:right;">${money(i.unitPrice * i.quantity)}</td>
        </tr>`
    )
    .join("");

  const phoneLine   = p.customer.phone   ? `<p><b>Tel:</b> ${p.customer.phone}</p>` : "";
  const addressLine = p.customer.address ? `<p><b>Dirección:</b> ${p.customer.address}</p>` : "";
  const notesLine   = p.notes            ? `<p><b>Notas:</b> ${p.notes}</p>` : "";

  return `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
    <h2>Orden #${p.orderId} – Dulce Vainilla</h2>
    <p><b>Cliente:</b> ${p.customer.name || "-"} &lt;${p.customer.email}&gt;</p>
    ${phoneLine}
    ${addressLine}
    ${notesLine}

    <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;border:1px solid #eee">
      <thead>
        <tr style="background:#fafafa">
          <th align="left">Producto</th>
          <th align="center">Cant.</th>
          <th align="right">Precio</th>
          <th align="right">Importe</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr><td colspan="3" align="right"><b>Subtotal</b></td><td align="right">${money(p.amounts.subtotal)}</td></tr>
        <tr><td colspan="3" align="right"><b>Envío</b></td><td align="right">${money(p.amounts.shipping)}</td></tr>
        <tr><td colspan="3" align="right"><b>Total</b></td><td align="right"><b>${money(p.amounts.total)}</b></td></tr>
      </tfoot>
    </table>

    <p style="margin-top:12px">Gracias por tu compra 💛</p>
  </div>
  `;
};

// ---------- TEXTO PLANO ----------
const orderText = (p: OrderEmailPayload) => {
  const lines = p.items
    .map(
      (i) =>
        `- ${i.title} x${i.quantity} @ ${money(i.unitPrice)} = ${money(
          i.unitPrice * i.quantity
        )}`
    )
    .join("\n");

  return [
    `Orden #${p.orderId} – Dulce Vainilla`,
    `Cliente: ${p.customer.name || "-"} <${p.customer.email}>`,
    p.customer.phone ? `Tel: ${p.customer.phone}` : "",
    p.customer.address ? `Dirección: ${p.customer.address}` : "",
    p.notes ? `Notas: ${p.notes}` : "",
    "",
    "Productos:",
    lines,
    "",
    `Subtotal: ${money(p.amounts.subtotal)}`,
    `Envío: ${money(p.amounts.shipping)}`,
    `Total: ${money(p.amounts.total)}`,
  ]
    .filter(Boolean)
    .join("\n");
};

// ---------- utils ----------
function normEmail(s?: string) {
  return (s ?? "").trim().toLowerCase();
}
function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}
function mask(s?: string) {
  return s ? s.replace(/^(.{3}).+(@.+)$/, "$1***$2") : "";
}

// ---------- ENVÍO: dos correos, logs detallados ----------
export async function sendOrderEmails(p: OrderEmailPayload) {
  const subject = `Orden #${p.orderId} – Dulce Vainilla`;
  const customerEmail = normEmail(p.customer.email);

  // Log de variables críticas (no imprime API key completa)
  console.log("MAIL_FROM:", MAIL_FROM);
  console.log("OWNER_EMAIL:", mask(OWNER_EMAIL));
  console.log("Customer email:", mask(customerEmail));
  console.log("RESEND_API_KEY set?:", !!process.env.RESEND_API_KEY);

  // 1) Cliente
  if (isValidEmail(customerEmail)) {
    try {
      const resp = await resend.emails.send({
        from: MAIL_FROM,
        to: [customerEmail],
        subject,
        html: orderHtml(p),
        text: orderText(p),
        reply_to: OWNER_EMAIL || undefined,
      });
      console.log("✅ Cliente OK:", resp);
    } catch (err: any) {
      console.error("❌ Cliente ERROR:", err?.statusCode || "", err?.message || err);
    }
  } else {
    console.warn("⚠️ Email cliente inválido. No se envía:", customerEmail);
  }

  // 2) Dueña
  if (isValidEmail(OWNER_EMAIL)) {
    try {
      const resp = await resend.emails.send({
        from: MAIL_FROM,
        to: [OWNER_EMAIL],
        subject: `Nueva ${subject}`,
        html: orderHtml(p),
        text: orderText(p),
      });
      console.log("✅ Dueña OK:", resp);
    } catch (err: any) {
      console.error("❌ Dueña ERROR:", err?.statusCode || "", err?.message || err);
    }
  } else {
    console.warn("⚠️ OWNER_EMAIL inválido / vacío. Configura en .env");
  }
}
