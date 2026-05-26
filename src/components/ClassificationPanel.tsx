"use client";

import { XMarkIcon } from "@navikt/aksel-icons";
import {
  BodyShort,
  Button,
  Heading,
  HStack,
  Label,
  Loader,
  LocalAlert,
  Tag,
  Textarea,
  TextField,
  VStack,
} from "@navikt/ds-react";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export type ClassificationData = {
  id?: string;
  laneTypeKey: string | null;
  laneTypeLabel: string | null;
  version: number | null;
  scenario: string | null;
  actorTrack: string | null;
  journeyStep: string | null;
  journeyIndex: number | null;
  notes: string | null;
  status: string | null;
};

export type WidgetForPanel = {
  id: string;
  widgetType: string;
  textContent: string;
  backgroundColor: string | null;
  rowIndex: number | null;
  columnIndex: number | null;
  classification: ClassificationData | null;
};

type WidgetDetailResponse = {
  id: string;
  widgetType: string;
  textContent: string;
  backgroundColor: string | null;
  rowIndex: number | null;
  columnIndex: number | null;
  classification: ClassificationData | null;
};

type ClassificationPanelProps = {
  widget: WidgetForPanel;
  projectId: string;
  onClose: () => void;
  onSaved: (updatedWidget?: WidgetDetailResponse) => void;
};

type SaveState =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "success" }
  | { status: "error"; message: string }
  | { status: "conflict"; message: string };

type DetailState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; data: WidgetDetailResponse };

const TYPE_LABELS: Record<string, string> = {
  sticky_note: "Sticky note",
  text: "Tekst",
  shape: "Form",
  image: "Bilde",
  connector: "Kobling",
  icon: "Ikon",
  drawing: "Tegning",
};

