"use client";

import { FolderIcon } from "@navikt/aksel-icons";
import { Link as AkselLink, Heading, HStack } from "@navikt/ds-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

// Slim toppnav (4a): «Importer Mural» er tatt ut av den persistente baren —
// det er en sjelden handling (fortsatt tilgjengelig på /projects/import), og
// på sikt trolig unødvendig. Med ett prosjekt holder det med «Prosjekter».
const navItems: NavItem[] = [
  {
    href: "/projects",
    label: "Prosjekter",
    icon: <FolderIcon aria-hidden fontSize="1.25rem" />,
  },
];

function isActiveNavItem(pathname: string, href: string) {
  if (href === "/projects") {
    return (
      pathname === href ||
      (pathname.startsWith("/projects/") &&
        pathname !== "/projects/import" &&
        !pathname.startsWith("/projects/import/"))
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

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

          <nav aria-label="Hovednavigasjon">
            <HStack as="ul" gap="space-16" className="app-nav">
              {navItems.map((item) => {
                const isActive = isActiveNavItem(pathname, item.href);

                return (
                  <li key={item.href}>
                    <AkselLink
                      as={NextLink}
                      href={item.href}
                      className={`app-nav__link${isActive ? " app-nav__link--active" : ""}`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <HStack gap="space-4" align="center">
                        {item.icon}
                        {item.label}
                      </HStack>
                    </AkselLink>
                  </li>
                );
              })}
            </HStack>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}
