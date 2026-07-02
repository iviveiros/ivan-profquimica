import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ivan ProfQuímica",
  description: "Sistema de gestão de aulas para professores de Química",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full bg-zinc-50 font-sans antialiased">
        <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5">
            <Link href="/dashboard" className="text-lg font-bold text-emerald-700 tracking-tight">
              🧪 Ivan_ProfQuímica
            </Link>
            <div className="flex items-center gap-1 text-sm">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/criar-aula">Criar Aula</NavLink>
              <NavLink href="/horarios">Horários</NavLink>
              <NavLink href="/alunos">Alunos</NavLink>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
    >
      {children}
    </Link>
  );
}
