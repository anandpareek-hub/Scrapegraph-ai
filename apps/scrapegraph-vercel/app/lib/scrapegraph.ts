import { NextResponse } from "next/server";
import { ScrapeGraphAI } from "scrapegraph-js";

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export function getScrapeGraphClient() {
  const apiKey = process.env.SGAI_API_KEY || process.env.SCRAPEGRAPH_API_KEY;

  if (!apiKey) {
    throw new ConfigError(
      "Missing SGAI_API_KEY. Add it to .env.local locally and to Vercel environment variables."
    );
  }

  return ScrapeGraphAI({ apiKey });
}

export function parseOptionalJson(value: unknown, label: string) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "object") {
    return value;
  }

  if (typeof value !== "string") {
    throw new Error(`${label} must be valid JSON.`);
  }

  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${label} must be valid JSON.`);
  }
}

export function compactObject<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => {
      if (value === undefined || value === null || value === "") {
        return false;
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return true;
    })
  );
}

export function assertHttpUrl(value: unknown, label = "URL") {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required.`);
  }

  let parsed: URL;
  try {
    parsed = new URL(value.trim());
  } catch {
    throw new Error(`${label} must be a valid URL.`);
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`${label} must start with http:// or https://.`);
  }

  return parsed.toString();
}

export function fail(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : "Unexpected server error.";
  const responseStatus = error instanceof ConfigError ? 500 : status;

  return NextResponse.json(
    {
      status: "error",
      data: null,
      error: message
    },
    { status: responseStatus }
  );
}

export function sdkResponse(result: {
  status?: string;
  data?: unknown;
  error?: string;
  elapsedMs?: number;
}) {
  if (result.status === "error") {
    return NextResponse.json(
      {
        status: "error",
        data: null,
        error: result.error || "ScrapeGraphAI request failed.",
        elapsedMs: result.elapsedMs
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    status: "success",
    data: result.data ?? result,
    elapsedMs: result.elapsedMs
  });
}
