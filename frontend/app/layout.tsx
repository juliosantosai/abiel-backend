import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Abiel Admin",
  description: "Panel de administración de Abiel Core"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
