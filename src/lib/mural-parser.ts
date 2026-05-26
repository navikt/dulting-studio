import type {
  ImportWidgetMetadata,
  ProjectImportReport,
  ProjectImportWidget,
} from "./mural-import-contract";

type RawMuralWidget = Record<string, unknown>;

type ParsedMuralExport = {
  widgets: ProjectImportWidget[];
  report: ProjectImportReport & {
    warnings: string[];
  };
};

type TableDefinition = {
  id: string;
  rows: Array<{ id: string; index: number; label?: string | null }>;
  columns: Array<{ id: string; index: number; label?: string | null }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function decodeHtmlEntities(value: string) {
  return value
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll(/&#(\d+);/g, (_, charCode) =>
      String.fromCharCode(Number.parseInt(charCode, 10)),
    );
}

export function stripHtmlToPlainText(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return decodeHtmlEntities(value)
    .replaceAll(/<br\s*\/?>/gi, " ")
    .replaceAll(/<\/(div|p|li|tr|td|th|h\d)>/gi, " ")
    .replaceAll(/<[^>]+>/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
}

function readGeometry(widget: RawMuralWidget) {
  const geometry = isRecord(widget.geometry) ? widget.geometry : undefined;

  return {
    x: readNumber(widget.x) ?? readNumber(geometry?.x) ?? 0,
    y: readNumber(widget.y) ?? readNumber(geometry?.y) ?? 0,
    width: readNumber(widget.width) ?? readNumber(geometry?.width) ?? 0,
    height: readNumber(widget.height) ?? readNumber(geometry?.height) ?? 0,
  };
}

function readBackgroundColor(widget: RawMuralWidget): string | undefined {
  const style = isRecord(widget.style) ? widget.style : undefined;
  const properties = isRecord(widget.properties)
    ? widget.properties
    : undefined;

  return (
    readString(widget.backgroundColor) ??
    readString(style?.backgroundColor) ??
    readString(properties?.backgroundColor)
  );
}

function readText(widget: RawMuralWidget) {
  const properties = isRecord(widget.properties)
    ? widget.properties
    : undefined;

  return stripHtmlToPlainText(
    properties?.htmlText ??
      properties?.text ??
      widget.htmlText ??
      widget.text ??
      widget.textContent,
  );
}

function readAxisEntries(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry, index) => {
    if (!isRecord(entry)) {
      return [];
    }

    const id = readString(entry.id);

    if (!id) {
      return [];
    }

    const label = stripHtmlToPlainText(
      entry.name ?? entry.label ?? entry.title,
    );

    return [
      {
        id,
        index,
        label: label || null,
      },
    ];
  });
}

function buildTableDefinition(widget: RawMuralWidget): TableDefinition | null {
  const properties = isRecord(widget.properties)
    ? widget.properties
    : undefined;
  const id = readString(widget.id);

  if (!id) {
    return null;
  }

  return {
    id,
    rows: readAxisEntries(properties?.rows),
    columns: readAxisEntries(properties?.columns),
  };
}

function readWidgetType(widget: RawMuralWidget) {
  return readString(widget.type) ?? "unknown";
}

function tableMetadata(definition: TableDefinition): ImportWidgetMetadata {
  return {
    tableRows: definition.rows,
    tableColumns: definition.columns,
  };
}

function parseTableWidget(widget: RawMuralWidget, definition: TableDefinition) {
  const geometry = readGeometry(widget);

  return {
    muralWidgetId: definition.id,
    widgetType: "table",
    x: geometry.x,
    y: geometry.y,
    width: geometry.width,
    height: geometry.height,
    stackingOrder: readNumber(widget.stackingOrder),
    textContent: "",
    backgroundColor: readBackgroundColor(widget),
    metadata: tableMetadata(definition),
  } satisfies ProjectImportWidget;
}

