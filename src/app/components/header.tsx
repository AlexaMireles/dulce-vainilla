"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useCart } from '../context/CartContext';


export default function Header() {
  const { count } = useCart(); // contador de carrito
  const { data: session } = useSession(); // sesión del usuario

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b border-white/60">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* Logo + Home */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-dv.png"
            alt="Dulce Vainilla"
            width={150}
            height={44}
            priority
          />
          <span className="hidden sm:inline font-bold text-rose-600">
            Dulce Vainilla
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/catalogo" className="hover:text-rose-600 transition-colors">
            Catálogo
          </Link>

          <Link href="/carrito" className="relative hover:text-rose-600 transition-colors">
            Carrito
            {count > 0 && (
              <span
                className="absolute -right-3 -top-2 min-w-5 h-5 px-1 text-xs
                               bg-rose-500 text-white rounded-full grid place-items-center"
              >
                {count}
              </span>
            )}
          </Link>

          {/* Usuario */}
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-700 hidden sm:inline">
                Hola, {session.user?.name || "Usuario"}
              </span>
              <button
                onClick={() => signOut()}
                className="text-rose-600 font-medium hover:underline"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="px-3 py-1.5 rounded-md bg-rose-500 text-white hover:bg-rose-600 transition-all"
            >
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}