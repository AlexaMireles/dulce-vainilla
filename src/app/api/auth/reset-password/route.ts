// src/app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const newPassword =
      typeof body?.newPassword === "string" ? body.newPassword : "";

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token y nueva contraseña son requeridos" },
        { status: 400 }
      );
    }

    // TODO:
    // 1) Validar token en DB
    // 2) Hashear y guardar la nueva contraseña
    // 3) Invalidar token
    // De momento respondemos OK para que la build pase.
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("reset-password error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// Ayuda para Vercel/Edge vs Node:
export const runtime = "nodejs";
