import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SupportIQ — Get started",
  description: "Set up your SupportIQ workspace.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
