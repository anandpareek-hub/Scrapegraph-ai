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

type CrawlBody = {
  action?: "start" | "get" | "stop" | "resume" | "delete";
  id?: string;
  source?: string;
  formats?: string[];
  prompt?: string;
  schema?: string;
  maxPages?: number;
  maxDepth?: number;
  maxLinksPerPage?: number;
  includePatterns?: string[];
  excludePatterns?: string[];
  fetchConfig?: Record<string, unknown>;
};

function crawlFormats(formats: string[] | undefined, prompt?: string, schema?: unknown) {
  return (formats?.length ? formats : ["markdown"]).map((type) => {
    if (type === "json") {
      return compactObject({ type, prompt, schema });
    }
    if (type === "screenshot") {
      return { type, fullPage: true, width: 1440, height: 900 };
    }
    if (type === "markdown" || type === "html") {
      return { type, mode: "reader" };
    }
    return { type };
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CrawlBody;
    const sgai = getScrapeGraphClient();
    const action = body.action || "start";

    if (action === "start") {
      const schema = parseOptionalJson(body.schema, "Schema");
      const result = await sgai.crawl.start(
        compactObject({
          url: assertHttpUrl(body.source, "Crawl URL"),
          formats: crawlFormats(body.formats, body.prompt, schema),
          maxPages: body.maxPages || 25,
          maxDepth: body.maxDepth || 2,
          maxLinksPerPage: body.maxLinksPerPage || 12,
          includePatterns: body.includePatterns,
          excludePatterns: body.excludePatterns,
          fetchConfig: compactObject(body.fetchConfig || {})
        }) as Parameters<typeof sgai.crawl.start>[0]
      );

      return sdkResponse(result);
    }

    if (!body.id?.trim()) {
      throw new Error("Crawl id is required.");
    }

    const id = body.id.trim();
    const result =
      action === "get"
        ? await sgai.crawl.get(id)
        : action === "stop"
          ? await sgai.crawl.stop(id)
          : action === "resume"
            ? await sgai.crawl.resume(id)
            : await sgai.crawl.delete(id);

    return sdkResponse(result);
  } catch (error) {
    return fail(error, 400);
  }
}
