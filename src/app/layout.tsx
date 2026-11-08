import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BreakDSA — Learn. Practice. Visualize.",
  description: "A focused DSA workspace with structured lessons, deliberate practice, interactive visualizations, and a course-grounded AI tutor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
