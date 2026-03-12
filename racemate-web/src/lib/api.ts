import type { CompareData, LapMetadata, Session } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const DEV_TOKEN = import.meta.env.VITE_DEV_TOKEN;

function authHeaders(): HeadersInit {
  if (DEV_TOKEN) return { Authorization: `Bearer ${DEV_TOKEN}` };
  return {};
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

export const api = {
  laps: {
    list: (trackId?: string, userId?: string): Promise<LapMetadata[]> => {
      const params = new URLSearchParams();
      if (trackId) params.set("track_id", trackId);
      if (userId) params.set("user_id", userId);
      return get(`/api/laps?${params}`);
    },
    get: (id: string): Promise<LapMetadata> => get(`/api/laps/${id}`),
  },

  compare: (lapAId: string, lapBId: string): Promise<CompareData> =>
    get(`/api/compare?lap_a=${lapAId}&lap_b=${lapBId}`),

  sessions: {
    list: (): Promise<Session[]> => get("/api/sessions"),
    get: (id: string): Promise<Session> => get(`/api/sessions/${id}`),
  },

  users: {
    get: (id: string) => get(`/api/users/${id}`),
    laps: (id: string): Promise<LapMetadata[]> => get(`/api/users/${id}/laps`),
    sessions: (id: string): Promise<Session[]> => get(`/api/users/${id}/sessions`),
  },
};
