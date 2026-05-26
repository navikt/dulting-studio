import { describe, expect, it, vi } from "vitest";
import { type FetchedWidget, fetchAllWidgetPages } from "./fetch-all-widgets";

function makeWidget(id: string): FetchedWidget {
  return {
    id,
    widgetType: "sticky_note",
    textContent: `Widget ${id}`,
    backgroundColor: null,
    rowIndex: null,
    columnIndex: null,
    classification: null,
  };
}

function mockFetchPages(pages: FetchedWidget[][], total: number): typeof fetch {
  let callCount = 0;
  return vi.fn(async () => {
    const pageIndex = callCount;
    callCount++;
    const items = pages[pageIndex] ?? [];
    return new Response(
      JSON.stringify({
        items,
        total,
        totalPages: pages.length,
        page: pageIndex + 1,
        pageSize: items.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as unknown as typeof fetch;
}

describe("fetchAllWidgetPages", () => {
  it("fetches a single page when totalPages is 1", async () => {
    const widgets = [makeWidget("w1"), makeWidget("w2")];
    const fetcher = mockFetchPages([widgets], 2);

    const result = await fetchAllWidgetPages("project-1", fetcher, 200);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.widgets).toHaveLength(2);
      expect(result.widgets[0].id).toBe("w1");
    }
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("combines widgets from multiple pages", async () => {
    const page1 = Array.from({ length: 3 }, (_, i) => makeWidget(`p1-${i}`));
    const page2 = Array.from({ length: 3 }, (_, i) => makeWidget(`p2-${i}`));
    const page3 = [makeWidget("p3-0")];
    const fetcher = mockFetchPages([page1, page2, page3], 7);

    const result = await fetchAllWidgetPages("project-1", fetcher, 3);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.widgets).toHaveLength(7);
      expect(result.widgets[0].id).toBe("p1-0");
      expect(result.widgets[3].id).toBe("p2-0");
      expect(result.widgets[6].id).toBe("p3-0");
    }
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it("returns error when API returns non-OK status", async () => {
    const fetcher = vi.fn(
      async () =>
        new Response(JSON.stringify({ message: "Prosjektet finnes ikke" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }),
    ) as unknown as typeof fetch;

    const result = await fetchAllWidgetPages("missing-id", fetcher, 200);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(404);
      expect(result.message).toBe("Prosjektet finnes ikke");
    }
  });

  it("passes correct URL with page and pageSize", async () => {
    const fetcher = mockFetchPages([[makeWidget("w1")]], 1);

    await fetchAllWidgetPages("abc-123", fetcher, 100);

    expect(fetcher).toHaveBeenCalledWith(
      "/api/projects/abc-123/widgets?pageSize=100&page=1",
    );
  });

  it("stops fetching if a subsequent page fails", async () => {
    let callCount = 0;
    const fetcher = vi.fn(async () => {
      callCount++;
      if (callCount === 1) {
        return new Response(
          JSON.stringify({
            items: [makeWidget("w1")],
            total: 5,
            totalPages: 3,
            page: 1,
            pageSize: 2,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({ message: "Intern feil" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }) as unknown as typeof fetch;

    const result = await fetchAllWidgetPages("project-1", fetcher, 2);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(500);
    }
  });
});
