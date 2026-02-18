import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "K8s Competence Playground",
  description: "Three-tier app for Kubernetes competence study"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
