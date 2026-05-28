import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  withProtectedApiRoute: (handler: unknown) => handler,
}));

vi.mock("@/lib/logger", () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
}));

const projectId = "11111111-1111-4111-8111-111111111111";

type MockRouteContext = {
  callId: string;
  user: {
    oid: string;
    navIdent: string;
    groups: string[];
  };
};

const context: MockRouteContext = {
  callId: "call-123",
  user: {
    oid: "oid-1",
    navIdent: "Z123456",
    groups: [],
  },
};

type RouteHandler = (
  request: Request,
  context: MockRouteContext,
) => Promise<Response>;

const mockDb = {
  select: vi.fn(),
};

vi.mock("@/db/client", () => ({
  getDb: () => mockDb,
}));

function createProjectQuery(result: unknown) {
  const limit = vi.fn().mockResolvedValue(result);
  const where = vi.fn().mockReturnValue({ limit });
  const from = vi.fn().mockReturnValue({ where });
  return { from, where, limit };
}

function createCountQuery(result: unknown) {
  const where = vi.fn().mockResolvedValue(result);
  const leftJoin = vi.fn().mockReturnValue({ where });
  const from = vi.fn().mockReturnValue({ leftJoin });
  return { from, leftJoin, where };
}

function createItemsQuery(result: unknown) {
  const offset = vi.fn().mockResolvedValue(result);
  const limit = vi.fn().mockReturnValue({ offset });
  const orderBy = vi.fn().mockReturnValue({ limit });
  const where = vi.fn().mockReturnValue({ orderBy });
  const leftJoin = vi.fn().mockReturnValue({ where });
  const from = vi.fn().mockReturnValue({ leftJoin });
  return { from, leftJoin, where, orderBy, limit, offset };
}

describe("GET /api/projects/[id]/widgets", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns widget items without classification notes or raw metadata fields", async () => {
    const projectQuery = createProjectQuery([{ id: projectId, name: "Tema" }]);
    const countQuery = createCountQuery([{ totalCount: 1 }]);
    const itemsQuery = createItemsQuery([
      {
        id: "22222222-2222-4222-8222-222222222222",
        muralWidgetId: "mural-widget-1",
        widgetType: "text",
        textContent: "Et kort widget-utdrag",
        backgroundColor: "#FFF3CD",
        rowIndex: 1,
        columnIndex: 2,
        rowId: "row-1",
        columnId: "column-1",
        x: 10,
        y: 20,
        width: 300,
        height: 100,
        createdAt: new Date("2024-09-01T10:00:00.000Z"),
        classificationId: "33333333-3333-4333-8333-333333333333",
        laneTypeKey: "friction",
        laneTypeLabel: "Friksjon",
        classificationVersion: 2,
        classificationScenario: "sykmeldt",
        classificationActorTrack: "arbeidstaker",
        classificationJourneyStep: "oppfølging",
        classificationJourneyIndex: 4,
        classificationStatus: "classified",
      },
    ]);

    mockDb.select
      .mockReturnValueOnce(projectQuery)
      .mockReturnValueOnce(countQuery)
      .mockReturnValueOnce(itemsQuery);

    const { GET } = await import("./route");
    const { logInfo } = await import("@/lib/logger");
    const response = await (GET as RouteHandler)(
      new Request(`https://example.com/api/projects/${projectId}/widgets`, {
        method: "GET",
      }),
      context,
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      items: [
        {
          id: "22222222-2222-4222-8222-222222222222",
          muralWidgetId: "mural-widget-1",
          widgetType: "text",
          textContent: "Et kort widget-utdrag",
          backgroundColor: "#FFF3CD",
          rowIndex: 1,
          columnIndex: 2,
          position: {
            x: 10,
            y: 20,
            width: 300,
            height: 100,
          },
          classification: {
            laneTypeKey: "friction",
            laneTypeLabel: "Friksjon",
            version: 2,
            scenario: "sykmeldt",
            actorTrack: "arbeidstaker",
            journeyStep: "oppfølging",
            journeyIndex: 4,
            status: "classified",
          },
          createdAt: "2024-09-01T10:00:00.000Z",
        },
      ],
      page: 1,
      pageSize: 50,
      total: 1,
      totalPages: 1,
      callId: "call-123",
    });
    expect(JSON.stringify(payload)).not.toContain("metadata");
    expect(JSON.stringify(payload)).not.toContain("rowId");
    expect(JSON.stringify(payload)).not.toContain("columnId");
    expect(JSON.stringify(payload)).not.toContain("notes");
    expect(logInfo).toHaveBeenCalledWith("Served widget list", {
      callId: "call-123",
      projectId,
      page: 1,
      pageSize: 50,
      total: 1,
      resultCount: 1,
    });
    expect(JSON.stringify(vi.mocked(logInfo).mock.calls)).not.toContain(
      "Et kort widget-utdrag",
    );
  });

  it("rejects invalid triage filter params before database lookup", async () => {
    const { GET } = await import("./route");

    const response = await (GET as RouteHandler)(
      new Request(
        `https://example.com/api/projects/${projectId}/widgets?actorTrack=%3Cscript%3E&placement=floating`,
        { method: "GET" },
      ),
      context,
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.errors).toEqual([
      { field: "actorTrack", message: "Ugyldig filterverdi" },
      { field: "placement", message: "Må være 'unplaced'" },
    ]);
    expect(mockDb.select).not.toHaveBeenCalled();
  });
});
