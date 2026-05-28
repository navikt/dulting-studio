"use client";

import { FolderIcon, InboxIcon, TableIcon } from "@navikt/aksel-icons";
import {
  Link as AkselLink,
  BodyShort,
  HStack,
  type SortState,
  Table,
  Tag,
  VStack,
} from "@navikt/ds-react";
import NextLink from "next/link";

export type Project = {
  id: string;
  name: string;
  sourceDescription: string | null;
  importedAt: string | null;
  latestImportStatus: string | null;
  widgetCount: number;
};

export type SortField = "name" | "importedAt" | "widgetCount";
export type SortOrder = "asc" | "desc";

type ProjectListProps = {
  projects: Project[];
  sort: SortField;
  order: SortOrder;
  onSort: (field: SortField) => void;
};

function toAkselSort(sort: SortField, order: SortOrder): SortState {
  return {
    orderBy: sort,
    direction: order === "asc" ? "ascending" : "descending",
  };
}

function formatDate(isoDate: string | null): string {
  if (!isoDate) return "–";
  try {
    return new Intl.DateTimeFormat("nb-NO", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoDate));
  } catch {
    return "–";
  }
}

function StatusTag({ status }: { status: string | null }) {
  switch (status) {
    case "completed":
      return (
        <Tag variant="success" size="small">
          Fullført
        </Tag>
      );
    case "processing":
      return (
        <Tag variant="info" size="small">
          Behandles
        </Tag>
      );
    case "pending":
      return (
        <Tag variant="neutral" size="small">
          Venter
        </Tag>
      );
    case "failed":
      return (
        <Tag variant="error" size="small">
          Feilet
        </Tag>
      );
    default:
      return (
        <Tag variant="neutral" size="small">
          Ukjent
        </Tag>
      );
  }
}

export function ProjectList({
  projects,
  sort,
  order,
  onSort,
}: ProjectListProps) {
  const handleSortChange = (sortKey: string) => {
    onSort(sortKey as SortField);
  };

  return (
    <div className="project-list-wrapper">
      <Table sort={toAkselSort(sort, order)} onSortChange={handleSortChange}>
        <caption className="navds-sr-only">
          Oversikt over importerte Mural-prosjekter
        </caption>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader sortable sortKey="name" scope="col">
              Prosjektnavn
            </Table.ColumnHeader>
            <Table.HeaderCell scope="col">Kilde</Table.HeaderCell>
            <Table.ColumnHeader sortable sortKey="importedAt" scope="col">
              Importert
            </Table.ColumnHeader>
            <Table.HeaderCell scope="col">Status</Table.HeaderCell>
            <Table.ColumnHeader sortable sortKey="widgetCount" scope="col">
              Widgets
            </Table.ColumnHeader>
            <Table.HeaderCell scope="col">
              <span className="navds-sr-only">Handlinger</span>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {projects.map((project) => (
            <Table.Row key={project.id}>
              <Table.HeaderCell scope="row">
                <HStack gap="space-8" align="center" wrap={false}>
                  <FolderIcon aria-hidden fontSize="1.25rem" />
                  <VStack gap="space-2">
                    <AkselLink as={NextLink} href={`/projects/${project.id}`}>
                      {project.name}
                    </AkselLink>
                  </VStack>
                </HStack>
              </Table.HeaderCell>
              <Table.DataCell>
                <BodyShort size="small" className="project-source">
                  {project.sourceDescription || "–"}
                </BodyShort>
              </Table.DataCell>
              <Table.DataCell>
                <BodyShort size="small">
                  {formatDate(project.importedAt)}
                </BodyShort>
              </Table.DataCell>
              <Table.DataCell>
                <StatusTag status={project.latestImportStatus} />
              </Table.DataCell>
              <Table.DataCell>
                <BodyShort size="small">{project.widgetCount}</BodyShort>
              </Table.DataCell>
              <Table.DataCell>
                <HStack gap="space-8" align="center">
                  <AkselLink
                    as={NextLink}
                    href={`/projects/${project.id}`}
                    aria-label={`Åpne innboks for ${project.name}`}
                  >
                    <InboxIcon aria-hidden fontSize="1rem" />
                  </AkselLink>
                  <AkselLink
                    as={NextLink}
                    href={`/projects/${project.id}/matrix`}
                    aria-label={`Åpne matrise for ${project.name}`}
                  >
                    <TableIcon aria-hidden fontSize="1rem" />
                  </AkselLink>
                </HStack>
              </Table.DataCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
