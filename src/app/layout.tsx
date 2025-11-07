import "./globals.css";
import type { Metadata } from "next";
import { Baloo_2, Quicksand } from "next/font/google";

import Header from "./components/header";
import Providers from "./Providers"; // 👈 importa el archivo Providers.tsx

export const metadata: Metadata = {
  title: "Dulce Vainilla",
  description: "Repostería artesanal – galletas NY, cheesecakes y cupcakes.",
};

const baloo = Baloo_2({
  weight: ["600", "800"],
  subsets: ["latin"],
  variable: "--font-baloo",
});

const quick = Quicksand({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-quick",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${baloo.variable} ${quick.variable}`}>
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}