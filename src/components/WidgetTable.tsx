"use client";

import {
  BodyShort,
  Button,
  Checkbox,
  HStack,
  Pagination,
  Table,
  Tag,
  VStack,
} from "@navikt/ds-react";
import { useRouter } from "next/navigation";

type ClassificationItem = {
  laneTypeKey: string | null;
  laneTypeLabel: string | null;
  version: number | null;
  scenario: string | null;
  actorTrack: string | null;
  journeyStep: string | null;
  journeyIndex: number | null;
  status: string | null;
};

type WidgetItem = {
  id: string;
  muralWidgetId: string;
  widgetType: string;
  textContent: string;
  backgroundColor: string | null;
  rowIndex: number | null;
  columnIndex: number | null;
  tablePosition: {
    rowLabel: string | null;
    columnLabel: string | null;
    tableLabel: string | null;
  };
  position: { x: number; y: number; width: number; height: number };
  classification: ClassificationItem | null;
  triage: {
    state: "open" | "parked" | "rejected";
    reason: string | null;
  };
  createdAt: string;
};

type WidgetTableProps = {
  items: WidgetItem[];
  page: number;
  total: number;
  totalPages: number;
  hasActiveFilters?: boolean;
  projectId: string;
  onSelectWidget: (widget: WidgetItem) => void;
  selectedWidgetId?: string | null;
  /** Multi-select mode: set of selected widget IDs */
  selectedWidgetIds?: Set<string>;
  /** Callback when a widget's selection checkbox is toggled */
  onToggleWidgetSelection?: (widgetId: string) => void;
};

const TYPE_LABELS: Record<string, string> = {
  sticky_note: "Sticky note",
  text: "Tekst",
  shape: "Form",
  image: "Bilde",
  connector: "Kobling",
  icon: "Ikon",
  drawing: "Tegning",
};

function getTypeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

function ColorChip({ color }: { color: string | null }) {
  if (!color) return <span className="muted">–</span>;

  return (
    <HStack gap="space-4" align="center">
      <span
        className="widget-color-chip"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <BodyShort size="small">{color}</BodyShort>
    </HStack>
  );
}

function ClassificationBadge({
  classification,
}: {
  classification: WidgetItem["classification"];
}) {
  if (!classification) {
    return (
      <Tag variant="neutral" size="small">
        Uklassifisert
      </Tag>
    );
  }

  return (
    <Tag variant="info" size="small">
      {classification.laneTypeLabel ||
        classification.laneTypeKey ||
        "Klassifisert"}
    </Tag>
  );
}

function TriageBadge({ triage }: { triage: WidgetItem["triage"] }) {
  if (triage.state === "parked") {
    return (
      <Tag variant="warning" size="small">
        Parkert
      </Tag>
    );
  }

  if (triage.state === "rejected") {
    return (
      <Tag variant="error" size="small">
        Forkastet
      </Tag>
    );
  }

  return (
    <Tag variant="success" size="small">
      Aktiv
    </Tag>
  );
}

function formatPosition(item: WidgetItem) {
  const labeledParts = [
    item.tablePosition.rowLabel,
    item.tablePosition.columnLabel,
  ].filter(Boolean);

  if (labeledParts.length > 0) {
    return labeledParts.join(" / ");
  }

  const { rowIndex, columnIndex } = item;
  if (rowIndex === null && columnIndex === null) return "–";
  const parts = [];
  if (rowIndex !== null) parts.push(`R${rowIndex}`);
  if (columnIndex !== null) parts.push(`K${columnIndex}`);
  return parts.join(", ");
}

export type { WidgetItem };

export function WidgetTable({
  items,
  page,
  total,
  totalPages,
  hasActiveFilters = false,
  projectId,
  onSelectWidget,
  selectedWidgetId,
  selectedWidgetIds,
  onToggleWidgetSelection,
}: WidgetTableProps) {
  const router = useRouter();
  const multiSelectEnabled = !!(selectedWidgetIds && onToggleWidgetSelection);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(newPage));
    router.push(`/projects/${projectId}?${params.toString()}`);
  };

  return (
    <VStack gap="space-16">
      <HStack justify="space-between" align="center">
        <BodyShort size="small" className="muted">
          Viser {items.length} av {total} widgets (side {page} av {totalPages})
          {hasActiveFilters ? " med aktive filtre" : ""}
        </BodyShort>
      </HStack>

      <div className="widget-table-wrapper">
        <Table size="small">
          <caption className="navds-sr-only">
            Widgets importert fra Mural. Viser side {page} av {totalPages},
            totalt {total} elementer.
          </caption>
          <Table.Header>
            <Table.Row>
              {multiSelectEnabled && (
                <Table.HeaderCell scope="col">
                  <span className="navds-sr-only">Velg</span>
                </Table.HeaderCell>
              )}
              <Table.HeaderCell scope="col">Innhold</Table.HeaderCell>
              <Table.HeaderCell scope="col">Type</Table.HeaderCell>
              <Table.HeaderCell scope="col">Posisjon</Table.HeaderCell>
              <Table.HeaderCell scope="col">Farge</Table.HeaderCell>
              <Table.HeaderCell scope="col">Status</Table.HeaderCell>
              <Table.HeaderCell scope="col">Handling</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items.map((item) => {
              const labelText =
                stripHtml(item.textContent).slice(0, 60) || item.widgetType;
              return (
                <Table.Row
                  key={item.id}
                  className={
                    selectedWidgetId === item.id
                      ? "widget-table-row--selected"
                      : item.triage.state !== "open"
                        ? "widget-table-row--muted"
                        : undefined
                  }
                >
                  {multiSelectEnabled && (
                    <Table.DataCell>
                      <Checkbox
                        size="small"
                        checked={selectedWidgetIds.has(item.id)}
                        onChange={() => onToggleWidgetSelection(item.id)}
                        hideLabel
                      >
                        {`Velg widget: ${labelText}`}
                      </Checkbox>
                    </Table.DataCell>
                  )}
                  <Table.DataCell className="widget-text-cell">
                    {stripHtml(item.textContent) || (
                      <span className="muted">(Tomt innhold)</span>
                    )}
                  </Table.DataCell>
                  <Table.DataCell>
                    <Tag variant="neutral" size="xsmall">
                      {getTypeLabel(item.widgetType)}
                    </Tag>
                  </Table.DataCell>
                  <Table.DataCell>
                    <BodyShort size="small">{formatPosition(item)}</BodyShort>
                  </Table.DataCell>
                  <Table.DataCell>
                    <ColorChip color={item.backgroundColor} />
                  </Table.DataCell>
                  <Table.DataCell>
                    <VStack gap="space-4">
                      <ClassificationBadge
                        classification={item.classification}
                      />
                      <TriageBadge triage={item.triage} />
                    </VStack>
                  </Table.DataCell>
                  <Table.DataCell>
                    <Button
                      variant="tertiary"
                      size="xsmall"
                      onClick={() => onSelectWidget(item)}
                      aria-label={`Klassifiser widget: ${stripHtml(item.textContent).slice(0, 40) || item.widgetType}`}
                    >
                      Klassifiser
                    </Button>
                  </Table.DataCell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </div>

      {totalPages > 1 && (
        <HStack justify="center">
          <Pagination
            page={page}
            count={totalPages}
            onPageChange={handlePageChange}
            size="small"
          />
        </HStack>
      )}
    </VStack>
  );
}

/**
 * Strip HTML tags from text for display.
 * Widgets may contain HTML markup from Mural.
 */
function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}
