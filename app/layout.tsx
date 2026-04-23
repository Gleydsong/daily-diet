import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Diet",
  description: "Controle diário de refeições, dieta e métricas de consistência."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
