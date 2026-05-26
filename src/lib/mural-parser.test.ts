import { describe, expect, it } from "vitest";
import fixture from "../../fixtures/sanitized-mural-export.json";
import { parseMuralExport, stripHtmlToPlainText } from "./mural-parser";

describe("parseMuralExport", () => {
  it("parses tables and table cells with resolved row and column indexes", () => {
    const parsed = parseMuralExport(fixture);
    const tableWidget = parsed.widgets.find(
      (widget) => widget.widgetType === "table",
    );
    const tableCellWidget = parsed.widgets.find(
      (widget) => widget.muralWidgetId === "cell-1",
    );

    expect(tableWidget).toMatchObject({
      muralWidgetId: "table-1",
      widgetType: "table",
      metadata: {
        tableColumns: [
          { id: "column-1", index: 0, label: "Fase" },
          { id: "column-2", index: 1, label: "Tiltak" },
        ],
        tableRows: [
          { id: "row-1", index: 0, label: "Rad 1" },
          { id: "row-2", index: 1, label: "Rad 2" },
        ],
      },
    });

    expect(tableCellWidget).toMatchObject({
      muralWidgetId: "cell-1",
      widgetType: "table-cell",
      parentMuralWidgetId: "table-1",
      rowId: "row-1",
      rowIndex: 0,
      columnId: "column-2",
      columnIndex: 1,
      textContent: "Første tiltak",
    });
  });

  it("parses text-like widgets and strips HTML down to plain text", () => {
    const parsed = parseMuralExport(fixture);

    expect(parsed.widgets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          muralWidgetId: "text-1",
          widgetType: "text",
          textContent: "Hei verden",
          backgroundColor: "#FFF3CD",
        }),
        expect.objectContaining({
          muralWidgetId: "shape-1",
          widgetType: "shape",
          textContent: "Boks tekst",
          backgroundColor: "#D1FADF",
        }),
        expect.objectContaining({
          muralWidgetId: "note-empty",
          widgetType: "text",
          textContent: "",
        }),
      ]),
    );

    expect(
      stripHtmlToPlainText(
        "<div>Linje&nbsp;1<br/>Linje <strong>2</strong></div>",
      ),
    ).toBe("Linje 1 Linje 2");
  });

  it("drops forbidden Mural fields from parser output and reports unknown widgets", () => {
    const parsed = parseMuralExport(fixture);
    const serializedOutput = JSON.stringify(parsed);

    expect(serializedOutput).not.toContain("owner");
    expect(serializedOutput).not.toContain("lastUpdateBy");
    expect(serializedOutput).not.toContain("thumbUrl");
    expect(serializedOutput).not.toContain("token");
    expect(serializedOutput).not.toContain("htmlText");
    expect(serializedOutput).not.toContain("rawHtml");

    expect(parsed.report).toMatchObject({
      totalWidgets: 6,
      includedWidgets: 5,
      droppedWidgets: 1,
      unknownTypeCount: 1,
      missingTextCount: 1,
      geometryWarningCount: 0,
    });
    expect(parsed.report.warnings).toEqual(
      expect.arrayContaining([
        "Droppet 1 widgets med ukjent type",
        "1 widgets manglet tekst etter HTML-stripping",
      ]),
    );
  });
});
