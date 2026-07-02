import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ivan ProfQuímica",
  description: "Gerador de aulas, exercícios e avaliações de Química",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full bg-zinc-50 font-sans antialiased">
        <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <a href="/" className="text-xl font-bold text-emerald-700">
              Ivan_ProfQuímica
            </a>
            <div className="flex items-center gap-4 text-sm text-zinc-600">
              <a href="/" className="hover:text-emerald-700">Início</a>
              <a href="/horarios" className="hover:text-emerald-700">Horários</a>
              <a href="/criar-aula" className="hover:text-emerald-700">Criar Aula</a>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
