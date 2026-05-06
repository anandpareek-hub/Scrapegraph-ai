import { fail, getScrapeGraphClient, sdkResponse } from "../../lib/scrapegraph";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET() {
  try {
    const sgai = getScrapeGraphClient();
    return sdkResponse(await sgai.credits());
  } catch (error) {
    return fail(error, 400);
  }
}
