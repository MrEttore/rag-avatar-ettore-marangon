import "@/styles/globals.css";

import type { Metadata } from "next";
import { Rubik } from "next/font/google";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Ettore Marangon",
    default: "Home | Ettore Marangon",
  },
  description:
    "Discover Ettore Marangon, a professional with a rich background, diverse skills, and extensive experience.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={rubik.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
