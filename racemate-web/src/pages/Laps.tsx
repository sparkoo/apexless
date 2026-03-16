import { useState, useEffect } from "preact/hooks";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { LapMetadata, formatLapTime } from "@/lib/types";

export function Laps() {
  const [laps, setLaps] = useState<LapMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [, navigate] = useLocation();

  useEffect(() => {
    api.laps.list().then(setLaps).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const compare = () => {
    if (selected.length === 2) {
      navigate(`/compare?lap_a=${selected[0]}&lap_b=${selected[1]}`);
    }
  };

  // Group laps by track
  const byTrack = laps.reduce<Record<string, LapMetadata[]>>((acc, lap) => {
    const key = lap.track_name ?? lap.track_id;
    (acc[key] ??= []).push(lap);
    return acc;
  }, {});

  if (loading) return <p class="text-[var(--muted)]">Loading...</p>;
  if (error) return <p class="text-red-500">{error}</p>;
  if (laps.length === 0) return <p class="text-[var(--muted)]">No laps uploaded yet.</p>;

  return (
    <div class="max-w-4xl mx-auto flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold">Laps</h1>
        <button
          onClick={compare}
          disabled={selected.length < 2}
          class="px-4 py-1.5 text-sm rounded bg-[var(--accent)] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          Compare {selected.length}/2
        </button>
      </div>

      {Object.entries(byTrack).map(([track, trackLaps]) => (
        <div key={track}>
          <h2 class="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">{track}</h2>
          <div class="border border-[var(--border)] rounded-lg overflow-hidden">
            <table class="w-full text-sm">
              <thead class="border-b border-[var(--border)] text-[var(--muted)]">
                <tr>
                  <th class="text-left px-4 py-2 font-normal">Car</th>
                  <th class="text-right px-4 py-2 font-normal">Lap</th>
                  <th class="text-right px-4 py-2 font-normal">Time</th>
                  <th class="text-right px-4 py-2 font-normal">S1</th>
                  <th class="text-right px-4 py-2 font-normal">S2</th>
                  <th class="text-right px-4 py-2 font-normal">S3</th>
                  <th class="text-right px-4 py-2 font-normal">Date</th>
                  <th class="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {trackLaps.map((lap, i) => {
                  const sel = selected.includes(lap.id);
                  const selIdx = selected.indexOf(lap.id);
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
                      <td class="px-4 py-2.5 text-right font-mono font-semibold">{formatLapTime(lap.lap_time_ms)}</td>
                      <td class="px-4 py-2.5 text-right font-mono text-[var(--muted)]">{lap.s1_ms ? formatLapTime(lap.s1_ms) : "—"}</td>
                      <td class="px-4 py-2.5 text-right font-mono text-[var(--muted)]">{lap.s2_ms ? formatLapTime(lap.s2_ms) : "—"}</td>
                      <td class="px-4 py-2.5 text-right font-mono text-[var(--muted)]">{lap.s3_ms ? formatLapTime(lap.s3_ms) : "—"}</td>
                      <td class="px-4 py-2.5 text-right text-[var(--muted)]">
                        {new Date(lap.recorded_at).toLocaleDateString()}
                      </td>
                      <td class="px-4 py-2.5 text-right">
                        <button
                          onClick={() => toggle(lap.id)}
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
      ))}
    </div>
  );
}
