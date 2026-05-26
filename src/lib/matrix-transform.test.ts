import { describe, expect, it } from "vitest";
import {
  buildMatrixModel,
  type MatrixWidget,
  stripHtml,
  truncatePreview,
} from "./matrix-transform";

describe("stripHtml", () => {
  it("removes HTML tags", () => {
    expect(stripHtml("<p>Hello <b>world</b></p>")).toBe("Hello world");
  });

  it("trims whitespace", () => {
    expect(stripHtml("  hello  ")).toBe("hello");
  });

  it("handles empty string", () => {
    expect(stripHtml("")).toBe("");
  });
});

describe("truncatePreview", () => {
  it("returns full text if under limit", () => {
    expect(truncatePreview("Kort tekst", 80)).toBe("Kort tekst");
  });

  it("truncates with ellipsis when exceeding limit", () => {
    const long = "A".repeat(100);
    const result = truncatePreview(long, 80);
    expect(result).toHaveLength(81); // 80 chars + ellipsis
    expect(result.endsWith("…")).toBe(true);
  });

  it("strips HTML before truncating", () => {
    expect(truncatePreview("<b>Hello</b>", 3)).toBe("Hel…");
  });
});

describe("buildMatrixModel", () => {
  const makeWidget = (overrides: Partial<MatrixWidget> = {}): MatrixWidget => ({
    id: "w1",
    widgetType: "sticky_note",
    textContent: "Test",
    backgroundColor: null,
    rowIndex: null,
    columnIndex: null,
    classification: null,
    ...overrides,
  });

  it("returns empty model for empty input", () => {
    const model = buildMatrixModel([]);
    expect(model.rows).toHaveLength(0);
    expect(model.columns).toHaveLength(0);
    expect(model.unplacedWidgets).toHaveLength(0);
    expect(model.totalWidgets).toBe(0);
  });

  it("places widgets without row/column in unplacedWidgets", () => {
    const widgets = [
      makeWidget({ id: "w1", rowIndex: null, columnIndex: null }),
      makeWidget({ id: "w2", rowIndex: 0, columnIndex: null }),
      makeWidget({ id: "w3", rowIndex: null, columnIndex: 1 }),
    ];

    const model = buildMatrixModel(widgets);
    expect(model.unplacedWidgets).toHaveLength(3);
    expect(model.rows).toHaveLength(0);
  });

  it("groups widgets by row and column", () => {
    const widgets = [
      makeWidget({ id: "w1", rowIndex: 0, columnIndex: 0 }),
      makeWidget({ id: "w2", rowIndex: 0, columnIndex: 1 }),
      makeWidget({ id: "w3", rowIndex: 1, columnIndex: 0 }),
      makeWidget({ id: "w4", rowIndex: 1, columnIndex: 1 }),
    ];

    const model = buildMatrixModel(widgets);
    expect(model.rows).toHaveLength(2);
    expect(model.columns).toHaveLength(2);
    expect(model.unplacedWidgets).toHaveLength(0);
    expect(model.totalWidgets).toBe(4);

    // First row has two cells
    expect(model.rows[0].cells).toHaveLength(2);
    expect(model.rows[0].cells[0].widgets).toHaveLength(1);
    expect(model.rows[0].cells[0].widgets[0].id).toBe("w1");
  });

  it("places multiple widgets in the same cell", () => {
    const widgets = [
      makeWidget({ id: "w1", rowIndex: 0, columnIndex: 0 }),
      makeWidget({ id: "w2", rowIndex: 0, columnIndex: 0 }),
    ];

    const model = buildMatrixModel(widgets);
    expect(model.rows[0].cells[0].widgets).toHaveLength(2);
  });

  it("sorts rows and columns by index", () => {
    const widgets = [
      makeWidget({ id: "w1", rowIndex: 3, columnIndex: 5 }),
      makeWidget({ id: "w2", rowIndex: 1, columnIndex: 2 }),
    ];

    const model = buildMatrixModel(widgets);
    expect(model.rows[0].rowIndex).toBe(1);
    expect(model.rows[1].rowIndex).toBe(3);
    expect(model.columns[0].columnIndex).toBe(2);
    expect(model.columns[1].columnIndex).toBe(5);
  });

  it("creates empty cells for sparse grids", () => {
    const widgets = [
      makeWidget({ id: "w1", rowIndex: 0, columnIndex: 0 }),
      makeWidget({ id: "w2", rowIndex: 1, columnIndex: 1 }),
    ];

    const model = buildMatrixModel(widgets);
    // Row 0 should have cells at column 0 and column 1
    expect(model.rows[0].cells).toHaveLength(2);
    expect(model.rows[0].cells[0].widgets).toHaveLength(1);
    expect(model.rows[0].cells[1].widgets).toHaveLength(0); // sparse cell
  });

  it("includes classification data in widgets", () => {
    const widgets = [
      makeWidget({
        id: "w1",
        rowIndex: 0,
        columnIndex: 0,
        classification: {
          laneTypeKey: "motivasjon",
          laneTypeLabel: "Motivasjon",
          status: "draft",
        },
      }),
    ];

    const model = buildMatrixModel(widgets);
    const cell = model.rows[0].cells[0];
    expect(cell.widgets[0].classification?.laneTypeLabel).toBe("Motivasjon");
  });
});
