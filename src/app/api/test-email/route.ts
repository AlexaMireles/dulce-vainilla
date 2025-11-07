// src/app/api/test-email/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

export async function POST() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return NextResponse.json({ error: "No RESEND_API_KEY" }, { status: 500 });
  const resend = new Resend(key);
  await resend.emails.send({
    from: process.env.MAIL_FROM || "onboarding@resend.dev",
    to: process.env.OWNER_EMAIL || "",
    subject: "Test",
    html: "<p>Hola 👋</p>",
  });
  return NextResponse.json({ ok: true });
}
