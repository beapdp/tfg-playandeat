import type { Metadata } from "next";
// Importamos la fuente Poppins desde Google Fonts.
// Usaremos distintos pesos (weights) para títulos y textos.
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Configuramos la fuente Poppins
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"], // Pesos que usaremos
});

// Metadatos de la aplicación (título que sale en la pestaña del navegador)
export const metadata: Metadata = {
  title: "Play&Eat | Disfruta la sobremesa",
  description: "Encuentra restaurantes family-friendly con zonas de juego infantiles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Cambiamos a español (es)
    <html lang="es">
      <body
        className={`${poppins.variable} font-sans antialiased flex flex-col min-h-screen`}
      >
        {/* El Header se renderiza en todas las páginas (Barra superior) */}
        <Header />
        
        {/* Aquí dentro (children) irá el contenido cambiante de cada página (ej. page.tsx) */}
        <main className="flex-1">
          {children}
        </main>
        
        {/* El Footer también se renderiza en todas las páginas (Pie de página) */}
        <Footer />
      </body>
    </html>
  );
}
