"use client";

import {
  ArrowLeftIcon,
  FolderIcon,
  LineGraphIcon,
  TableIcon,
} from "@navikt/aksel-icons";
import {
  BodyLong,
  BodyShort,
  Button,
  Heading,
  HStack,
  Loader,
  LocalAlert,
  Tag,
  VStack,
} from "@navikt/ds-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ClassificationPanel } from "@/components/ClassificationPanel";
import { CreateClusterModal } from "@/components/CreateClusterModal";
import { PromoteInterventionCandidateModal } from "@/components/PromoteInterventionCandidateModal";
import { WidgetFilters } from "@/components/WidgetFilters";
import { type WidgetItem, WidgetTable } from "@/components/WidgetTable";

type WidgetResponse = {
  items: WidgetItem[];
  axisOptions: {
    rows: AxisFilterOption[];
    columns: AxisFilterOption[];
  };
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type AxisFilterOption = {
  value: string;
  label: string;
  tableLabel: string;
};

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: WidgetResponse };

type SuccessMessage = {
  text: string;
  href: string;
  linkText: string;
};

type TriageFeedback = {
  status: "success" | "error";
  text: string;
  undoWidgetIds?: string[];
};

function ProjectInboxContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.id as string;

  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [selectedWidget, setSelectedWidget] = useState<WidgetItem | null>(null);
  const [selectedWidgetIds, setSelectedWidgetIds] = useState<Set<string>>(
    new Set(),
  );
  const [showClusterModal, setShowClusterModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<SuccessMessage | null>(
    null,
  );
  const [triageFeedback, setTriageFeedback] = useState<TriageFeedback | null>(
    null,
  );
  const [triageAction, setTriageAction] = useState<
    "open" | "parked" | "rejected" | null
  >(null);

  const page = Number(searchParams.get("page") || "1");
  const type = searchParams.get("type") || "";
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const lane = searchParams.get("lane") || "";
  const actorTrack = searchParams.get("actorTrack") || "";
  const journeyStep = searchParams.get("journeyStep") || "";
  const tableRow = searchParams.get("tableRow") || "";
  const tableColumn = searchParams.get("tableColumn") || "";
  const placement = searchParams.get("placement") || "";
  const triage = searchParams.get("triage") || "";

  const fetchWidgets = useCallback(async () => {
    setState({ status: "loading" });

    const queryParams = new URLSearchParams();
    queryParams.set("page", String(page));
    queryParams.set("pageSize", "50");
    if (type) queryParams.set("type", type);
    if (search) queryParams.set("search", search);
    if (status) queryParams.set("status", status);
    if (lane) queryParams.set("lane", lane);
    if (actorTrack) queryParams.set("actorTrack", actorTrack);
    if (journeyStep) queryParams.set("journeyStep", journeyStep);
    if (tableRow) queryParams.set("tableRow", tableRow);
    if (tableColumn) queryParams.set("tableColumn", tableColumn);
    if (placement) queryParams.set("placement", placement);
    if (triage) queryParams.set("triage", triage);

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
  }, [
    projectId,
    page,
    type,
    search,
    status,
    lane,
    actorTrack,
    journeyStep,
    tableRow,
    tableColumn,
    placement,
    triage,
  ]);

  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);

  // Clear selection when visible widget set changes (page/filter change)
  // to avoid selecting widgets that are no longer visible
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally resets on filter/page change
  useEffect(() => {
    setSelectedWidgetIds(new Set());
  }, [
    page,
    type,
    search,
    status,
    lane,
    actorTrack,
    journeyStep,
    tableRow,
    tableColumn,
    placement,
    triage,
  ]);

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
      fetchWidgets();
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

  const handleToggleWidgetSelection = useCallback((widgetId: string) => {
    setSelectedWidgetIds((prev) => {
      const next = new Set(prev);
      if (next.has(widgetId)) {
        next.delete(widgetId);
      } else {
        next.add(widgetId);
      }
      return next;
    });
  }, []);

  const updateWidgetTriage = useCallback(
    async (
      nextState: "open" | "parked" | "rejected",
      widgetIds: string[],
      options: { undoable?: boolean } = {},
    ) => {
      if (widgetIds.length === 0) {
        return;
      }

      setTriageAction(nextState);
      setTriageFeedback(null);

      try {
        const response = await fetch(
          `/api/projects/${projectId}/widgets/triage`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ widgetIds, state: nextState }),
          },
        );

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          setTriageFeedback({
            status: "error",
            text: body?.message || "Kunne ikke oppdatere triage.",
          });
          return;
        }

        const label =
          nextState === "open"
            ? "gjenåpnet"
            : nextState === "parked"
              ? "parkert"
              : "forkastet";

        setSelectedWidgetIds(new Set());
        setSelectedWidget(null);
        setTriageFeedback({
          status: "success",
          text: `${widgetIds.length} widget${widgetIds.length === 1 ? "" : "s"} ${label}.`,
          undoWidgetIds:
            options.undoable && nextState !== "open" ? widgetIds : undefined,
        });
        fetchWidgets();
      } catch {
        setTriageFeedback({
          status: "error",
          text: "Kunne ikke kontakte serveren. Prøv igjen senere.",
        });
      } finally {
        setTriageAction(null);
      }
    },
    [fetchWidgets, projectId],
  );

  // Cleanup timeout for success message on unmount/navigation
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const handleClusterSuccess = useCallback(
    (_clusterId: string) => {
      setShowClusterModal(false);
      setSelectedWidgetIds(new Set());
      setSuccessMessage({
        text: "Klynge opprettet.",
        href: `/projects/${projectId}/clusters`,
        linkText: "Se klyngeliste",
      });
      // Clear success message after a few seconds
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      successTimeoutRef.current = setTimeout(
        () => setSuccessMessage(null),
        6000,
      );
      fetchWidgets();
    },
    [fetchWidgets, projectId],
  );

  const handlePromoteSuccess = useCallback(
    (_candidateId: string) => {
      setShowPromoteModal(false);
      setSelectedWidgetIds(new Set());
      setSuccessMessage({
        text: "Tiltakskandidat opprettet.",
        href: `/projects/${projectId}/tiltak`,
        linkText: "Se tiltakskandidater",
      });
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      successTimeoutRef.current = setTimeout(
        () => setSuccessMessage(null),
        6000,
      );
      fetchWidgets();
    },
    [fetchWidgets, projectId],
  );

  const hasActiveFilters = !!(
    type ||
    search ||
    status ||
    lane ||
    actorTrack ||
    journeyStep ||
    tableRow ||
    tableColumn ||
    placement ||
    triage
  );

  // Get the selected widget items for showing muralWidgetIds
  const selectedWidgetItems = useMemo(() => {
    if (state.status !== "success") return [];
    return state.data.items.filter((item) => selectedWidgetIds.has(item.id));
  }, [state, selectedWidgetIds]);
  const selectedHasInactiveTriage = selectedWidgetItems.some(
    (item) => item.triage.state !== "open",
  );

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
          <HStack gap="space-8">
            <Button
              as={Link}
              href={`/projects/${projectId}/tiltak`}
              variant="tertiary"
              size="small"
            >
              Tiltak
            </Button>
            <Button
              as={Link}
              href={`/projects/${projectId}/clusters`}
              variant="tertiary"
              size="small"
              icon={<FolderIcon aria-hidden />}
            >
              Klynger
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
            <Button
              as={Link}
              href="/brukerreise"
              variant="tertiary"
              size="small"
              icon={<LineGraphIcon aria-hidden />}
            >
              Brukerreise
            </Button>
            <Button
              as={Link}
              href="/tiltakskart"
              variant="tertiary"
              size="small"
            >
              Tiltakskart
            </Button>
          </HStack>
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

        {successMessage && (
          <LocalAlert status="success">
            <LocalAlert.Content>
              {successMessage.text}{" "}
              <Link href={successMessage.href}>{successMessage.linkText}</Link>
            </LocalAlert.Content>
          </LocalAlert>
        )}

        {triageFeedback && (
          <LocalAlert
            status={triageFeedback.status === "success" ? "success" : "error"}
          >
            <LocalAlert.Content>
              <HStack gap="space-12" align="center" wrap>
                <span>{triageFeedback.text}</span>
                {triageFeedback.undoWidgetIds && (
                  <Button
                    type="button"
                    size="xsmall"
                    variant="secondary"
                    loading={triageAction === "open"}
                    onClick={() =>
                      updateWidgetTriage(
                        "open",
                        triageFeedback.undoWidgetIds ?? [],
                      )
                    }
                  >
                    Angre
                  </Button>
                )}
              </HStack>
            </LocalAlert.Content>
          </LocalAlert>
        )}

        <WidgetFilters
          currentType={type}
          currentSearch={search}
          currentStatus={status}
          currentLane={lane}
          currentActorTrack={actorTrack}
          currentJourneyStep={journeyStep}
          currentTableRow={tableRow}
          currentTableColumn={tableColumn}
          currentPlacement={placement}
          currentTriage={triage}
          axisOptions={
            state.status === "success"
              ? state.data.axisOptions
              : { rows: [], columns: [] }
          }
          resultCount={state.status === "success" ? state.data.total : null}
          visibleCount={
            state.status === "success" ? state.data.items.length : null
          }
          projectId={projectId}
        />

        {/* Selection action bar */}
        {selectedWidgetIds.size > 0 && (
          <VStack
            gap="space-8"
            className="widget-selection-bar"
            aria-live="polite"
          >
            <HStack gap="space-12" align="center" justify="space-between">
              <BodyShort size="small" weight="semibold">
                {selectedWidgetIds.size} widget
                {selectedWidgetIds.size === 1 ? "" : "s"} valgt
              </BodyShort>
              <HStack gap="space-8">
                <Button
                  variant="tertiary"
                  size="xsmall"
                  onClick={() => setSelectedWidgetIds(new Set())}
                >
                  Fjern valg
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => setShowPromoteModal(true)}
                >
                  Promoter til tiltak
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  loading={triageAction === "parked"}
                  onClick={() =>
                    updateWidgetTriage(
                      "parked",
                      Array.from(selectedWidgetIds),
                      { undoable: true },
                    )
                  }
                >
                  Parkér
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  data-color="danger"
                  loading={triageAction === "rejected"}
                  onClick={() =>
                    updateWidgetTriage(
                      "rejected",
                      Array.from(selectedWidgetIds),
                      { undoable: true },
                    )
                  }
                >
                  Forkast
                </Button>
                <Button
                  variant="tertiary"
                  size="small"
                  disabled={!selectedHasInactiveTriage}
                  loading={triageAction === "open"}
                  onClick={() =>
                    updateWidgetTriage("open", Array.from(selectedWidgetIds))
                  }
                >
                  Gjenåpne
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setShowClusterModal(true)}
                  disabled={selectedWidgetIds.size < 2}
                >
                  Opprett klynge
                </Button>
              </HStack>
            </HStack>
            {selectedWidgetItems.length > 0 && (
              <VStack gap="space-4">
                <BodyShort size="small" as="span" id="selected-widgets-label">
                  Kildehenvisninger fra Mural:
                </BodyShort>
                <HStack
                  gap="space-4"
                  wrap
                  aria-labelledby="selected-widgets-label"
                  as="ul"
                  className="unstyled-list"
                >
                  {selectedWidgetItems.map((w) => (
                    <li key={w.id}>
                      <Tag variant="info" size="xsmall">
                        {w.muralWidgetId}
                      </Tag>
                    </li>
                  ))}
                </HStack>
              </VStack>
            )}
            {selectedWidgetIds.size < 2 && (
              <BodyShort size="small" className="muted">
                Du kan promotere én eller flere widgets til tiltak. Velg minst
                to widgets for å opprette en klynge.
              </BodyShort>
            )}
          </VStack>
        )}

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
            hasActiveFilters={hasActiveFilters}
            projectId={projectId}
            onSelectWidget={handleSelectWidget}
            selectedWidgetId={selectedWidget?.id}
            selectedWidgetIds={selectedWidgetIds}
            onToggleWidgetSelection={handleToggleWidgetSelection}
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

      {showClusterModal && (
        <CreateClusterModal
          projectId={projectId}
          widgetIds={Array.from(selectedWidgetIds).filter(
            (id) =>
              state.status === "success" &&
              state.data.items.some((item) => item.id === id),
          )}
          onClose={() => setShowClusterModal(false)}
          onSuccess={handleClusterSuccess}
        />
      )}

      {showPromoteModal && (
        <PromoteInterventionCandidateModal
          projectId={projectId}
          sourceWidgets={selectedWidgetItems.map((item) => ({
            id: item.id,
            muralWidgetId: item.muralWidgetId,
          }))}
          onClose={() => setShowPromoteModal(false)}
          onSuccess={handlePromoteSuccess}
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
