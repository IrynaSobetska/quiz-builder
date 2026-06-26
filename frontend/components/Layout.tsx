import Link from "next/link";
import type { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-[#8FABD4] bg-white">
        <div className="mx-auto flex min-h-16 w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link className="text-base font-semibold" href="/quizzes">
            Quiz Builder
          </Link>
          <nav className="flex items-center gap-2 text-sm font-medium">
            <Link
              className="rounded-md px-3 py-2 text-[#303742] hover:bg-[#8FABD4]/20 hover:text-black"
              href="/quizzes"
            >
              Quizzes
            </Link>
            <Link
              className="rounded-md bg-[#4A70A9] px-3 py-2 text-white hover:bg-[#3f6194]"
              href="/create"
            >
              Create
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
