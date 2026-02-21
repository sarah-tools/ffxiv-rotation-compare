// Static JSON data fetcher for pre-generated data
// No longer needs FFLogs API or token server

const BASE_URL = import.meta.env.BASE_URL || "/";

export async function fetchJSON<T>(path: string): Promise<T> {
  const url = `${BASE_URL}data/${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Data not found: ${path}. This data may not have been generated yet.`);
    }
    throw new Error(`Failed to fetch ${path}: ${res.status}`);
  }
  return res.json();
}
