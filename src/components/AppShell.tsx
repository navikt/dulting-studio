"use client";

import { Heading } from "@navikt/ds-react";
import NextLink from "next/link";

// Bevisst minimalt toppnav: kun merket (→ forsiden). Pipeline-en (Prosjekter →
// import/inbox/studio) er midlertidig tatt ut av navigasjonen for å holde fokus
// på det viktigste nå — brukerreiser, analyse og tiltakspakke-beslutninger — og
// fordi DB-rutene (/projects, /api/projects/*) ikke er provisjonert i prod. Koden
// og rutene består (nås via URL); legg tilbake et nav-item når DB er på plass.
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <Heading level="1" size="small" as="span">
            <NextLink href="/" className="app-header__brand">
              dulting-studio
            </NextLink>
          </Heading>
        </div>
      </header>

      <main className="app-main">
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}
