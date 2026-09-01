"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/components/providers/AppProviders";
import { Chips } from "@/components/ui/Tabs";
import { Reveal } from "@/components/ui/Reveal";
import { EmptyState } from "@/components/ui/States";
import { BentoGrid, bentoSpan } from "@/components/ui/BentoGrid";
import { PortfolioCard, type PortfolioCardData } from "@/components/cards/PortfolioCard";
import { t } from "@/lib/utils";
import type { Category } from "@/lib/types";

/** Editorial masonry/bento with category filtering; size cycle keeps composition intentional. */
export function PortfolioGrid({ items, categories }: { items: PortfolioCardData[]; categories: Category[] }) {
  const { locale, dict } = useLocale();
  const [cat, setCat] = useState("all");
  const list = useMemo(() => (cat === "all" ? items : items.filter((i) => i.categoryId === cat)), [items, cat]);
  const cycle: (keyof typeof bentoSpan)[] = ["hero", "tall", "square", "wide", "tall", "square"];
  return (
    <div>
      <Chips items={categories.map((c) => ({ id: c.id, label: t(c.name, locale) }))} value={cat} onChange={setCat} allLabel={dict.common.all} />
      <div key={cat} className="mt-8">
        {list.length ? (
          <BentoGrid rows="auto-rows-[240px] md:auto-rows-[300px]">
            {list.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 70} className={bentoSpan[cycle[i % cycle.length]]}>
                <PortfolioCard item={p} priority={i < 2} className="h-full" />
              </Reveal>
            ))}
          </BentoGrid>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
