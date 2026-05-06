"use client";

import {
  Activity,
  Clipboard,
  Cloud,
  Database,
  Download,
  FileJson,
  Globe2,
  History,
  Loader2,
  Play,
  Radio,
  RefreshCw,
  Search,
  Settings2
} from "lucide-react";
import { useMemo, useState } from "react";

import { ALL_FORMATS, DEFAULT_PRESET, PRESETS } from "./lib/presets";
import type {
  ApiEnvelope,
  FetchConfigForm,
  RunMode,
  ScrapeFormat,
  SourceKind
} from "./lib/types";

const MODES: Array<{ id: RunMode; label: string; icon: typeof FileJson }> = [
  { id: "extract", label: "Extract", icon: FileJson },
  { id: "scrape", label: "Scrape", icon: Globe2 },
  { id: "search", label: "Search", icon: Search },
  { id: "crawl", label: "Crawl", icon: Cloud },
  { id: "monitor", label: "Monitor", icon: Radio }
];

const DEFAULT_FETCH_CONFIG: FetchConfigForm = {
  mode: "auto",
  stealth: true,
  timeout: 30000,
  wait: 1200,
  scrolls: 2,
  country: "us"
};

function getEffectiveSourceKind(mode: RunMode, sourceKind: SourceKind): SourceKind {
  if (mode === "search") {
    return "query";
  }
  if (mode === "extract") {
    return sourceKind === "query" ? "url" : sourceKind;
  }
  return "url";
}

function getSourceLabel(mode: RunMode, sourceKind: SourceKind, presetId: string) {
  const preset = PRESETS.find((item) => item.id === presetId);
  const effective = getEffectiveSourceKind(mode, sourceKind);

  if (preset && preset.sourceKind === effective) {
    return preset.sourceLabel;
  }

  if (effective === "query") {
    return "Search query";
  }
  if (effective === "html") {
    return "HTML";
  }
  if (effective === "markdown") {
    return "Markdown";
  }
  return "URL";
}

function getPlaceholder(mode: RunMode, sourceKind: SourceKind, presetId: string) {
  const preset = PRESETS.find((item) => item.id === presetId);
  const effective = getEffectiveSourceKind(mode, sourceKind);

  if (preset && preset.sourceKind === effective) {
    return preset.sourcePlaceholder;
  }

  if (effective === "query") {
    return "companies using AI web scraping in retail";
  }
  if (effective === "html") {
    return "<main>...</main>";
  }
  if (effective === "markdown") {
    return "# Page content";
  }
  return "https://example.com";
}

function toTextareaLines(value: string[]) {
  return value.join("\n");
}

function fromTextareaLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function extractPreview(payload: ApiEnvelope | null) {
  if (!payload?.data) {
    return "";
  }

  const data = payload.data as Record<string, any>;
  return (
    data?.results?.markdown?.data ||
    data?.results?.summary?.data ||
    data?.markdown ||
    data?.summary ||
    data?.text ||
    ""
  );
}

