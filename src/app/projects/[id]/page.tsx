"use client";

import { ArrowLeftIcon, TableIcon } from "@navikt/aksel-icons";
import {
  BodyLong,
  BodyShort,
  Button,
  Heading,
  HStack,
  Loader,
  LocalAlert,
  VStack,
} from "@navikt/ds-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ClassificationPanel } from "@/components/ClassificationPanel";
import { WidgetFilters } from "@/components/WidgetFilters";
import { type WidgetItem, WidgetTable } from "@/components/WidgetTable";

type WidgetResponse = {
  items: WidgetItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: WidgetResponse };

function ProjectInboxContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.id as string;

  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [selectedWidget, setSelectedWidget] = useState<WidgetItem | null>(null);

  const page = Number(searchParams.get("page") || "1");
  const type = searchParams.get("type") || "";
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  const fetchWidgets = useCallback(async () => {
    setState({ status: "loading" });

    const queryParams = new URLSearchParams();
    queryParams.set("page", String(page));
    queryParams.set("pageSize", "50");
    if (type) queryParams.set("type", type);
    if (search) queryParams.set("search", search);
    if (status) queryParams.set("status", status);

    try {
      const response = await fetch(
        `/api/projects/${projectId}/widgets?${queryParams.toString()}`,
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);

        if (response.status === 404) {
          setState({
            status: "error",
            message: "Prosjektet finnes ikke.",
          });
          return;
        }

        setState({
          status: "error",
          message:
            body?.message || `Feil ved henting av widgets (${response.status})`,
        });
        return;
      }

      const data: WidgetResponse = await response.json();
      setState({ status: "success", data });
    } catch {
      setState({
        status: "error",
        message: "Kunne ikke kontakte serveren. Prøv igjen senere.",
      });
    }
  }, [projectId, page, type, search, status]);

  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);

  const handleSelectWidget = useCallback((widget: WidgetItem) => {
    setSelectedWidget(widget);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedWidget(null);
  }, []);

  const handleClassificationSaved = useCallback(
    (updatedWidget?: {
      id: string;
      widgetType: string;
      textContent: string;
      backgroundColor: string | null;
      rowIndex: number | null;
      columnIndex: number | null;
      classification: unknown;
    }) => {
      // Refresh widget list to show updated classification status
      fetchWidgets();
      // Sync selectedWidget with fresh data to avoid stale state
      if (updatedWidget && selectedWidget?.id === updatedWidget.id) {
        setSelectedWidget({
          ...selectedWidget,
          textContent: updatedWidget.textContent,
          classification:
            updatedWidget.classification as WidgetItem["classification"],
        });
      }
    },
    [fetchWidgets, selectedWidget],
  );

  const hasActiveFilters = !!(type || search || status);

  return (
    <div className="project-inbox-layout">
      <VStack gap="space-24" className="project-inbox-layout__main">
        <HStack gap="space-12" align="center" justify="space-between">
          <Button
            as={Link}
            href="/projects"
            variant="tertiary-neutral"
            size="small"
            icon={<ArrowLeftIcon aria-hidden />}
          >
            Tilbake
          </Button>
          <Button
            as={Link}
            href={`/projects/${projectId}/matrix`}
            variant="tertiary"
            size="small"
            icon={<TableIcon aria-hidden />}
          >
            Matrisevisning
          </Button>
        </HStack>

        <VStack gap="space-8">
          <Heading level="2" size="large">
            Innholdsvisning
          </Heading>
          <BodyLong>
            Importerte widgets fra Mural-workshop. Filtrer og gjennomgå
            innholdet for klassifisering.
          </BodyLong>
        </VStack>

        <WidgetFilters
          currentType={type}
          currentSearch={search}
          currentStatus={status}
          projectId={projectId}
        />

        {state.status === "loading" && (
          <HStack justify="center" padding="space-32">
            <Loader size="xlarge" title="Henter widgets …" />
          </HStack>
        )}

        {state.status === "error" && (
          <LocalAlert status="error">
            <LocalAlert.Content>{state.message}</LocalAlert.Content>
          </LocalAlert>
        )}

        {state.status === "success" && state.data.total === 0 && (
          <VStack gap="space-8" align="center" padding="space-32">
            <BodyShort weight="semibold">Ingen widgets funnet.</BodyShort>
            {hasActiveFilters && (
              <BodyShort size="small">
                Prøv å fjerne filtre for å se alt innhold.
              </BodyShort>
            )}
          </VStack>
        )}

        {state.status === "success" && state.data.total > 0 && (
          <WidgetTable
            items={state.data.items}
            page={state.data.page}
            total={state.data.total}
            totalPages={state.data.totalPages}
            projectId={projectId}
            onSelectWidget={handleSelectWidget}
            selectedWidgetId={selectedWidget?.id}
          />
        )}
      </VStack>

      {selectedWidget && (
        <ClassificationPanel
          widget={selectedWidget}
          projectId={projectId}
          onClose={handleClosePanel}
          onSaved={handleClassificationSaved}
        />
      )}
    </div>
  );
}

export default function ProjectPage() {
  return (
    <Suspense
      fallback={
        <HStack justify="center" padding="space-32">
          <Loader size="xlarge" title="Laster prosjekt …" />
        </HStack>
      }
    >
      <ProjectInboxContent />
    </Suspense>
  );
}
