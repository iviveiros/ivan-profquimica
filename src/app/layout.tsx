import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ivan ProfQuímica",
  description: "Sistema de gestão de aulas para professores de Química",
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "◉" },
  { href: "/criar-aula", label: "Criar Aula", icon: "✦" },
  { href: "/horarios", label: "Horários", icon: "◈" },
  { href: "/alunos", label: "Alunos", icon: "◆" },
  { href: "/faltas", label: "Chamada", icon: "◇" },
  { href: "/notas", label: "Notas", icon: "○" },
  { href: "/pati", label: "Pati", icon: "🤖" },
  { href: "/demo", label: "Demo", icon: "🎬" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full scroll-smooth">
      <body className="min-h-full font-sans antialiased">
        <nav className="sticky top-0 z-50 border-b border-zinc-200/60 bg-white/70 backdrop-blur-xl shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5">
            <Link
              href="/dashboard"
              className="group flex items-center gap-2.5 shrink-0"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-base shadow-lg shadow-emerald-200 transition-transform group-hover:scale-105 group-hover:rotate-3">
                🧪
              </span>
              <div className="flex flex-col leading-tight max-sm:hidden">
                <span className="text-sm font-extrabold tracking-tight text-zinc-900">
                  Ivan_ProfQuímica
                </span>
                <span className="text-[9px] font-semibold tracking-widest text-emerald-600 uppercase">
                  Professor Portal
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-0.5 overflow-x-auto">
              {navItems.map((item) => (
                <NavLink key={item.href} href={item.href}>
                  <span className="hidden sm:inline">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        <main className="page-enter mx-auto max-w-6xl px-4 py-6">{children}</main>

        <footer className="mt-16 border-t border-zinc-200/60 bg-white/40 py-6 text-center">
          <p className="text-xs text-zinc-400">
            Ivan ProfQuímica © {new Date().getFullYear()}
          </p>
        </footer>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const label = navItems.find(n => n.href === href)?.label || href
  return (
    <Link
      href={href}
      aria-label={label}
      className="nav-link inline-flex items-center gap-1 text-xs sm:text-sm whitespace-nowrap"
    >
      {children}
    </Link>
  );
}
