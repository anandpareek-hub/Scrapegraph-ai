import type { Preset } from "./types";

export const PRESETS: Preset[] = [
  {
    id: "custom-url",
    label: "Custom URL",
    platform: "Any website",
    mode: "extract",
    sourceKind: "url",
    sourceLabel: "URL",
    sourcePlaceholder: "https://example.com",
    prompt:
      "Extract the main entities, important facts, dates, prices, contact details, and links from this page.",
    formats: ["markdown", "links"],
    schema: ""
  },
  {
    id: "company-site",
    label: "Company",
    platform: "Website",
    mode: "extract",
    sourceKind: "url",
    sourceLabel: "Company URL",
    sourcePlaceholder: "https://company.com",
    prompt:
      "Extract company description, products, pricing signals, founders or leadership, contact emails, social links, and calls to action.",
    formats: ["markdown", "links", "summary"],
    schema: `{
  "type": "object",
  "properties": {
    "company": { "type": "string" },
    "description": { "type": "string" },
    "products": { "type": "array", "items": { "type": "string" } },
    "contacts": { "type": "array", "items": { "type": "string" } },
    "socialLinks": { "type": "array", "items": { "type": "string" } }
  }
}`
  },
  {
    id: "product-page",
    label: "Product Page",
    platform: "Ecommerce",
    mode: "extract",
    sourceKind: "url",
    sourceLabel: "Product URL",
    sourcePlaceholder: "https://store.com/product",
    prompt:
      "Extract product name, brand, price, currency, availability, rating, review count, variants, image URLs, specifications, and seller details.",
    formats: ["markdown", "images", "json"],
    schema: `{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "brand": { "type": "string" },
    "price": { "type": "string" },
    "currency": { "type": "string" },
    "availability": { "type": "string" },
    "rating": { "type": "string" },
    "images": { "type": "array", "items": { "type": "string" } },
    "specifications": { "type": "object" }
  }
}`
  },
  {
    id: "listing-page",
    label: "Listing",
    platform: "Marketplace",
    mode: "scrape",
    sourceKind: "url",
    sourceLabel: "Listing URL",
    sourcePlaceholder: "https://marketplace.com/search?q=...",
    prompt:
      "Extract every visible listing with title, price, currency, rating, seller, product URL, image URL, and availability.",
    formats: ["markdown", "links", "images", "json"],
    schema: `{
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "title": { "type": "string" },
          "price": { "type": "string" },
          "url": { "type": "string" },
          "image": { "type": "string" }
        }
      }
    }
  }
}`
  },
  {
    id: "article",
    label: "Article",
    platform: "News or blog",
    mode: "extract",
    sourceKind: "url",
    sourceLabel: "Article URL",
    sourcePlaceholder: "https://publisher.com/article",
    prompt:
      "Extract title, author, publication date, summary, key claims, named people, organizations, locations, quotes, and outbound links.",
    formats: ["markdown", "summary", "links"],
    schema: ""
  },
  {
    id: "search-research",
    label: "Search",
    platform: "Web search",
    mode: "search",
    sourceKind: "query",
    sourceLabel: "Search query",
    sourcePlaceholder: "best AI coding agents for product teams",
    prompt:
      "Extract a concise comparison with source URLs, key claims, dates, pricing signals, and notable differences.",
    formats: ["markdown"],
    schema: ""
  },
  {
    id: "jobs",
    label: "Jobs",
    platform: "Job board",
    mode: "extract",
    sourceKind: "url",
    sourceLabel: "Job URL",
    sourcePlaceholder: "https://jobs.example.com/role",
    prompt:
      "Extract role title, company, location, remote policy, compensation, seniority, responsibilities, requirements, benefits, and apply link.",
    formats: ["markdown", "links", "json"],
    schema: ""
  },
  {
    id: "real-estate",
    label: "Real Estate",
    platform: "Property listing",
    mode: "extract",
    sourceKind: "url",
    sourceLabel: "Property URL",
    sourcePlaceholder: "https://realestate.example.com/listing",
    prompt:
      "Extract address, price, bedrooms, bathrooms, area, lot size, listing agent, amenities, photos, fees, and listing status.",
    formats: ["markdown", "images", "json"],
    schema: ""
  },
  {
    id: "public-profile",
    label: "Public Profile",
    platform: "Social or creator page",
    mode: "extract",
    sourceKind: "url",
    sourceLabel: "Public URL",
    sourcePlaceholder: "https://platform.com/profile",
    prompt:
      "Extract public profile name, bio, headline, follower or subscriber counts if visible, public links, recent public posts, and contact links.",
    formats: ["markdown", "links", "images"],
    schema: ""
  },
  {
    id: "docs",
    label: "Docs",
    platform: "Documentation",
    mode: "crawl",
    sourceKind: "url",
    sourceLabel: "Docs URL",
    sourcePlaceholder: "https://docs.example.com",
    prompt:
      "Collect documentation pages and preserve headings, code examples, links, and important API details.",
    formats: ["markdown", "links"],
    schema: ""
  },
  {
    id: "price-monitor",
    label: "Price Monitor",
    platform: "Ecommerce monitor",
    mode: "monitor",
    sourceKind: "url",
    sourceLabel: "Product URL",
    sourcePlaceholder: "https://store.com/product",
    prompt:
      "Track price, availability, seller, shipping information, visible coupons, and review count.",
    formats: ["markdown", "json"],
    schema: ""
  }
];

export const DEFAULT_PRESET = PRESETS[0];

export const ALL_FORMATS = [
  { id: "markdown", label: "Markdown" },
  { id: "html", label: "HTML" },
  { id: "links", label: "Links" },
  { id: "images", label: "Images" },
  { id: "summary", label: "Summary" },
  { id: "json", label: "JSON" },
  { id: "branding", label: "Branding" },
  { id: "screenshot", label: "Screenshot" }
] as const;
