"use client";

import { ChevronDownIcon } from "@navikt/aksel-icons";
import { ActionMenu, Heading } from "@navikt/ds-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

// Én samlet toppnav (mini-menyen «analyse-nav» er fjernet). Artefakt-først i
// fortelle-rekkefølge, med begge aktører ett nivå ned: Tiltakskart og
// Brukerreise er nedtrekk (Arbeidsgiver / Den sykmeldte), Utvelgelse og
// Atferdsmatrise er direkte lenker. Pipeline-en (Prosjekter → import/inbox/
// studio) er fortsatt ute av navet (DB-rutene ikke provisjonert i prod).
const TILTAKSKART = [
  { href: "/tiltakskart", label: "Arbeidsgiver" },
  { href: "/tiltakskart/sykmeldt", label: "Den sykmeldte" },
];
const BRUKERREISE = [
  { href: "/brukerreise/leder", label: "Arbeidsgiver" },
  { href: "/brukerreise/sykmeldt", label: "Den sykmeldte" },
  { href: "/brukerreise/sammen", label: "Begge spor" },
];

function NavMenu({
  label,
  items,
  active,
  pathname,
}: {
  label: string;
  items: { href: string; label: string }[];
  active: boolean;
  pathname: string;
}) {
  return (
    <ActionMenu>
      <ActionMenu.Trigger>
        <button
          type="button"
          className={`app-nav__link app-nav__trigger${
            active ? " app-nav__link--active" : ""
          }`}
        >
          {label}
          {active && <span className="sr-only"> (gjeldende seksjon)</span>}
          <ChevronDownIcon aria-hidden className="app-nav__chev" />
        </button>
      </ActionMenu.Trigger>
      <ActionMenu.Content>
        {items.map((it) => {
          const current = pathname === it.href;
          return (
            <ActionMenu.Item
              key={it.href}
              as={NextLink}
              href={it.href}
              aria-current={current ? "page" : undefined}
            >
              {it.label}
              {current && <span className="sr-only"> (gjeldende)</span>}
            </ActionMenu.Item>
          );
        })}
      </ActionMenu.Content>
    </ActionMenu>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const utvelgelseActive = pathname.startsWith("/tiltakspakke-utvelgelse");
  const matriseActive = pathname.startsWith("/atferdsmatrise");
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
            <NavMenu
              label="Tiltakskart"
              items={TILTAKSKART}
              active={pathname.startsWith("/tiltakskart")}
              pathname={pathname}
            />
            <NavMenu
              label="Brukerreise"
              items={BRUKERREISE}
              active={pathname.startsWith("/brukerreise")}
              pathname={pathname}
            />
            <NextLink
              href="/tiltakspakke-utvelgelse"
              title="Hvilke tiltak skal med i første pakke"
              className={`app-nav__link${
                utvelgelseActive ? " app-nav__link--active" : ""
              }`}
              aria-current={utvelgelseActive ? "page" : undefined}
            >
              Utvelgelse
            </NextLink>
            <NextLink
              href="/atferdsmatrise"
              title="Tiltak plottet på barriere × motivasjon"
              className={`app-nav__link${
                matriseActive ? " app-nav__link--active" : ""
              }`}
              aria-current={matriseActive ? "page" : undefined}
            >
              Atferdsmatrise
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
