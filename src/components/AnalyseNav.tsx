"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";

// Delt sekundærnavigasjon på tvers av de fire analyse-/referansesidene, så de
// oppleves som ett sammenhengende sett og brukeren beholder stedsfølelsen.
const LINKS = [
  { href: "/atferdsmatrise", label: "Atferdsmatrise" },
  { href: "/tiltakskart", label: "Tiltakskart · arbeidsgiver" },
  { href: "/tiltakskart/sykmeldt", label: "Tiltakskart · sykmeldt" },
  { href: "/tiltakspakke-utvelgelse", label: "Utvelgelse" },
];

export function AnalyseNav() {
  const pathname = usePathname();
  return (
    <nav className="analyse-nav" aria-label="Analyse-sider">
      {LINKS.map((l) => {
        const active = pathname === l.href;
        return (
          <NextLink
            key={l.href}
            href={l.href}
            className={`analyse-nav__tab${
              active ? " analyse-nav__tab--active" : ""
            }`}
            aria-current={active ? "page" : undefined}
          >
            {l.label}
          </NextLink>
        );
      })}
    </nav>
  );
}
