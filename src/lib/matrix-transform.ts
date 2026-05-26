/**
 * Matrix transformation utilities.
 * Groups flat widget data into a row × column matrix structure
 * for the JourneyMatrix visualization.
 *
 * Pure functions — no database dependency, fully testable.
 */

export type MatrixWidget = {
  id: string;
  widgetType: string;
  textContent: string;
  backgroundColor: string | null;
  rowIndex: number | null;
  columnIndex: number | null;
  classification: {
    laneTypeKey: string | null;
    laneTypeLabel: string | null;
    status: string | null;
  } | null;
};

export type MatrixCell = {
  rowIndex: number;
  columnIndex: number;
  widgets: MatrixWidget[];
};

export type MatrixRow = {
  rowIndex: number;
  label: string;
  cells: MatrixCell[];
};

export type MatrixModel = {
  rows: MatrixRow[];
  columns: { columnIndex: number; label: string }[];
  unplacedWidgets: MatrixWidget[];
  totalWidgets: number;
};

/**
 * Strip HTML tags for safe text display.
 */
export function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

/**
 * Truncate text to a max length, adding ellipsis if truncated.
 */
export function truncatePreview(text: string, maxLength = 80): string {
  const clean = stripHtml(text);
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength)}…`;
}

/**
 * Transform a flat list of widgets into a structured matrix model
 * grouped by rowIndex and columnIndex.
 *
 * Widgets without row/column indices are placed in `unplacedWidgets`.
 */
export function buildMatrixModel(widgets: MatrixWidget[]): MatrixModel {
  const placed: MatrixWidget[] = [];
  const unplaced: MatrixWidget[] = [];

  for (const widget of widgets) {
    if (widget.rowIndex !== null && widget.columnIndex !== null) {
      placed.push(widget);
    } else {
      unplaced.push(widget);
    }
  }

  // Discover unique row and column indices
  const rowIndices = new Set<number>();
  const columnIndices = new Set<number>();

  for (const widget of placed) {
    rowIndices.add(widget.rowIndex as number);
    columnIndices.add(widget.columnIndex as number);
  }

  const sortedRows = [...rowIndices].sort((a, b) => a - b);
  const sortedColumns = [...columnIndices].sort((a, b) => a - b);

  // Group widgets into cells
  const cellMap = new Map<string, MatrixWidget[]>();
  for (const widget of placed) {
    const key = `${widget.rowIndex}:${widget.columnIndex}`;
    const existing = cellMap.get(key);
    if (existing) {
      existing.push(widget);
    } else {
      cellMap.set(key, [widget]);
    }
  }

  // Build row structures
  const rows: MatrixRow[] = sortedRows.map((rowIndex) => {
    const cells: MatrixCell[] = sortedColumns.map((columnIndex) => {
      const key = `${rowIndex}:${columnIndex}`;
      return {
        rowIndex,
        columnIndex,
        widgets: cellMap.get(key) ?? [],
      };
    });

    return {
      rowIndex,
      label: `Rad ${rowIndex}`,
      cells,
    };
  });

  const columns = sortedColumns.map((columnIndex) => ({
    columnIndex,
    label: `Kolonne ${columnIndex}`,
  }));

  return {
    rows,
    columns,
    unplacedWidgets: unplaced,
    totalWidgets: widgets.length,
  };
}
