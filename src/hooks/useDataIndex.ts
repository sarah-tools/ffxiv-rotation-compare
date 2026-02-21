import { useState, useEffect } from "react";
import { fetchJSON } from "../api/client";

interface DataIndex {
  lastUpdated: string;
  encounters: { id: number; name: string; zone: string }[];
}

export function useDataIndex() {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    fetchJSON<DataIndex>("index.json")
      .then((data) => {
        if (!ignore) {
          setLastUpdated(data.lastUpdated);
        }
      })
      .catch(() => {
        // Silently fail — info display is non-critical
      });

    return () => {
      ignore = true;
    };
  }, []);

  return { lastUpdated };
}
