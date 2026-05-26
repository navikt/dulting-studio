"use client";

import { BodyShort, Heading, HStack, Tag, VStack } from "@navikt/ds-react";
import {
  type MatrixModel,
  type MatrixWidget,
  truncatePreview,
} from "@/lib/matrix-transform";

type JourneyMatrixProps = {
  model: MatrixModel;
  projectId: string;
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

function ClassificationChip({
  classification,
}: {
  classification: MatrixWidget["classification"];
}) {
  if (!classification) {
    return (
      <Tag variant="neutral" size="xsmall">
        Uklassifisert
      </Tag>
    );
  }

  return (
    <Tag variant="info" size="xsmall">
      {classification.laneTypeLabel ||
        classification.laneTypeKey ||
        "Klassifisert"}
    </Tag>
  );
}

function ColorIndicator({ color }: { color: string | null }) {
  if (!color) return null;

  return (
    <span
      className="matrix-cell__color-dot"
      style={{ backgroundColor: color }}
      role="img"
      aria-label={`Farge: ${color}`}
    />
  );
}

function MatrixCellWidget({ widget }: { widget: MatrixWidget }) {
  const preview = truncatePreview(widget.textContent, 60);

  return (
    <div className="matrix-cell__widget">
      <HStack gap="space-4" align="center" wrap={false}>
        <ColorIndicator color={widget.backgroundColor} />
        <BodyShort size="small" className="matrix-cell__text" title={preview}>
          {preview || <span className="muted">(Tomt)</span>}
        </BodyShort>
      </HStack>
      <HStack gap="space-4" align="center" wrap>
        <Tag variant="neutral" size="xsmall">
          {getTypeLabel(widget.widgetType)}
        </Tag>
        <ClassificationChip classification={widget.classification} />
      </HStack>
    </div>
  );
}

function EmptyCellContent() {
  return (
    <BodyShort size="small" className="muted matrix-cell__empty">
      –
    </BodyShort>
  );
}

export function JourneyMatrix({ model }: JourneyMatrixProps) {
  const { rows, columns, unplacedWidgets, totalWidgets } = model;

  if (rows.length === 0 && unplacedWidgets.length === 0) {
    return null;
  }

  return (
    <VStack gap="space-24">
      <BodyShort size="small" className="muted">
        {totalWidgets} widgets totalt – {totalWidgets - unplacedWidgets.length}{" "}
        plassert i matrise, {unplacedWidgets.length} uten posisjon
      </BodyShort>

      {rows.length > 0 && (
        <section
          className="matrix-scroll-container"
          aria-label="Brukerreisematrise – scroll horisontalt for å se alle kolonner"
        >
          <table className="matrix-table" aria-label="Brukerreisematrise">
            <thead>
              <tr>
                <th className="matrix-table__corner" scope="col">
                  <BodyShort size="small" weight="semibold">
                    Rad / Kolonne
                  </BodyShort>
                </th>
                {columns.map((col) => (
                  <th
                    key={col.columnIndex}
                    className="matrix-table__col-header"
                    scope="col"
                  >
                    <BodyShort size="small" weight="semibold">
                      {col.label}
                    </BodyShort>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.rowIndex}>
                  <th className="matrix-table__row-header" scope="row">
                    <BodyShort size="small" weight="semibold">
                      {row.label}
                    </BodyShort>
                  </th>
                  {row.cells.map((cell) => (
                    <td
                      key={`${cell.rowIndex}:${cell.columnIndex}`}
                      className="matrix-table__cell"
                    >
                      {cell.widgets.length === 0 ? (
                        <EmptyCellContent />
                      ) : (
                        <VStack gap="space-4">
                          {cell.widgets.slice(0, 5).map((widget) => (
                            <MatrixCellWidget key={widget.id} widget={widget} />
                          ))}
                          {cell.widgets.length > 5 && (
                            <BodyShort size="small" className="muted">
                              + {cell.widgets.length - 5} til
                            </BodyShort>
                          )}
                        </VStack>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {unplacedWidgets.length > 0 && (
        <VStack gap="space-8">
          <Heading level="3" size="xsmall">
            Widgets uten plassering ({unplacedWidgets.length})
          </Heading>
          <BodyShort size="small" className="muted">
            Disse widgetene mangler rad- eller kolonneinformasjon. Klassifiser
            dem i innholdsvisningen.
          </BodyShort>
          <div className="matrix-unplaced-list">
            {unplacedWidgets.slice(0, 20).map((widget) => (
              <div key={widget.id} className="matrix-unplaced-item">
                <MatrixCellWidget widget={widget} />
              </div>
            ))}
            {unplacedWidgets.length > 20 && (
              <BodyShort size="small" className="muted">
                + {unplacedWidgets.length - 20} flere widgets uten plassering.
                Se innholdsvisningen for fullstendig oversikt.
              </BodyShort>
            )}
          </div>
        </VStack>
      )}
    </VStack>
  );
}
