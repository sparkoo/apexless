import { useState, useEffect } from "preact/hooks";
import { api } from "@/lib/api";
import { LapMetadata, formatLapTime, formatDelta } from "@/lib/types";
import { useCompare } from "@/lib/compare-context";

export function Laps() {
  const [laps, setLaps] = useState<LapMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selected, toggle } = useCompare();

  useEffect(() => {
    api.laps.list().then(setLaps).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  // Group laps by track, sorted fastest-first within each group
  const byTrack = laps.reduce<Record<string, LapMetadata[]>>((acc, lap) => {
    const key = lap.track_name ?? lap.track_id;
    (acc[key] ??= []).push(lap);
    return acc;
  }, {});
  for (const key of Object.keys(byTrack)) {
    byTrack[key].sort((a, b) => a.lap_time_ms - b.lap_time_ms);
  }

  if (loading) return <p class="text-[var(--muted)]">Loading...</p>;
  if (error) return <p class="text-red-500">{error}</p>;
  if (laps.length === 0) return <p class="text-[var(--muted)]">No laps uploaded yet.</p>;

  return (
    <div class="max-w-4xl mx-auto flex flex-col gap-6">
      <h1 class="text-xl font-bold">Laps</h1>

      {Object.entries(byTrack).map(([track, trackLaps]) => {
        const best = trackLaps[0].lap_time_ms;
        return (
          <div key={track}>
            <div class="flex items-baseline gap-3 mb-2">
              <h2 class="text-sm font-semibold text-[var(--text)] uppercase tracking-wider">{track}</h2>
              <span class="text-xs text-[var(--muted)]">{trackLaps.length} lap{trackLaps.length !== 1 ? "s" : ""}</span>
              <span class="text-xs font-mono text-[var(--muted)]">best {formatLapTime(best)}</span>
            </div>
            <div class="border border-[var(--border)] rounded-lg overflow-hidden">
              <table class="w-full text-sm">
                <thead class="border-b border-[var(--border)] text-[var(--muted)]">
                  <tr>
                    <th class="text-left px-4 py-2 font-normal">Car</th>
                    <th class="text-right px-4 py-2 font-normal">Lap</th>
                    <th class="text-right px-4 py-2 font-normal">Time</th>
                    <th class="text-right px-4 py-2 font-normal">Delta</th>
                    <th class="text-right px-4 py-2 font-normal">S1</th>
                    <th class="text-right px-4 py-2 font-normal">S2</th>
                    <th class="text-right px-4 py-2 font-normal">S3</th>
                    <th class="text-right px-4 py-2 font-normal">Date</th>
                    <th class="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {trackLaps.map((lap, i) => {
                    const selIdx = selected.findIndex((l) => l.id === lap.id);
                    const sel = selIdx !== -1;
                    const delta = lap.lap_time_ms - best;
                    return (
                      <tr
                        key={lap.id}
                        class={`border-t border-[var(--border)] ${i === 0 ? "border-t-0" : ""} ${sel ? "bg-[var(--surface)]" : "hover:bg-[var(--surface)]"} transition-colors`}
                      >
                        <td class="px-4 py-2.5">
                          <span class="text-[var(--text)]">{lap.car_name}</span>
                          <span class="ml-2 text-xs text-[var(--muted)]">{lap.car_class}</span>
                        </td>
                        <td class="px-4 py-2.5 text-right text-[var(--muted)]">{lap.lap_number}</td>
                        <td class={`px-4 py-2.5 text-right font-mono font-semibold ${i === 0 ? "text-[var(--green)]" : ""}`}>
                          {formatLapTime(lap.lap_time_ms)}
                        </td>
                        <td class="px-4 py-2.5 text-right font-mono text-[var(--muted)]">
                          {i === 0 ? <span class="text-[var(--green)]">—</span> : formatDelta(delta)}
                        </td>
                        <td class="px-4 py-2.5 text-right font-mono text-[var(--muted)]">{lap.s1_ms ? formatLapTime(lap.s1_ms) : "—"}</td>
                        <td class="px-4 py-2.5 text-right font-mono text-[var(--muted)]">{lap.s2_ms ? formatLapTime(lap.s2_ms) : "—"}</td>
                        <td class="px-4 py-2.5 text-right font-mono text-[var(--muted)]">{lap.s3_ms ? formatLapTime(lap.s3_ms) : "—"}</td>
                        <td class="px-4 py-2.5 text-right text-[var(--muted)]">
                          {new Date(lap.recorded_at).toLocaleDateString()}
                        </td>
                        <td class="px-4 py-2.5 text-right">
                          <button
                            onClick={() => toggle(lap)}
                            class={`px-2 py-0.5 text-xs rounded border transition-colors ${
                              sel
                                ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--text)]"
                            }`}
                          >
                            {sel ? (selIdx === 0 ? "A" : "B") : "Select"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
