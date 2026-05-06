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

type MonitorBody = {
  action?: "create" | "list" | "get" | "update" | "pause" | "resume" | "delete";
  id?: string;
  name?: string;
  source?: string;
  interval?: string;
  webhookUrl?: string;
  formats?: string[];
  prompt?: string;
  schema?: string;
  fetchConfig?: Record<string, unknown>;
};

function monitorFormats(
  formats: string[] | undefined,
  prompt?: string,
  schema?: unknown
) {
  return (formats?.length ? formats : ["markdown"]).map((type) => {
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
    const body = (await request.json()) as MonitorBody;
    const sgai = getScrapeGraphClient();
    const action = body.action || "create";

    if (action === "list") {
      return sdkResponse(await sgai.monitor.list());
    }

    if (action === "create") {
      const schema = parseOptionalJson(body.schema, "Schema");
      const result = await sgai.monitor.create(
        compactObject({
          url: assertHttpUrl(body.source, "Monitor URL"),
          name: body.name?.trim() || "ScrapeGraph monitor",
          interval: body.interval || "0 * * * *",
          webhookUrl: body.webhookUrl,
          formats: monitorFormats(body.formats, body.prompt, schema),
          fetchConfig: compactObject(body.fetchConfig || {})
        }) as Parameters<typeof sgai.monitor.create>[0]
      );

      return sdkResponse(result);
    }

    if (!body.id?.trim()) {
      throw new Error("Monitor id is required.");
    }

    const id = body.id.trim();
    const result =
      action === "get"
        ? await sgai.monitor.get(id)
        : action === "update"
          ? await sgai.monitor.update(
              id,
              compactObject({
                name: body.name,
                interval: body.interval,
                webhookUrl: body.webhookUrl
              }) as Parameters<typeof sgai.monitor.update>[1]
            )
          : action === "pause"
            ? await sgai.monitor.pause(id)
            : action === "resume"
              ? await sgai.monitor.resume(id)
              : await sgai.monitor.delete(id);

    return sdkResponse(result);
  } catch (error) {
    return fail(error, 400);
  }
}
