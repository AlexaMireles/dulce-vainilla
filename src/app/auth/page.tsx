"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("");
    setStatus("loading");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        setMsg("Error: el servidor no devolvió JSON (posible ruta incorrecta).");
        setStatus("error");
        return;
      }

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setMsg(data.msg || "No se pudo crear la cuenta.");
        setStatus("error");
      } else {
        setMsg("Cuenta creada con éxito 🎉");
        setStatus("ok");
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      console.error(err);
      setMsg("Error de conexión con el servidor.");
      setStatus("error");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold text-center text-rose-600 mb-2">
        Crear cuenta 🍪
      </h1>
      <p className="text-center text-sm text-gray-500 mb-6">
        Regístrate para guardar tus pedidos y ver tu historial.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 rounded"
        />
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 rounded"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 rounded"
        />
        <button
          type="submit"
          className="w-full bg-rose-500 text-white py-2 rounded hover:bg-rose-600 transition"
        >
          Crear cuenta
        </button>
      </form>

      {msg && (
        <p
          className={`text-center text-sm mt-4 ${
            status === "ok" ? "text-green-600" : "text-rose-600"
          }`}
        >
          {msg}
        </p>
      )}
    </div>
  );
}