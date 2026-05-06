export type RunMode = "extract" | "scrape" | "search" | "crawl" | "monitor";

export type SourceKind = "url" | "html" | "markdown" | "query";

export type ScrapeFormat =
  | "markdown"
  | "html"
  | "links"
  | "images"
  | "summary"
  | "json"
  | "branding"
  | "screenshot";

export type FetchMode = "auto" | "fast" | "js";

export type FetchConfigForm = {
  mode: FetchMode;
  stealth: boolean;
  timeout: number;
  wait: number;
  scrolls: number;
  country: string;
};

export type ApiEnvelope<T = unknown> = {
  status: "success" | "error";
  data: T | null;
  error?: string;
  elapsedMs?: number;
  operation?: string;
};

export type Preset = {
  id: string;
  label: string;
  platform: string;
  mode: RunMode;
  sourceKind: SourceKind;
  sourceLabel: string;
  sourcePlaceholder: string;
  prompt: string;
  formats: ScrapeFormat[];
  schema: string;
};
