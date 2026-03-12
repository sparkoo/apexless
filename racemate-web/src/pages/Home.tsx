import { Link } from "wouter";

export function Home() {
  return (
    <div class="max-w-2xl mx-auto mt-16 flex flex-col gap-8">
      <div>
        <h1 class="text-3xl font-bold mb-2">RaceMate</h1>
        <p class="text-[var(--muted)]">
          Simracing lap comparison and race stats. Record your laps, upload them,
          and find exactly where you lose time.
        </p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <Link
          href="/compare"
          class="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5 hover:border-[var(--accent)] transition-colors"
        >
          <p class="text-lg font-semibold mb-1">Compare Laps</p>
          <p class="text-sm text-[var(--muted)]">
            Overlay two laps on the track map with full telemetry and delta analysis.
          </p>
        </Link>
        <Link
          href="/sessions"
          class="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5 hover:border-[var(--accent)] transition-colors"
        >
          <p class="text-lg font-semibold mb-1">Race Sessions</p>
          <p class="text-sm text-[var(--muted)]">
            Browse results, lap times, and tyre data from your race sessions.
          </p>
        </Link>
      </div>
    </div>
  );
}
