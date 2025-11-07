import Hero from "./components/hero";
import TestEmailButton from "./components/TestEmailButton";

export const metadata = {
  title: "Inicio | Dulce Vainilla",
};

export default function Home() {
  return (
    <>
      <Hero />
      {/* Botón temporal solo para probar Resend */}
      <div style={{ maxWidth: 640, margin: "24px auto", padding: "0 16px" }}>
        <TestEmailButton />
      </div>
    </>
  );
}