function parseTableCellWidget(
  widget: RawMuralWidget,
  tablesById: Map<string, TableDefinition>,
) {
  const properties = isRecord(widget.properties)
    ? widget.properties
    : undefined;
  const muralWidgetId = readString(widget.id);

  if (!muralWidgetId) {
    return null;
  }

  const parentMuralWidgetId =
    readString(widget.parentId) ?? readString(properties?.tableId);
  const table = parentMuralWidgetId
    ? tablesById.get(parentMuralWidgetId)
    : undefined;
  const rowId = readString(properties?.rowId);
  const columnId = readString(properties?.columnId);
  const rowIndex = rowId
    ? table?.rows.find((row) => row.id === rowId)?.index
    : undefined;
  const columnIndex = columnId
    ? table?.columns.find((column) => column.id === columnId)?.index
    : undefined;
  const geometry = readGeometry(widget);

  return {
    widget: {
      muralWidgetId,
      widgetType: "table-cell",
      parentMuralWidgetId,
      rowId,
      columnId,
      rowIndex,
      columnIndex,
      x: geometry.x,
      y: geometry.y,
      width: geometry.width,
      height: geometry.height,
      stackingOrder: readNumber(widget.stackingOrder),
      textContent: readText(widget),
      backgroundColor: readBackgroundColor(widget),
      metadata: {},
    } satisfies ProjectImportWidget,
    hasGeometryWarning:
      !parentMuralWidgetId ||
      !table ||
      rowIndex === undefined ||
      columnIndex === undefined,
  };
}

function parseTextLikeWidget(
  widget: RawMuralWidget,
  widgetType: "shape" | "text",
) {
  const muralWidgetId = readString(widget.id);

  if (!muralWidgetId) {
    return null;
  }

  const geometry = readGeometry(widget);

  return {
    muralWidgetId,
    widgetType,
    x: geometry.x,
    y: geometry.y,
    width: geometry.width,
    height: geometry.height,
    stackingOrder: readNumber(widget.stackingOrder),
    textContent: readText(widget),
    backgroundColor: readBackgroundColor(widget),
    metadata: {},
  } satisfies ProjectImportWidget;
}

function extractWidgets(raw: unknown): RawMuralWidget[] {
  if (Array.isArray(raw)) {
    return raw.filter(isRecord);
  }

  if (isRecord(raw) && Array.isArray(raw.widgets)) {
    return raw.widgets.filter(isRecord);
  }

  return [];
}

export function parseMuralExport(raw: unknown): ParsedMuralExport {
  const rawWidgets = extractWidgets(raw);
  const tablesById = new Map<string, TableDefinition>();

  for (const widget of rawWidgets) {
    if (readWidgetType(widget) !== "TableWidget") {
      continue;
    }

    const definition = buildTableDefinition(widget);

    if (definition) {
      tablesById.set(definition.id, definition);
    }
  }

  const widgets: ProjectImportWidget[] = [];
  let unknownTypeCount = 0;
  let missingTextCount = 0;
  let geometryWarningCount = 0;

  for (const widget of rawWidgets) {
    const widgetType = readWidgetType(widget);

    if (widgetType === "TableWidget") {
      const definition = buildTableDefinition(widget);

      if (definition) {
        widgets.push(parseTableWidget(widget, definition));
      }

      continue;
    }

    if (widgetType === "TableCellWidget") {
      const parsedCell = parseTableCellWidget(widget, tablesById);

      if (parsedCell) {
        if (!parsedCell.widget.textContent) {
          missingTextCount += 1;
        }

        if (parsedCell.hasGeometryWarning) {
          geometryWarningCount += 1;
        }

        widgets.push(parsedCell.widget);
      }

      continue;
    }

    if (
      widgetType === "TextWidget" ||
      widgetType === "StickyNoteWidget" ||
      widgetType === "StickyNote"
    ) {
      const parsedWidget = parseTextLikeWidget(widget, "text");

      if (parsedWidget) {
        if (!parsedWidget.textContent) {
          missingTextCount += 1;
        }

        widgets.push(parsedWidget);
      }

      continue;
    }

    if (widgetType === "ShapeWidget") {
      const parsedWidget = parseTextLikeWidget(widget, "shape");

      if (parsedWidget) {
        if (!parsedWidget.textContent) {
          missingTextCount += 1;
        }

        widgets.push(parsedWidget);
      }

      continue;
    }

    unknownTypeCount += 1;
  }

  const report = {
    totalWidgets: rawWidgets.length,
    includedWidgets: widgets.length,
    droppedWidgets: rawWidgets.length - widgets.length,
    unknownTypeCount,
    missingTextCount,
    geometryWarningCount,
    warnings: [
      unknownTypeCount > 0
        ? `Droppet ${unknownTypeCount} widgets med ukjent type`
        : null,
      missingTextCount > 0
        ? `${missingTextCount} widgets manglet tekst etter HTML-stripping`
        : null,
      geometryWarningCount > 0
        ? `${geometryWarningCount} widgets hadde usikker tabellplassering`
        : null,
    ].filter((warning): warning is string => warning !== null),
  } satisfies ParsedMuralExport["report"];

  return {
    widgets,
    report,
  };
}
