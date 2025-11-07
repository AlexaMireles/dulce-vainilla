export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold mb-4">Restablecer contraseña</h1>

      <form className="space-y-3">
        <input
          type="email"
          name="email"
          required
          placeholder="Correo electrónico"
          className="border rounded px-3 py-2 w-full"
        />
        <button className="bg-rose-600 text-white px-4 py-2 rounded">
          Enviar enlace
        </button>
      </form>
    </main>
  );
}
