"use client";

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold mb-4">Restablecer contraseña</h1>

      <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
        <input
          type="password"
          name="password"
          required
          placeholder="Nueva contraseña"
          className="border rounded px-3 py-2 w-full"
        />
        <input
          type="password"
          name="confirm"
          required
          placeholder="Confirmar contraseña"
          className="border rounded px-3 py-2 w-full"
        />
        <button className="bg-rose-600 text-white px-4 py-2 rounded w-full">
          Confirmar
        </button>
      </form>
    </main>
  );
}
