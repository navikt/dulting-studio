"use client";

import {
  FolderIcon,
  InboxIcon,
  LayersIcon,
  LineGraphIcon,
  PackageIcon,
  TableIcon,
} from "@navikt/aksel-icons";
import { BodyShort, HStack } from "@navikt/ds-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

function getSidebarLinks(projectId: string): SidebarLink[] {
  const base = `/projects/${projectId}`;
  return [
    {
      href: base,
      label: "Innboks",
      icon: <InboxIcon aria-hidden fontSize="1.25rem" />,
    },
    {
      href: `${base}/tiltak`,
      label: "Tiltak",
      icon: <LayersIcon aria-hidden fontSize="1.25rem" />,
    },
    {
      href: `${base}/clusters`,
      label: "Klynger",
      icon: <FolderIcon aria-hidden fontSize="1.25rem" />,
    },
    {
      href: `${base}/matrix`,
      label: "Matrise",
      icon: <TableIcon aria-hidden fontSize="1.25rem" />,
    },
    {
      href: `${base}/tiltakspakke`,
      label: "Tiltakspakke",
      icon: <PackageIcon aria-hidden fontSize="1.25rem" />,
    },
    {
      href: `${base}/kontekst/brukerreise`,
      label: "Brukerreise",
      icon: <LineGraphIcon aria-hidden fontSize="1.25rem" />,
    },
  ];
}

function isActiveLink(pathname: string, href: string, basePath: string) {
  // Exact match for the project root (Innboks)
  if (href === basePath) {
    return pathname === basePath;
  }
  // Slash-boundary match: exact or starts with href + "/"
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ProjectSidebar({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const basePath = `/projects/${projectId}`;
  const links = getSidebarLinks(projectId);

  return (
    <>
      {/* Desktop sidebar */}
      <nav aria-label="Prosjektmeny" className="project-sidebar">
        <BodyShort
          size="small"
          weight="semibold"
          className="project-sidebar__title"
        >
          Prosjektrom
        </BodyShort>
        <ul className="project-sidebar__list">
          {links.map((link) => {
            const active = isActiveLink(pathname, link.href, basePath);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`project-sidebar__link${active ? " project-sidebar__link--active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <HStack gap="space-8" align="center" wrap={false}>
                    {link.icon}
                    <span>{link.label}</span>
                  </HStack>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile horizontal nav */}
      <nav aria-label="Prosjektmeny" className="project-mobile-nav">
        <ul className="project-mobile-nav__list">
          {links.map((link) => {
            const active = isActiveLink(pathname, link.href, basePath);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`project-mobile-nav__link${active ? " project-mobile-nav__link--active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <HStack gap="space-4" align="center" wrap={false}>
                    {link.icon}
                    <span>{link.label}</span>
                  </HStack>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
