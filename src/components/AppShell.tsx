"use client";

import { Heading } from "@navikt/ds-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

// Flat toppnav: merket (→ forsiden) + de tre toppnivå-innganger i fortelle-
// rekkefølge — Tiltakskart, Brukerreise, Utvelgelse. Atferdsmatrisen (rådata)
// og den sammenslåtte reisen er bevisst nedtonet til forsidens «mer å utforske»
// og nås via URL. Pipeline-en (Prosjekter → import/inbox/studio) er fortsatt
// ute av navigasjonen (DB-rutene ikke provisjonert i prod); koden/rutene består.
const NAV = [
  { href: "/tiltakskart", label: "Tiltakskart", prefix: "/tiltakskart" },
  { href: "/brukerreise/leder", label: "Brukerreise", prefix: "/brukerreise" },
  {
    href: "/tiltakspakke-utvelgelse",
    label: "Utvelgelse",
    prefix: "/tiltakspakke-utvelgelse",
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
            {NAV.map((item) => {
              const active = pathname.startsWith(item.prefix);
              return (
                <NextLink
                  key={item.href}
                  href={item.href}
                  className={`app-nav__link${
                    active ? " app-nav__link--active" : ""
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </NextLink>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="app-main">
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}
