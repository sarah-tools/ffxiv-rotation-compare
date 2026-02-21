import { useState, useEffect } from "react";
import { fetchJSON } from "../api/client";
import type { Expansion } from "../api/types";

export function useEncounters() {
  const [expansions, setExpansions] = useState<Expansion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    fetchJSON<Expansion[]>("encounters.json")
      .then((data) => {
        if (!ignore) {
          setExpansions(data);
        }
      })
      .catch((e) => {
        if (!ignore) {
          setError(e.message);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return { expansions, loading, error };
}
