import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/lib/i18n/types";
import { dictionaries } from "@/lib/i18n/dictionary";
import { faNum, href, t } from "@/lib/utils";
import type { PortfolioCardData } from "@/components/cards/PortfolioCard";

/** Full-bleed cinematic hero for the portfolio index (server component). */
export function PortfolioHero({ item, locale, eyebrow, title, description }: { item: PortfolioCardData; locale: Locale; eyebrow: string; title: string; description: string }) {
  const d = dictionaries[locale];
  return (
    <section className="relative isolate h-[86svh] min-h-[560px] overflow-hidden bg-[#0d1117] text-white">
      <Image src={item.cover} alt={t(item.title, locale)} fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d13]/95 via-[#0a0d13]/40 to-[#0a0d13]/30" />
      <div className="container-x relative flex h-full flex-col justify-end pb-12 pt-[var(--header-h)]">
        <p className="anim-blur-in text-label text-white/70">{eyebrow}</p>
        <h1 className="anim-blur-in mt-4 max-w-3xl font-display text-display text-balance" style={{ animationDelay: "100ms" }}>{title}</h1>
        <p className="anim-blur-in mt-4 max-w-xl text-body-lg text-white/75" style={{ animationDelay: "200ms" }}>{description}</p>
        <Link href={href(locale, `/portfolio/${item.slug}`)} className="anim-fade-up group mt-10 flex w-full max-w-xl items-center justify-between gap-4 rounded-lg glass !bg-white/10 !border-white/15 p-4 transition-colors hover:!bg-white/15" style={{ animationDelay: "320ms" }}>
          <div className="flex items-center gap-4">
            <span className="relative h-14 w-14 overflow-hidden rounded-md"><Image src={item.gallery[1] ?? item.cover} alt="" fill sizes="56px" className="object-cover" /></span>
            <div>
              <p className="text-caption text-white/60">{d.common.featured} · {item.artist ? t(item.artist.name, locale) : d.brand} · {locale === "fa" ? faNum(item.year) : item.year}</p>
              <p className="font-display text-h3">{t(item.title, locale)}</p>
            </div>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black"><ArrowUpRight className="h-4 w-4 rtl-flip arrow-shift" /></span>
        </Link>
      </div>
    </section>
  );
}
