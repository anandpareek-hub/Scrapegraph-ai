import { fail, getScrapeGraphClient, sdkResponse } from "../../lib/scrapegraph";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(request: Request) {
  try {
    const sgai = getScrapeGraphClient();
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (id) {
      return sdkResponse(await sgai.history.get(id));
    }

    const rawService = url.searchParams.get("service") || undefined;
    const service = ["scrape", "extract", "search", "monitor", "crawl"].includes(
      rawService || ""
    )
      ? (rawService as "scrape" | "extract" | "search" | "monitor" | "crawl")
      : undefined;
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "20");

    return sdkResponse(
      await sgai.history.list({
        service,
        page,
        limit
      })
    );
  } catch (error) {
    return fail(error, 400);
  }
}
