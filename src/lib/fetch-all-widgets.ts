/**
 * Fetches all pages of widgets for a project from the API.
 * Used by the matrix view to ensure the complete dataset is shown.
 */

export type FetchedWidget = {
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

export type FetchAllResult =
  | { ok: true; widgets: FetchedWidget[] }
  | { ok: false; status: number; message: string };

type PageResponse = {
  items: FetchedWidget[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
};

/**
 * Fetches all widget pages for a project by iterating through paginated results.
 * Returns the combined list of all widgets across all pages.
 *
 * @param projectId - The project UUID
 * @param fetcher - A fetch function (defaults to global fetch, injectable for testing)
 * @param pageSize - Number of items per page (default 200)
 */
export async function fetchAllWidgetPages(
  projectId: string,
  fetcher: typeof fetch = fetch,
  pageSize = 200,
): Promise<FetchAllResult> {
  let allWidgets: FetchedWidget[] = [];
  let currentPage = 1;
  let totalPages = 1;

  while (currentPage <= totalPages) {
    const response = await fetcher(
      `/api/projects/${projectId}/widgets?pageSize=${pageSize}&page=${currentPage}`,
    );

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      return {
        ok: false,
        status: response.status,
        message:
          body?.message || `Feil ved henting av widgets (${response.status})`,
      };
    }

    const data: PageResponse = await response.json();
    totalPages = data.totalPages ?? 1;
    allWidgets = allWidgets.concat(data.items);
    currentPage++;
  }

  return { ok: true, widgets: allWidgets };
}
