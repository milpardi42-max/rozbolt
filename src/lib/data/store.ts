import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { seedContent } from "./seed";
import type { CollectionKey, SiteContent } from "../types";

/**
 * Content store with pluggable persistence — the UI never touches this directly.
 *
 *  1. Upstash Redis  (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)  → durable, ideal for Vercel
 *  2. Vercel Blob    (BLOB_READ_WRITE_TOKEN)                               → durable, ideal for Vercel
 *  3. Local file     data/content.json                                     → dev / VPS / Docker volume
 *
 * The first configured backend wins. Admin edits go live immediately (all pages are dynamic).
 */

const KEY = "rosie-atelier:content";
const BLOB_PATH = "rosie-atelier/content.json";
const FILE = path.join(process.cwd(), "data", "content.json");

/* ---------- backend: Upstash Redis (REST, no SDK) ---------- */
const redis = {
  enabled: () => Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
  async cmd(args: string[]) {
    const r = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}`, {
      method: "POST",
      headers: { authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`, "content-type": "application/json" },
      body: JSON.stringify(args),
      cache: "no-store",
    });
    if (!r.ok) throw new Error(`redis ${r.status}`);
    return (await r.json()) as { result: unknown };
  },
  async read() {
    const { result } = await this.cmd(["GET", KEY]);
    return typeof result === "string" ? result : null;
  },
  async write(json: string) {
    await this.cmd(["SET", KEY, json]);
  },
  async remove() {
    await this.cmd(["DEL", KEY]);
  },
};

/* ---------- backend: Vercel Blob (REST, no SDK) ---------- */
const blob = {
  enabled: () => Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  token: () => process.env.BLOB_READ_WRITE_TOKEN as string,
  url: null as string | null,
  async locate(): Promise<string | null> {
    const r = await fetch(`https://blob.vercel-storage.com?prefix=${encodeURIComponent(BLOB_PATH)}&limit=1`, {
      headers: { authorization: `Bearer ${this.token()}` },
      cache: "no-store",
    });
    if (!r.ok) return null;
    const data = (await r.json()) as { blobs?: { url: string; pathname: string }[] };
    const hit = data.blobs?.find((b) => b.pathname === BLOB_PATH);
    return hit?.url ?? null;
  },
  async read() {
    const url = this.url ?? (await this.locate());
    if (!url) return null;
    this.url = url;
    const r = await fetch(url, { cache: "no-store" });
    return r.ok ? r.text() : null;
  },
  async write(json: string) {
    const r = await fetch(`https://blob.vercel-storage.com/${BLOB_PATH}`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${this.token()}`,
        "x-api-version": "7",
        "x-add-random-suffix": "0",
        "x-allow-overwrite": "1",
        "x-cache-control-max-age": "0",
        "content-type": "application/json",
      },
      body: json,
    });
    if (!r.ok) throw new Error(`blob ${r.status}`);
    const data = (await r.json()) as { url: string };
    this.url = data.url;
  },
  async remove() {
    const url = this.url ?? (await this.locate());
    if (!url) return;
    await fetch("https://blob.vercel-storage.com/delete", {
      method: "POST",
      headers: { authorization: `Bearer ${this.token()}`, "x-api-version": "7", "content-type": "application/json" },
      body: JSON.stringify({ urls: [url] }),
    });
    this.url = null;
  },
};

/* ---------- backend: local file ---------- */
const file = {
  async read() {
    try {
      return await fs.readFile(FILE, "utf8");
    } catch {
      return null;
    }
  },
  async write(json: string) {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, json, "utf8");
  },
  async remove() {
    try {
      await fs.unlink(FILE);
    } catch {
      /* nothing to reset */
    }
  },
};

function backend() {
  if (redis.enabled()) return redis;
  if (blob.enabled()) return blob;
  return file;
}

export function storeBackendName(): "redis" | "blob" | "file" {
  return redis.enabled() ? "redis" : blob.enabled() ? "blob" : "file";
}

/* ---------- public API ---------- */
export async function getContent(): Promise<SiteContent> {
  try {
    const raw = await backend().read();
    if (!raw) return seedContent;
    const parsed = JSON.parse(raw) as Partial<SiteContent>;
    return { ...seedContent, ...parsed };
  } catch {
    return seedContent;
  }
}

export async function saveContent(next: SiteContent): Promise<void> {
  await backend().write(JSON.stringify(next, null, 2));
}

export async function updateCollection<K extends CollectionKey>(key: K, items: SiteContent[K]) {
  const current = await getContent();
  await saveContent({ ...current, [key]: items });
}

export async function updateHero(hero: SiteContent["hero"]) {
  const current = await getContent();
  await saveContent({ ...current, hero });
}

export async function resetContent() {
  await backend().remove();
}
