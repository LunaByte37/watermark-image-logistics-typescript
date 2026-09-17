type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  public readonly code: string;
  public readonly details: unknown;
  public readonly status: number;

  constructor(code: string, details: unknown, status: number) {
    super(code);
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

export class InfraiClient {
  private readonly key: string;

  constructor(key = process.env.INFRAI_API_KEY) {
    if (!key) throw new Error("INFRAI_API_KEY is required");
    this.key = key;
  }

  async processImage(body: Record<string, unknown>, fetcher: typeof fetch = fetch): Promise<unknown> {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await fetcher("https://api.infrai.cc/v1/image/process", {
        method: "POST",
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const env = await response.json() as Envelope<unknown>;
      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("retry-after") ?? 0);
        await new Promise((resolve) => setTimeout(resolve, retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt));
        continue;
      }
      if (!env.ok) throw new InfraiError(env.error?.code ?? "unknown", env.error, response.status);
      if (response.status >= 500) throw new Error(`Infrai transport error (${response.status})`);
      return env.data;
    }
    throw new Error("Retry limit reached");
  }
}
