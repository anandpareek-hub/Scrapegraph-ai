import { NextResponse } from "next/server";

import {
  assertHttpUrl,
  compactObject,
  fail,
  getScrapeGraphClient,
  parseOptionalJson,
  sdkResponse
} from "../../lib/scrapegraph";

export const runtime = "nodejs";
export const maxDuration = 60;

type RunBody = {
  mode?: "extract" | "scrape" | "search";
  sourceKind?: "url" | "html" | "markdown" | "query";
  source?: string;
  prompt?: string;
  schema?: string;
  formats?: string[];
  fetchConfig?: Record<string, unknown>;
  numResults?: number;
  searchFormat?: "markdown" | "html";
  timeRange?: string;
  locationGeoCode?: string;
};

function buildFormats(formats: string[] | undefined, prompt: string, schema: unknown) {
  const selected = formats?.length ? formats : ["markdown"];

  return selected.map((type) => {
    if (type === "screenshot") {
      return { type, fullPage: true, width: 1440, height: 900 };
    }
    if (type === "json") {
      return compactObject({ type, prompt, schema });
    }
    if (type === "markdown" || type === "html") {
      return { type, mode: "reader" };
    }
    return { type };
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RunBody;
    const sgai = getScrapeGraphClient();
    const mode = body.mode || "extract";
    const sourceKind = body.sourceKind || (mode === "search" ? "query" : "url");
    const prompt = body.prompt?.trim() || undefined;
    const schema = parseOptionalJson(body.schema, "Schema");
    const fetchConfig = compactObject(body.fetchConfig || {});

    if (mode === "extract") {
      if (!prompt) {
        throw new Error("Prompt is required for extraction.");
      }

      const source =
        sourceKind === "url"
          ? { url: assertHttpUrl(body.source, "Source URL") }
          : sourceKind === "html"
            ? { html: body.source || "" }
            : { markdown: body.source || "" };

      if (!body.source?.trim()) {
        throw new Error("Source is required.");
      }

      const result = await sgai.extract(
        compactObject({
          ...source,
          prompt,
          schema,
          mode: "reader",
          fetchConfig
        }) as Parameters<typeof sgai.extract>[0]
      );

      return sdkResponse(result);
    }

    if (mode === "scrape") {
      const url = assertHttpUrl(body.source, "Source URL");
      const result = await sgai.scrape(
        compactObject({
          url,
          formats: buildFormats(body.formats, prompt || "", schema),
          fetchConfig
        }) as Parameters<typeof sgai.scrape>[0]
      );

      return sdkResponse(result);
    }

    if (mode === "search") {
      const query = body.source?.trim();
      if (!query) {
        throw new Error("Search query is required.");
      }

      const result = await sgai.search(
        compactObject({
          query,
          numResults: body.numResults || 5,
          format: body.searchFormat || "markdown",
          prompt,
          schema,
          timeRange: body.timeRange,
          locationGeoCode: body.locationGeoCode,
          fetchConfig
        }) as Parameters<typeof sgai.search>[0]
      );

      return sdkResponse(result);
    }

    return NextResponse.json(
      { status: "error", data: null, error: "Unsupported run mode." },
      { status: 400 }
    );
  } catch (error) {
    return fail(error, 400);
  }
}
