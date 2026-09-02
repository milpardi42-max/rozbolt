"use client";

import { usePathname } from "next/navigation";

/** Subtle fade/slide on route change — CSS only, keyed on pathname. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="anim-page">
      {children}
    </div>
  );
}
