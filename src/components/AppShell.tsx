"use client";

import { Heading } from "@navikt/ds-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

// Slank toppnav: merket (→ forsiden) + to toppnivå-innganger, Brukerreise og
// Analyse. Bevisst holdt lett så den ikke bryter brukerreisenes immersive verden.
// Pipeline-en (Prosjekter → import/inbox/studio) er fortsatt ute av navigasjonen
// (DB-rutene ikke provisjonert i prod); koden/rutene består og nås via URL.
const ANALYSE_PREFIXES = [
  "/atferdsmatrise",
  "/tiltakskart",
  "/tiltakspakke-utvelgelse",
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const brukerreiseActive = pathname.startsWith("/brukerreise");
  const analyseActive = ANALYSE_PREFIXES.some((p) => pathname.startsWith(p));
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <Heading level="1" size="small" as="span">
            <NextLink href="/" className="app-header__brand">
              dulting-studio
            </NextLink>
          </Heading>
          <nav className="app-nav" aria-label="Hovednavigasjon">
            <NextLink
              href="/brukerreise/sammen"
              className={`app-nav__link${
                brukerreiseActive ? " app-nav__link--active" : ""
              }`}
              aria-current={brukerreiseActive ? "page" : undefined}
            >
              Brukerreise
            </NextLink>
            <NextLink
              href="/atferdsmatrise"
              className={`app-nav__link${
                analyseActive ? " app-nav__link--active" : ""
              }`}
              aria-current={analyseActive ? "page" : undefined}
            >
              Analyse
            </NextLink>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}
