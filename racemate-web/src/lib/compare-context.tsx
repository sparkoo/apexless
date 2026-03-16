import { createContext } from "preact";
import { useContext, useState } from "preact/hooks";
import { LapMetadata } from "@/lib/types";

interface CompareContextValue {
  selected: LapMetadata[];
  toggle: (lap: LapMetadata) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const CompareContext = createContext<CompareContextValue>({
  selected: [],
  toggle: () => {},
  remove: () => {},
  clear: () => {},
});

export function CompareProvider({ children }: { children: preact.ComponentChildren }) {
  const [selected, setSelected] = useState<LapMetadata[]>([]);

  const toggle = (lap: LapMetadata) => {
    setSelected((prev) => {
      if (prev.some((l) => l.id === lap.id)) return prev.filter((l) => l.id !== lap.id);
      if (prev.length >= 2) return [prev[1], lap];
      return [...prev, lap];
    });
  };

  const remove = (id: string) => setSelected((prev) => prev.filter((l) => l.id !== id));
  const clear = () => setSelected([]);

  return (
    <CompareContext.Provider value={{ selected, toggle, remove, clear }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}
