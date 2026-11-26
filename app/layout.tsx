import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tarefas",
  description: "Lista de tarefas com criação e edição.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <Providers>
          <header className="border-b border-zinc-200 dark:border-zinc-800">
            <div className="mx-auto flex h-16 w-full max-w-2xl items-center justify-between px-4">
              <Link
                href="/"
                className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
              >
                Tarefas
              </Link>
              <Link
                href="/tarefa"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Nova tarefa
              </Link>
            </div>
          </header>
          <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
