"use client";

import {
  FolderIcon,
  LineGraphIcon,
  TableIcon,
  UploadIcon,
} from "@navikt/aksel-icons";
import { Link as AkselLink, Heading, HStack } from "@navikt/ds-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    href: "/projects",
    label: "Prosjekter",
    icon: <FolderIcon aria-hidden fontSize="1.25rem" />,
  },
  {
    href: "/projects/import",
    label: "Importer Mural",
    icon: <UploadIcon aria-hidden fontSize="1.25rem" />,
  },
  {
    href: "/brukerreise",
    label: "Brukerreise",
    icon: <LineGraphIcon aria-hidden fontSize="1.25rem" />,
  },
  {
    href: "/tiltakskart",
    label: "Tiltakskart",
    icon: <TableIcon aria-hidden fontSize="1.25rem" />,
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

          <nav aria-label="Hovednavigasjon">
            <HStack as="ul" gap="space-16" className="app-nav">
              {navItems.map((item) => {
                const isExactMatch = pathname === item.href;
                const isSection = pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <AkselLink
                      as={NextLink}
                      href={item.href}
                      className={`app-nav__link${isSection ? " app-nav__link--active" : ""}`}
                      aria-current={isExactMatch ? "page" : undefined}
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
