import { Link } from "wouter";

export function Nav() {
  return (
    <header class="h-12 border-b border-[var(--border)] flex items-center px-5 gap-8">
      <Link href="/" class="text-sm font-bold tracking-widest uppercase text-[var(--accent)]">
        RaceMate
      </Link>
      <nav class="flex gap-5 text-sm text-[var(--muted)]">
        <Link href="/sessions" class="hover:text-[var(--text)] transition-colors">
          Sessions
        </Link>
        <Link href="/compare" class="hover:text-[var(--text)] transition-colors">
          Compare
        </Link>
      </nav>
    </header>
  );
}
