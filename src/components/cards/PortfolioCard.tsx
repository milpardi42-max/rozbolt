"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLocale } from "@/components/providers/AppProviders";
import { cn, faNum, href, t } from "@/lib/utils";
import type { Artist, Category, Portfolio } from "@/lib/types";

export interface PortfolioCardData extends Portfolio {
  artist: Artist | null;
  category: Category | null;
}

/** Editorial card: full-bleed image, typography overlay. Size drives grid spans in BentoGrid. */
export function PortfolioCard({ item, className, priority, overlay = true }: { item: PortfolioCardData; className?: string; priority?: boolean; overlay?: boolean }) {
  const { locale, dict } = useLocale();
  const url = href(locale, `/portfolio/${item.slug}`);
  return (
    <Link href={url} className={cn("group relative block h-full min-h-[280px] overflow-hidden rounded-lg bg-background-secondary", className)}>
      <Image src={item.cover} alt={t(item.title, locale)} fill priority={priority} sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 40vw" className="img-zoom object-cover" />
      {overlay && <div className="absolute inset-0 vignette" />}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 text-white/80">
        <span className="text-label text-white/70">{item.category ? t(item.category.name, locale) : ""}</span>
        <span className="text-caption tabular">{locale === "fa" ? faNum(item.year) : item.year}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-6">
        <div className="min-w-0 text-white">
          <p className="text-caption text-white/70">{item.artist ? t(item.artist.name, locale) : dict.brand} · {t(item.location, locale)}</p>
          <h3 className="mt-1 font-display text-h3 leading-tight text-balance">{t(item.title, locale)}</h3>
          <p className="mt-1 line-clamp-1 text-body-sm text-white/75">{t(item.subtitle, locale)}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full glass text-white/90 transition-transform duration-300 group-hover:scale-105">
          <ArrowUpRight className="h-4 w-4 rtl-flip arrow-shift" />
        </span>
      </div>
    </Link>
  );
}
