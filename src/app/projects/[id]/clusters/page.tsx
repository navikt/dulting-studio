"use client";

import { ArrowLeftIcon } from "@navikt/aksel-icons";
import {
  BodyShort,
  Button,
  Heading,
  HStack,
  Loader,
  LocalAlert,
  Table,
  Tag,
  VStack,
} from "@navikt/ds-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

type ClusterListItem = {
  id: string;
  name: string;
  status: string;
  widgetCount: number;
  createdAt: string;
  updatedAt: string;
};

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; clusters: ClusterListItem[] };

const STATUS_LABELS: Record<string, string> = {
  draft: "Utkast",
  validated: "Validert",
};

function formatDate(dateString: string): string {
  try {
    return new Intl.DateTimeFormat("nb-NO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

function statusVariant(
  status: string,
): "neutral" | "info" | "success" | "warning" {
  switch (status) {
    case "validated":
      return "success";
    default:
      return "neutral";
  }
}

function ClustersContent() {
  const params = useParams();
  const projectId = params.id as string;

  const [state, setState] = useState<FetchState>({ status: "loading" });

  const fetchClusters = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const response = await fetch(`/api/projects/${projectId}/clusters`);

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setState({
          status: "error",
          message:
            body?.message || `Feil ved henting av klynger (${response.status})`,
        });
        return;
      }

      const data = await response.json();
      setState({ status: "success", clusters: data.clusters });
    } catch {
      setState({
        status: "error",
        message: "Kunne ikke kontakte serveren. Prøv igjen senere.",
      });
    }
  }, [projectId]);

  useEffect(() => {
    fetchClusters();
  }, [fetchClusters]);

  return (
    <VStack gap="space-24" padding="space-24">
      <HStack gap="space-12" align="center">
        <Button
          as={Link}
          href={`/projects/${projectId}`}
          variant="tertiary-neutral"
          size="small"
          icon={<ArrowLeftIcon aria-hidden />}
        >
          Tilbake til widgets
        </Button>
      </HStack>

      <VStack gap="space-8">
        <Heading level="2" size="large">
          Klynger
        </Heading>
        <BodyShort>
          Redaksjonelle klynger for dette prosjektet. Opprett nye klynger fra
          widgetvisningen.
        </BodyShort>
      </VStack>

      {state.status === "loading" && (
        <HStack justify="center" padding="space-32">
          <Loader size="xlarge" title="Henter klynger …" />
        </HStack>
      )}

      {state.status === "error" && (
        <LocalAlert status="error">
          <LocalAlert.Content>{state.message}</LocalAlert.Content>
        </LocalAlert>
      )}

      {state.status === "success" && state.clusters.length === 0 && (
        <VStack gap="space-8" align="center" padding="space-32">
          <BodyShort weight="semibold">Ingen klynger opprettet ennå.</BodyShort>
          <BodyShort size="small">
            Gå til widgetvisningen, velg minst to widgets og opprett en klynge.
          </BodyShort>
        </VStack>
      )}

      {state.status === "success" && state.clusters.length > 0 && (
        <Table size="small">
          <caption className="navds-sr-only">
            Klynger for prosjektet. {state.clusters.length} klynger totalt.
          </caption>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
              <Table.HeaderCell scope="col">Status</Table.HeaderCell>
              <Table.HeaderCell scope="col">Widgets</Table.HeaderCell>
              <Table.HeaderCell scope="col">Opprettet</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {state.clusters.map((cluster) => (
              <Table.Row key={cluster.id}>
                <Table.DataCell>
                  <BodyShort weight="semibold">{cluster.name}</BodyShort>
                </Table.DataCell>
                <Table.DataCell>
                  <Tag variant={statusVariant(cluster.status)} size="xsmall">
                    {STATUS_LABELS[cluster.status] ?? cluster.status}
                  </Tag>
                </Table.DataCell>
                <Table.DataCell>
                  <BodyShort size="small">{cluster.widgetCount}</BodyShort>
                </Table.DataCell>
                <Table.DataCell>
                  <BodyShort size="small">
                    {formatDate(cluster.createdAt)}
                  </BodyShort>
                </Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </VStack>
  );
}

export default function ClustersPage() {
  return (
    <Suspense
      fallback={
        <HStack justify="center" padding="space-32">
          <Loader size="xlarge" title="Laster klynger …" />
        </HStack>
      }
    >
      <ClustersContent />
    </Suspense>
  );
}