export default function Home() {
  const [presetId, setPresetId] = useState(DEFAULT_PRESET.id);
  const [mode, setMode] = useState<RunMode>(DEFAULT_PRESET.mode);
  const [sourceKind, setSourceKind] = useState<SourceKind>(DEFAULT_PRESET.sourceKind);
  const [source, setSource] = useState("");
  const [prompt, setPrompt] = useState(DEFAULT_PRESET.prompt);
  const [schema, setSchema] = useState(DEFAULT_PRESET.schema);
  const [formats, setFormats] = useState<ScrapeFormat[]>(DEFAULT_PRESET.formats);
  const [fetchConfig, setFetchConfig] =
    useState<FetchConfigForm>(DEFAULT_FETCH_CONFIG);
  const [numResults, setNumResults] = useState(5);
  const [searchFormat, setSearchFormat] = useState<"markdown" | "html">("markdown");
  const [timeRange, setTimeRange] = useState("");
  const [crawlMaxPages, setCrawlMaxPages] = useState(25);
  const [crawlMaxDepth, setCrawlMaxDepth] = useState(2);
  const [crawlMaxLinks, setCrawlMaxLinks] = useState(12);
  const [includePatterns, setIncludePatterns] = useState("");
  const [excludePatterns, setExcludePatterns] = useState("");
  const [monitorName, setMonitorName] = useState("Price monitor");
  const [monitorInterval, setMonitorInterval] = useState("0 * * * *");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [manageId, setManageId] = useState("");
  const [result, setResult] = useState<ApiEnvelope | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const selectedPreset = useMemo(
    () => PRESETS.find((item) => item.id === presetId) || DEFAULT_PRESET,
    [presetId]
  );

  const effectiveSourceKind = getEffectiveSourceKind(mode, sourceKind);
  const sourceLabel = getSourceLabel(mode, sourceKind, presetId);
  const sourcePlaceholder = getPlaceholder(mode, sourceKind, presetId);
  const resultText = result ? JSON.stringify(result, null, 2) : "";
  const previewText = extractPreview(result);

  function applyPreset(nextPresetId: string) {
    const next = PRESETS.find((item) => item.id === nextPresetId) || DEFAULT_PRESET;
    setPresetId(next.id);
    setMode(next.mode);
    setSourceKind(next.sourceKind);
    setPrompt(next.prompt);
    setFormats(next.formats);
    setSchema(next.schema);
    if (next.mode === "monitor") {
      setMonitorName(next.label);
    }
  }

  function updateMode(nextMode: RunMode) {
    setMode(nextMode);
    if (nextMode === "search") {
      setSourceKind("query");
    } else if (nextMode !== "extract") {
      setSourceKind("url");
    }
  }

  function toggleFormat(format: ScrapeFormat) {
    setFormats((current) =>
      current.includes(format)
        ? current.filter((item) => item !== format)
        : [...current, format]
    );
  }

  function requestBody() {
    const base = {
      sourceKind: effectiveSourceKind,
      source,
      prompt,
      schema,
      formats,
      fetchConfig,
      numResults,
      searchFormat,
      timeRange: timeRange || undefined
    };

    if (mode === "crawl") {
      return {
        action: "start",
        ...base,
        maxPages: crawlMaxPages,
        maxDepth: crawlMaxDepth,
        maxLinksPerPage: crawlMaxLinks,
        includePatterns: fromTextareaLines(includePatterns),
        excludePatterns: fromTextareaLines(excludePatterns)
      };
    }

    if (mode === "monitor") {
      return {
        action: "create",
        ...base,
        name: monitorName,
        interval: monitorInterval,
        webhookUrl: webhookUrl || undefined
      };
    }

    return {
      mode,
      ...base
    };
  }

  async function callApi(route: string, init?: RequestInit) {
    const response = await fetch(route, init);
    const data = (await response.json()) as ApiEnvelope;
    setResult(data);
    return data;
  }

  async function runPrimary() {
    const route =
      mode === "crawl" ? "/api/crawl" : mode === "monitor" ? "/api/monitor" : "/api/run";

    setBusyAction("run");
    try {
      await callApi(route, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody())
      });
    } catch (error) {
      setResult({
        status: "error",
        data: null,
        error: error instanceof Error ? error.message : "Request failed."
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function runUtility(kind: "health" | "credits" | "history" | "monitor-list") {
    setBusyAction(kind);
    try {
      if (kind === "monitor-list") {
        await callApi("/api/monitor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "list" })
        });
      } else {
        await callApi(kind === "history" ? "/api/history" : `/api/${kind}`);
      }
    } catch (error) {
      setResult({
        status: "error",
        data: null,
        error: error instanceof Error ? error.message : "Request failed."
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function manageLongRunning(
    action: "get" | "stop" | "pause" | "resume" | "delete"
  ) {
    const route = mode === "monitor" ? "/api/monitor" : "/api/crawl";
    setBusyAction(action);
    try {
      await callApi(route, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id: manageId })
      });
    } catch (error) {
      setResult({
        status: "error",
        data: null,
        error: error instanceof Error ? error.message : "Request failed."
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function copyResult() {
    if (resultText) {
      await navigator.clipboard.writeText(resultText);
    }
  }

  function downloadResult() {
    if (!resultText) {
      return;
    }

    const blob = new Blob([resultText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `scrapegraph-${mode}-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <Database size={22} aria-hidden="true" />
          </div>
          <div>
            <h1>ScrapeGraph Studio</h1>
            <p>{selectedPreset.platform}</p>
          </div>
        </div>
        <div className="topbar-actions">
          <button
            className="ghost-button"
            type="button"
            onClick={() => runUtility("health")}
            disabled={Boolean(busyAction)}
          >
            <Activity size={16} aria-hidden="true" />
            Health
          </button>
          <button
            className="ghost-button"
            type="button"
            onClick={() => runUtility("credits")}
            disabled={Boolean(busyAction)}
          >
            <Database size={16} aria-hidden="true" />
            Credits
          </button>
          <button
            className="ghost-button"
            type="button"
            onClick={() => runUtility("history")}
            disabled={Boolean(busyAction)}
          >
            <History size={16} aria-hidden="true" />
            History
          </button>
        </div>
      </header>

      <section className="workspace">
        <aside className="panel controls-panel">
          <div className="section-heading">
            <Settings2 size={18} aria-hidden="true" />
            <span>Request</span>
          </div>

          <div className="field">
            <label htmlFor="preset">Platform</label>
            <select
              id="preset"
              value={presetId}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label} - {preset.platform}
                </option>
              ))}
            </select>
          </div>

          <div className="mode-grid" role="tablist" aria-label="Run type">
            {MODES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={mode === id ? "mode-button active" : "mode-button"}
                onClick={() => updateMode(id)}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          {mode === "extract" ? (
            <div className="segmented" aria-label="Source type">
              {(["url", "html", "markdown"] as SourceKind[]).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  className={sourceKind === kind ? "active" : ""}
                  onClick={() => setSourceKind(kind)}
                >
                  {kind.toUpperCase()}
                </button>
              ))}
            </div>
          ) : null}

          <div className="field">
            <label htmlFor="source">{sourceLabel}</label>
            {effectiveSourceKind === "html" || effectiveSourceKind === "markdown" ? (
              <textarea
                id="source"
                className="source-textarea"
                value={source}
                onChange={(event) => setSource(event.target.value)}
                placeholder={sourcePlaceholder}
                spellCheck={false}
              />
            ) : (
              <input
                id="source"
                value={source}
                onChange={(event) => setSource(event.target.value)}
                placeholder={sourcePlaceholder}
              />
            )}
          </div>

          <div className="field">
            <label htmlFor="prompt">Prompt</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              spellCheck={false}
            />
          </div>

          <div className="field">
            <label htmlFor="schema">Output schema</label>
            <textarea
              id="schema"
              value={schema}
              onChange={(event) => setSchema(event.target.value)}
              placeholder='{"type":"object","properties":{}}'
              spellCheck={false}
            />
          </div>

          {mode !== "extract" && mode !== "search" ? (
            <div className="field">
              <label>Formats</label>
              <div className="checkbox-grid">
                {ALL_FORMATS.map((format) => (
                  <label key={format.id} className="check-row">
                    <input
                      type="checkbox"
                      checked={formats.includes(format.id)}
                      onChange={() => toggleFormat(format.id)}
                    />
                    <span>{format.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {mode === "search" ? (
            <div className="inline-grid three">
              <div className="field">
                <label htmlFor="num-results">Results</label>
                <input
                  id="num-results"
                  type="number"
                  min={1}
                  max={20}
                  value={numResults}
                  onChange={(event) => setNumResults(Number(event.target.value))}
                />
              </div>
              <div className="field">
                <label htmlFor="search-format">Format</label>
                <select
                  id="search-format"
                  value={searchFormat}
                  onChange={(event) =>
                    setSearchFormat(event.target.value as "markdown" | "html")
                  }
                >
                  <option value="markdown">Markdown</option>
                  <option value="html">HTML</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="time-range">Time</label>
                <select
                  id="time-range"
                  value={timeRange}
                  onChange={(event) => setTimeRange(event.target.value)}
                >
                  <option value="">Any</option>
                  <option value="past_day">Past day</option>
                  <option value="past_week">Past week</option>
                  <option value="past_month">Past month</option>
                  <option value="past_year">Past year</option>
                </select>
              </div>
            </div>
          ) : null}

          {mode === "crawl" ? (
            <>
              <div className="inline-grid three">
                <div className="field">
                  <label htmlFor="max-pages">Pages</label>
                  <input
                    id="max-pages"
                    type="number"
                    min={1}
                    max={500}
                    value={crawlMaxPages}
                    onChange={(event) => setCrawlMaxPages(Number(event.target.value))}
                  />
                </div>
                <div className="field">
                  <label htmlFor="max-depth">Depth</label>
                  <input
                    id="max-depth"
                    type="number"
                    min={1}
                    max={10}
                    value={crawlMaxDepth}
                    onChange={(event) => setCrawlMaxDepth(Number(event.target.value))}
                  />
                </div>
                <div className="field">
                  <label htmlFor="max-links">Links</label>
                  <input
                    id="max-links"
                    type="number"
                    min={1}
                    max={100}
                    value={crawlMaxLinks}
                    onChange={(event) => setCrawlMaxLinks(Number(event.target.value))}
                  />
                </div>
              </div>
              <div className="inline-grid two">
                <div className="field">
                  <label htmlFor="include-patterns">Include</label>
                  <textarea
                    id="include-patterns"
                    value={includePatterns}
                    onChange={(event) => setIncludePatterns(event.target.value)}
                    placeholder="/blog/*"
                    spellCheck={false}
                  />
                </div>
                <div className="field">
                  <label htmlFor="exclude-patterns">Exclude</label>
                  <textarea
                    id="exclude-patterns"
                    value={excludePatterns}
                    onChange={(event) => setExcludePatterns(event.target.value)}
                    placeholder="/admin/*"
                    spellCheck={false}
                  />
                </div>
              </div>
            </>
          ) : null}

          {mode === "monitor" ? (
            <>
              <div className="inline-grid two">
                <div className="field">
                  <label htmlFor="monitor-name">Name</label>
                  <input
                    id="monitor-name"
                    value={monitorName}
                    onChange={(event) => setMonitorName(event.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="monitor-interval">Cron</label>
                  <input
                    id="monitor-interval"
                    value={monitorInterval}
                    onChange={(event) => setMonitorInterval(event.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="webhook">Webhook URL</label>
                <input
                  id="webhook"
                  value={webhookUrl}
                  onChange={(event) => setWebhookUrl(event.target.value)}
                  placeholder="https://example.com/webhook"
                />
              </div>
              <button
                className="ghost-button full"
                type="button"
                onClick={() => runUtility("monitor-list")}
                disabled={Boolean(busyAction)}
              >
                <RefreshCw size={16} aria-hidden="true" />
                List monitors
              </button>
            </>
          ) : null}

          <details className="advanced">
            <summary>
              <Settings2 size={16} aria-hidden="true" />
              Fetch config
            </summary>
            <div className="inline-grid three">
              <div className="field">
                <label htmlFor="fetch-mode">Mode</label>
                <select
                  id="fetch-mode"
                  value={fetchConfig.mode}
                  onChange={(event) =>
                    setFetchConfig((current) => ({
                      ...current,
                      mode: event.target.value as FetchConfigForm["mode"]
                    }))
                  }
                >
                  <option value="auto">Auto</option>
                  <option value="fast">Fast</option>
                  <option value="js">JS</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="timeout">Timeout</label>
                <input
                  id="timeout"
                  type="number"
                  min={5000}
                  max={120000}
                  step={1000}
                  value={fetchConfig.timeout}
                  onChange={(event) =>
                    setFetchConfig((current) => ({
                      ...current,
                      timeout: Number(event.target.value)
                    }))
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="wait">Wait</label>
                <input
                  id="wait"
                  type="number"
                  min={0}
                  max={15000}
                  step={250}
                  value={fetchConfig.wait}
                  onChange={(event) =>
                    setFetchConfig((current) => ({
                      ...current,
                      wait: Number(event.target.value)
                    }))
                  }
                />
              </div>
            </div>
            <div className="inline-grid three">
              <div className="field">
                <label htmlFor="scrolls">Scrolls</label>
                <input
                  id="scrolls"
                  type="number"
                  min={0}
                  max={20}
                  value={fetchConfig.scrolls}
                  onChange={(event) =>
                    setFetchConfig((current) => ({
                      ...current,
                      scrolls: Number(event.target.value)
                    }))
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="country">Country</label>
                <input
                  id="country"
                  value={fetchConfig.country}
                  onChange={(event) =>
                    setFetchConfig((current) => ({
                      ...current,
                      country: event.target.value
                    }))
                  }
                />
              </div>
              <label className="check-row stealth">
                <input
                  type="checkbox"
                  checked={fetchConfig.stealth}
                  onChange={(event) =>
                    setFetchConfig((current) => ({
                      ...current,
                      stealth: event.target.checked
                    }))
                  }
                />
                <span>Stealth</span>
              </label>
            </div>
          </details>

          <button
            className="primary-button"
            type="button"
            onClick={runPrimary}
            disabled={Boolean(busyAction)}
          >
            {busyAction === "run" ? (
              <Loader2 className="spin" size={18} aria-hidden="true" />
            ) : (
              <Play size={18} aria-hidden="true" />
            )}
            Run {mode}
          </button>
        </aside>

        <section className="panel result-panel">
          <div className="result-header">
            <div className="section-heading">
              <FileJson size={18} aria-hidden="true" />
              <span>Result</span>
            </div>
            <div className="result-actions">
              <button
                className="icon-button"
                type="button"
                onClick={copyResult}
                disabled={!resultText}
                title="Copy result"
              >
                <Clipboard size={16} aria-hidden="true" />
              </button>
              <button
                className="icon-button"
                type="button"
                onClick={downloadResult}
                disabled={!resultText}
                title="Download result"
              >
                <Download size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          {previewText ? (
            <div className="preview">
              <div className="preview-title">Preview</div>
              <pre>{previewText}</pre>
            </div>
          ) : null}

          <pre className={result?.status === "error" ? "json-output error" : "json-output"}>
            {resultText || "{\n  \"status\": \"idle\"\n}"}
          </pre>

          {(mode === "crawl" || mode === "monitor") && (
            <div className="manage-row">
              <input
                value={manageId}
                onChange={(event) => setManageId(event.target.value)}
                placeholder={mode === "crawl" ? "Crawl id" : "Monitor id"}
              />
              <button
                className="ghost-button"
                type="button"
                onClick={() => manageLongRunning("get")}
                disabled={Boolean(busyAction)}
              >
                <RefreshCw size={16} aria-hidden="true" />
                Get
              </button>
              <button
                className="ghost-button"
                type="button"
                onClick={() => manageLongRunning(mode === "monitor" ? "pause" : "stop")}
                disabled={Boolean(busyAction)}
              >
                <Activity size={16} aria-hidden="true" />
                {mode === "monitor" ? "Pause" : "Stop"}
              </button>
              <button
                className="ghost-button"
                type="button"
                onClick={() => manageLongRunning("resume")}
                disabled={Boolean(busyAction)}
              >
                <Play size={16} aria-hidden="true" />
                Resume
              </button>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
