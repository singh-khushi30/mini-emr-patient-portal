import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini EMR + Patient Portal",
  description: "Patient portal and admin interface for mini EMR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 text-sm">
            <Link href="/" className="font-semibold text-slate-900">
              Patient Portal
            </Link>
            <Link href="/admin" className="text-slate-700 hover:text-slate-900">
              Admin
            </Link>
            <Link href="/admin/new-patient" className="text-slate-700 hover:text-slate-900">
              New Patient
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
