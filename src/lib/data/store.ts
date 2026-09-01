import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { seedContent } from "./seed";
import type { CollectionKey, SiteContent } from "../types";

const FILE = path.join(process.cwd(), "data", "content.json");

/**
 * Local-first content store.
 * Reads admin overrides from data/content.json (git-ignored) and falls back to the seed.
 * Swap this module for a real database/API without touching the UI layer.
 */
export async function getContent(): Promise<SiteContent> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<SiteContent>;
    return { ...seedContent, ...parsed };
  } catch {
    return seedContent;
  }
}

export async function saveContent(next: SiteContent): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(next, null, 2), "utf8");
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
  try {
    await fs.unlink(FILE);
  } catch {
    /* nothing to reset */
  }
}