export function ClassificationPanel({
  widget,
  projectId,
  onClose,
  onSaved,
}: ClassificationPanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Blocker 3: Fetch full widget detail when panel opens
  const [detail, setDetail] = useState<DetailState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function fetchDetail() {
      try {
        const response = await fetch(
          `/api/projects/${projectId}/widgets/${widget.id}`,
        );

        if (cancelled) return;

        if (!response.ok) {
          setDetail({
            status: "error",
            message: "Kunne ikke hente fullstendig widgetinnhold.",
          });
          return;
        }

        const data: WidgetDetailResponse = await response.json();
        setDetail({ status: "loaded", data });
      } catch {
        if (!cancelled) {
          setDetail({
            status: "error",
            message: "Kunne ikke kontakte serveren.",
          });
        }
      }
    }

    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [projectId, widget.id]);

  // Use detail data when available, fallback to list data
  const resolvedWidget = detail.status === "loaded" ? detail.data : widget;
  const existing = resolvedWidget.classification;

  const [laneTypeKey, setLaneTypeKey] = useState(existing?.laneTypeKey ?? "");
  const [laneTypeLabel, setLaneTypeLabel] = useState(
    existing?.laneTypeLabel ?? "",
  );
  const [scenario, setScenario] = useState(existing?.scenario ?? "");
  const [actorTrack, setActorTrack] = useState(existing?.actorTrack ?? "");
  const [journeyStep, setJourneyStep] = useState(existing?.journeyStep ?? "");
  const [journeyIndex, setJourneyIndex] = useState(
    existing?.journeyIndex != null ? String(existing.journeyIndex) : "",
  );
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });

  // Sync form fields when detail loads
  useEffect(() => {
    if (detail.status === "loaded") {
      const cls = detail.data.classification;
      setLaneTypeKey(cls?.laneTypeKey ?? "");
      setLaneTypeLabel(cls?.laneTypeLabel ?? "");
      setScenario(cls?.scenario ?? "");
      setActorTrack(cls?.actorTrack ?? "");
      setJourneyStep(cls?.journeyStep ?? "");
      setJourneyIndex(
        cls?.journeyIndex != null ? String(cls.journeyIndex) : "",
      );
      setNotes(cls?.notes ?? "");
    }
  }, [detail]);

  // Version: use existing classification version, or 1 for new
  const currentVersion = existing?.version ?? 1;

  // Focus management: focus close button when panel opens
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  // Escape key handling — ignore when focus is in text input/textarea
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        const target = e.target as HTMLElement;
        const isInputField =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable;

        if (isInputField) {
          // Blur the field instead of closing panel
          target.blur();
          return;
        }

        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setSaveState({ status: "saving" });

      const body = {
        laneTypeKey: laneTypeKey.trim(),
        laneTypeLabel: laneTypeLabel.trim(),
        scenario: scenario.trim() || null,
        actorTrack: actorTrack.trim() || null,
        journeyStep: journeyStep.trim() || null,
        journeyIndex: journeyIndex.trim()
          ? Number.parseInt(journeyIndex.trim(), 10)
          : null,
        notes: notes.trim() || null,
        version: currentVersion,
        expectedState: existing ? "classified" : "unclassified",
      };

      try {
        const response = await fetch(
          `/api/projects/${projectId}/widgets/${widget.id}/classify`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          },
        );

        if (response.status === 409) {
          const errorBody = await response.json().catch(() => null);
          setSaveState({
            status: "conflict",
            message:
              errorBody?.message ??
              "Noen andre har endret denne klassifiseringen. Last inn på nytt før du lagrer.",
          });
          return;
        }

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          setSaveState({
            status: "error",
            message:
              errorBody?.message ?? `Feil ved lagring (${response.status})`,
          });
          return;
        }

        setSaveState({ status: "success" });

        // Re-fetch widget detail to get fresh state for parent sync
        const refreshed = await fetch(
          `/api/projects/${projectId}/widgets/${widget.id}`,
        );
        if (refreshed.ok) {
          const updatedData: WidgetDetailResponse = await refreshed.json();
          setDetail({ status: "loaded", data: updatedData });
          onSaved(updatedData);
        } else {
          onSaved();
        }
      } catch {
        setSaveState({
          status: "error",
          message: "Kunne ikke kontakte serveren. Prøv igjen senere.",
        });
      }
    },
    [
      laneTypeKey,
      laneTypeLabel,
      scenario,
      actorTrack,
      journeyStep,
      journeyIndex,
      notes,
      currentVersion,
      existing,
      projectId,
      widget.id,
      onSaved,
    ],
  );

  const displayText =
    detail.status === "loaded"
      ? detail.data.textContent
      : widget.textContent.replace(/<[^>]*>/g, "").trim();
  const typeLabel =
    TYPE_LABELS[resolvedWidget.widgetType] ?? resolvedWidget.widgetType;

  return (
    <aside
      ref={panelRef}
      className="classification-panel"
      aria-label="Klassifiseringspanel"
    >
      <VStack gap="space-20" className="classification-panel__content">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Heading level="3" size="small">
            Klassifiser widget
          </Heading>
          <Button
            ref={closeButtonRef}
            variant="tertiary-neutral"
            size="small"
            icon={<XMarkIcon aria-hidden />}
            onClick={onClose}
            aria-label="Lukk klassifiseringspanel"
          />
        </HStack>

        {/* Widget context (read-only) */}
        <fieldset className="classification-panel__context">
          <legend className="navds-sr-only">Widget-informasjon</legend>
          <VStack gap="space-8">
            <div>
              <Label size="small" as="span">
                Innhold
              </Label>
              {detail.status === "loading" ? (
                <Loader size="xsmall" title="Henter innhold …" />
              ) : (
                <BodyShort size="small">
                  {displayText || "(Tomt innhold)"}
                </BodyShort>
              )}
            </div>

            {detail.status === "error" && (
              <LocalAlert status="warning">
                <LocalAlert.Content>{detail.message}</LocalAlert.Content>
              </LocalAlert>
            )}

            <HStack gap="space-16">
              <div>
                <Label size="small" as="span">
                  Type
                </Label>
                <BodyShort size="small">{typeLabel}</BodyShort>
              </div>

              <div>
                <Label size="small" as="span">
                  Posisjon
                </Label>
                <BodyShort size="small">
                  {resolvedWidget.rowIndex != null
                    ? `R${resolvedWidget.rowIndex}`
                    : "–"}
                  {resolvedWidget.columnIndex != null
                    ? `, K${resolvedWidget.columnIndex}`
                    : ""}
                </BodyShort>
              </div>
            </HStack>

            {resolvedWidget.backgroundColor && (
              <div>
                <Label size="small" as="span">
                  Farge
                </Label>
                <HStack gap="space-4" align="center">
                  <span
                    className="widget-color-chip"
                    style={{
                      backgroundColor: resolvedWidget.backgroundColor,
                    }}
                    aria-hidden="true"
                  />
                  <BodyShort size="small">
                    {resolvedWidget.backgroundColor}
                  </BodyShort>
                </HStack>
              </div>
            )}

            <div>
              <Label size="small" as="span">
                Status
              </Label>
              {existing ? (
                <Tag variant="info" size="xsmall">
                  Klassifisert (v{currentVersion})
                </Tag>
              ) : (
                <Tag variant="neutral" size="xsmall">
                  Uklassifisert
                </Tag>
              )}
            </div>
          </VStack>
        </fieldset>

        {/* Classification form */}
        <form onSubmit={handleSubmit}>
          <VStack gap="space-16">
            <TextField
              label="Lane-nøkkel"
              description="Identifikator for spor/lane (f.eks. «brukerreise», «systemflyt»)"
              size="small"
              value={laneTypeKey}
              onChange={(e) => setLaneTypeKey(e.target.value)}
              required
              maxLength={100}
              autoComplete="off"
            />

            <TextField
              label="Lane-label"
              description="Visningsnavn for lane"
              size="small"
              value={laneTypeLabel}
              onChange={(e) => setLaneTypeLabel(e.target.value)}
              required
              maxLength={200}
              autoComplete="off"
            />

            <TextField
              label="Scenario"
              description="Hvilket scenario tilhører denne widgeten?"
              size="small"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              maxLength={300}
              autoComplete="off"
            />

            <TextField
              label="Aktørspor"
              description="Hvilken aktør/brukerrolle gjelder dette?"
              size="small"
              value={actorTrack}
              onChange={(e) => setActorTrack(e.target.value)}
              maxLength={200}
              autoComplete="off"
            />

            <HStack gap="space-8">
              <TextField
                label="Steg"
                description="Steget i reisen"
                size="small"
                value={journeyStep}
                onChange={(e) => setJourneyStep(e.target.value)}
                maxLength={300}
                autoComplete="off"
                className="classification-panel__field--grow"
              />
              <TextField
                label="Indeks"
                description="Rekkefølge"
                size="small"
                value={journeyIndex}
                onChange={(e) => setJourneyIndex(e.target.value)}
                type="number"
                min={0}
                className="classification-panel__field--index"
              />
            </HStack>

            <Textarea
              label="Notater"
              description="Valgfrie notater om klassifiseringen"
              size="small"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={2000}
              minRows={2}
              maxRows={5}
            />

            {/* Status messages */}
            <div aria-live="polite" aria-atomic="true">
              {saveState.status === "success" && (
                <LocalAlert status="success">
                  <LocalAlert.Content>
                    Klassifiseringen ble lagret.
                  </LocalAlert.Content>
                </LocalAlert>
              )}

              {saveState.status === "error" && (
                <LocalAlert status="error">
                  <LocalAlert.Content>{saveState.message}</LocalAlert.Content>
                </LocalAlert>
              )}

              {saveState.status === "conflict" && (
                <LocalAlert status="warning">
                  <LocalAlert.Content>{saveState.message}</LocalAlert.Content>
                </LocalAlert>
              )}
            </div>

            <HStack gap="space-8">
              <Button
                type="submit"
                size="small"
                loading={saveState.status === "saving"}
                disabled={saveState.status === "saving"}
              >
                {existing ? "Oppdater" : "Lagre"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={onClose}
                disabled={saveState.status === "saving"}
              >
                Avbryt
              </Button>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </aside>
  );
}
