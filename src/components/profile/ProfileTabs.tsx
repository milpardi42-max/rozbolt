"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useLocale } from "@/components/providers/AppProviders";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/States";
import { PatternCard, type PatternCardData } from "@/components/cards/PatternCard";
import { ProductCard, type ProductCardData } from "@/components/cards/ProductCard";
import { PortfolioCard, type PortfolioCardData } from "@/components/cards/PortfolioCard";
import { EducationCard, type EducationCardData } from "@/components/cards/EducationCard";
import { BentoGrid, bentoSpan } from "@/components/ui/BentoGrid";
import { StyleCard } from "@/components/cards/StyleCard";
import { faNum, href, t } from "@/lib/utils";
import type { Collection } from "@/lib/types";

interface Props {
  portfolios: PortfolioCardData[];
  patterns: PatternCardData[];
  products: ProductCardData[];
  education: EducationCardData[];
  collections: Collection[];
  reviews: { name: string; text: string; rating: number }[];
}

export function ProfileTabs({ portfolios, patterns, products, education, collections, reviews }: Props) {
  const { locale, dict } = useLocale();
  const tabs = [
    { id: "portfolio", label: dict.nav.portfolio, count: portfolios.length },
    { id: "patterns", label: dict.nav.patterns, count: patterns.length },
    { id: "products", label: dict.common.products, count: products.length },
    { id: "projects", label: dict.common.projects, count: portfolios.filter((p) => p.isProject).length },
    { id: "collections", label: dict.nav.collections, count: collections.length },
    { id: "education", label: dict.nav.education, count: education.length },
    { id: "reviews", label: dict.common.reviews, count: reviews.length },
  ];
  const [tab, setTab] = useState(portfolios.length ? "portfolio" : "patterns");

  return (
    <div className="container-x mt-12">
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      <div key={tab} className="anim-fade-up py-10">
        {tab === "portfolio" && (portfolios.length ? <BentoGrid>{portfolios.map((p, i) => <div key={p.id} className={bentoSpan[i === 0 ? "hero" : p.size === "hero" ? "wide" : p.size]}><PortfolioCard item={p} /></div>)}</BentoGrid> : <EmptyState />)}
        {tab === "projects" && (portfolios.filter((p) => p.isProject).length ? <div className="grid gap-5 md:grid-cols-2">{portfolios.filter((p) => p.isProject).map((p) => <div key={p.id} className="aspect-[16/10]"><PortfolioCard item={p} /></div>)}</div> : <EmptyState />)}
        {tab === "patterns" && (patterns.length ? <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">{patterns.map((p) => <PatternCard key={p.id} pattern={p} />)}</div> : <EmptyState />)}
        {tab === "products" && (products.length ? <div className="grid gap-5 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div> : <EmptyState />)}
        {tab === "collections" && (collections.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{collections.map((c) => <StyleCard key={c.id} href={href(locale, `/collections/${c.slug}`)} title={t(c.title, locale)} description={t(c.description, locale)} image={c.cover} className="aspect-[4/3]" />)}</div> : <EmptyState />)}
        {tab === "education" && (education.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{education.map((e) => <EducationCard key={e.id} item={e} />)}</div> : <EmptyState />)}
        {tab === "reviews" && (
          <ul className="grid gap-4 md:grid-cols-2">
            {reviews.map((r, i) => (
              <li key={i} className="rounded-lg border border-border p-5">
                <div className="flex items-center justify-between"><p className="font-medium">{r.name}</p><span className="inline-flex gap-0.5">{Array.from({ length: 5 }).map((_, k) => <Star key={k} className={`h-3.5 w-3.5 ${k < r.rating ? "fill-accent text-accent" : "text-border"}`} />)}</span></div>
                <p className="mt-2 text-body-sm text-foreground-secondary">{r.text}</p>
                <p className="mt-2 text-caption text-muted tabular">{locale === "fa" ? faNum(2026 - i) : 2026 - i}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
