import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma"; // si exportas default; si exportas named usa { prisma }

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { ok: false, msg: "Faltan campos" },
        { status: 400 }
      );
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { ok: false, msg: "Ese correo ya está registrado" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { name, email, password: hashed },
    });

    return NextResponse.json({ ok: true, msg: "Usuario creado" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, msg: "Error interno" },
      { status: 500 }
    );
  }
}