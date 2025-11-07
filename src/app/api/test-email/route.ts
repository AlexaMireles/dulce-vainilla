import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const MAIL_FROM = process.env.MAIL_FROM!;
const OWNER_EMAIL = process.env.OWNER_EMAIL!;

export async function POST() {
  try {
    const r = await resend.emails.send({
      from: MAIL_FROM,
      to: OWNER_EMAIL,
      subject: "🎉 Prueba de envío - Dulce Vainilla",
      html: `<div style="font-family:system-ui">
              <h2>¡Hola!</h2>
              <p>Correo de prueba enviado con Resend desde Dulce Vainilla.</p>
            </div>`
    });
    return NextResponse.json({ ok: true, id: (r as any)?.data?.id || null });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: err?.message || "Error enviando correo" }, { status: 500 });
  }
}