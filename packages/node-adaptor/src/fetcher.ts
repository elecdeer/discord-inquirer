export type ApiFetcher = <T>(
  method: "GET" | "POST" | "PATCH" | "DELETE" | string,
  path: string,
  body?: object
) => Promise<T>;

export const apiFetcher =
  (apiBase: string, botToken: string): ApiFetcher =>
  async (method, path, body) => {
    const url = `${apiBase}${path}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
      method: method,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.status}`);
    }
    return res.json();
  };
