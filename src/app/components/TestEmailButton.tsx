"use client";
import { useState } from "react";

export default function TestEmailButton() {
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/test-email", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error");
      setMsg("Correo enviado ✅ (revisa tu inbox y la pestaña Emails en Resend)");
    } catch (e: any) {
      setMsg(e.message || "No se pudo enviar 😿");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <button onClick={send} disabled={loading}>
        {loading ? "Enviando..." : "Probar envío de correo"}
      </button>
      {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
    </div>
  );
}