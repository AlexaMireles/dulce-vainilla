// src/app/api/auth/request-password-reset/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    // TODO: generar token, guardar en DB y enviar email
    // Por ahora sólo respondemos OK para que compile y puedas desplegar.
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("request-password-reset error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// Opcional, ayuda en Vercel:
export const runtime = "nodejs";
