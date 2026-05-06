# ScrapeGraph Vercel Studio

A Vercel-ready Next.js app that wraps the ScrapeGraphAI hosted API with a focused scraper workspace.

## What it supports

- Extract structured data from a URL, pasted HTML, or pasted markdown.
- Scrape URLs into markdown, HTML, links, images, summaries, branding data, JSON, or screenshots.
- Search the web and optionally extract data from results.
- Start crawls, create monitors, check credits, and inspect request history.
- Use presets for common targets like ecommerce, company pages, articles, jobs, real estate, public profiles, and search.

The app uses `scrapegraph-js`, the official ScrapeGraphAI JavaScript SDK. This keeps the deployment Vercel-friendly; the browser rendering and AI extraction run through ScrapeGraphAI's API instead of bundling the full Python Playwright pipeline into serverless functions.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add your key to `.env.local`:

```bash
SGAI_API_KEY=sgai_xxx
```

Open `http://localhost:3000`.

## Deploy to Vercel

Set the project root to:

```text
apps/scrapegraph-vercel
```

Add the same `SGAI_API_KEY` environment variable in Vercel. Increase function duration in `vercel.json` if your plan supports longer scraping requests.
