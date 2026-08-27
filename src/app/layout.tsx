import type { Metadata } from "next";
import { Poppins, Nunito_Sans } from "next/font/google";
import "./globals.css";

// Placeholders for the licensed brand fonts (Agrandir Grand / Anaphora) until
// the actual font files are available — swap for next/font/local then.
const fontHeading = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const fontBody = Nunito_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Layer | Diseñamos en capas, pensamos en grande",
  description:
    "Impresión 3D a medida: personajes, dioramas, Funko Pop personalizados, llaveros, decoración y más.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${fontHeading.variable} ${fontBody.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
