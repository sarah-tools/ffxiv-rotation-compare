import { useState, useEffect } from "react";
import { fetchJSON } from "../api/client";

export function useJobs() {
  const [jobs, setJobs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    fetchJSON<string[]>("jobs.json")
      .then((data) => {
        if (!ignore) {
          setJobs(data);
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

  return { jobs, loading, error };
}
