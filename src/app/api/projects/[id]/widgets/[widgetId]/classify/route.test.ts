import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Route-level tests for PUT /api/projects/[id]/widgets/[widgetId]/classify
 * Tests the 409 paths: version mismatch, create-race, and 0-row update.
 */

vi.mock("@/lib/auth", () => ({
  withProtectedApiRoute: (handler: unknown) => handler,
}));

vi.mock("@/lib/logger", () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

const mockDb = {
  select: vi.fn(),
  from: vi.fn(),
  where: vi.fn(),
  limit: vi.fn(),
  update: vi.fn(),
  set: vi.fn(),
  insert: vi.fn(),
  values: vi.fn(),
  returning: vi.fn(),
};

// Chain builder for fluent DB API
function chainAll() {
  mockDb.select.mockReturnValue(mockDb);
  mockDb.from.mockReturnValue(mockDb);
  mockDb.where.mockReturnValue(mockDb);
  mockDb.limit.mockReturnValue(mockDb);
  mockDb.update.mockReturnValue(mockDb);
  mockDb.set.mockReturnValue(mockDb);
  mockDb.insert.mockReturnValue(mockDb);
  mockDb.values.mockReturnValue(mockDb);
  mockDb.returning.mockReturnValue(mockDb);
  return mockDb;
}

vi.mock("@/db/client", () => ({
  getDb: () => chainAll(),
}));

const validProjectId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const validWidgetId = "b2c3d4e5-f6a7-8901-bcde-f12345678901";

type RouteHandler = (req: Request, ctx: unknown) => Promise<Response>;

function makeRequest(body: Record<string, unknown>) {
  return new Request(
    `http://localhost/api/projects/${validProjectId}/widgets/${validWidgetId}/classify`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

const mockContext = {
  callId: "test-call-id",
  user: { oid: "oid-1", navIdent: "Z999999", name: "Test User", groups: [] },
};

describe("PUT /api/projects/[id]/widgets/[widgetId]/classify", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns 409 when version mismatch (optimistic concurrency)", async () => {
    // Setup: project exists, widget exists, classification exists with version 3
    mockDb.limit
      .mockResolvedValueOnce([{ id: validProjectId }]) // project
      .mockResolvedValueOnce([{ id: validWidgetId, version: 1 }]) // widget
      .mockResolvedValueOnce([{ id: "class-id-1", version: 3 }]); // existing classification

    const { PUT } = await import(
      "@/app/api/projects/[id]/widgets/[widgetId]/classify/route"
    );

    const body = {
      laneTypeKey: "brukerreise",
      laneTypeLabel: "Brukerreise",
      version: 2, // Stale: server has version 3
      expectedState: "classified",
    };

    const response = await (PUT as RouteHandler)(
      makeRequest(body),
      mockContext,
    );
    expect(response.status).toBe(409);

    const json = await response.json();
    expect(json.message).toContain("endret av noen andre");
  });

  it("returns 409 on create-race (classification already exists when client expects none)", async () => {
    // Setup: project exists, widget exists, classification exists
    mockDb.limit
      .mockResolvedValueOnce([{ id: validProjectId }]) // project
      .mockResolvedValueOnce([{ id: validWidgetId, version: 1 }]) // widget
      .mockResolvedValueOnce([{ id: "class-id-1", version: 1 }]); // existing classification

    const { PUT } = await import(
      "@/app/api/projects/[id]/widgets/[widgetId]/classify/route"
    );

    const body = {
      laneTypeKey: "brukerreise",
      laneTypeLabel: "Brukerreise",
      version: 1,
      expectedState: "unclassified", // Client thinks it's new
    };

    const response = await (PUT as RouteHandler)(
      makeRequest(body),
      mockContext,
    );
    expect(response.status).toBe(409);

    const json = await response.json();
    expect(json.message).toContain("allerede klassifisert");
  });

  it("returns 409 when update affects 0 rows (concurrent write between read and update)", async () => {
    // Setup: project exists, widget exists, classification exists with matching version
    mockDb.limit
      .mockResolvedValueOnce([{ id: validProjectId }]) // project
      .mockResolvedValueOnce([{ id: validWidgetId, version: 1 }]) // widget
      .mockResolvedValueOnce([{ id: "class-id-1", version: 2 }]); // existing classification

    // The update returns 0 affected rows (concurrent write happened between read and write)
    mockDb.returning.mockResolvedValueOnce([]);

    const { PUT } = await import(
      "@/app/api/projects/[id]/widgets/[widgetId]/classify/route"
    );

    const body = {
      laneTypeKey: "brukerreise",
      laneTypeLabel: "Brukerreise",
      version: 2, // Matches read, but another write happened
      expectedState: "classified",
    };

    const response = await (PUT as RouteHandler)(
      makeRequest(body),
      mockContext,
    );
    expect(response.status).toBe(409);

    const json = await response.json();
    expect(json.message).toContain("endret av noen andre");
  });

  it("preserves existing notes when update payload omits notes", async () => {
    mockDb.limit
      .mockResolvedValueOnce([{ id: validProjectId }])
      .mockResolvedValueOnce([{ id: validWidgetId, version: 1 }])
      .mockResolvedValueOnce([{ id: "class-id-1", version: 2 }]);
    mockDb.returning.mockResolvedValueOnce([{ id: "class-id-1" }]);

    const { PUT } = await import(
      "@/app/api/projects/[id]/widgets/[widgetId]/classify/route"
    );

    const response = await (PUT as RouteHandler)(
      makeRequest({
        laneTypeKey: "brukerreise",
        laneTypeLabel: "Brukerreise",
        version: 2,
        expectedState: "classified",
      }),
      mockContext,
    );

    expect(response.status).toBe(200);
    expect(mockDb.set).toHaveBeenCalledTimes(1);
    expect(mockDb.set.mock.calls[0]?.[0]).not.toHaveProperty("notes");
  });

  it("clears notes when update payload sets notes to null", async () => {
    mockDb.limit
      .mockResolvedValueOnce([{ id: validProjectId }])
      .mockResolvedValueOnce([{ id: validWidgetId, version: 1 }])
      .mockResolvedValueOnce([{ id: "class-id-1", version: 2 }]);
    mockDb.returning.mockResolvedValueOnce([{ id: "class-id-1" }]);

    const { PUT } = await import(
      "@/app/api/projects/[id]/widgets/[widgetId]/classify/route"
    );

    const response = await (PUT as RouteHandler)(
      makeRequest({
        laneTypeKey: "brukerreise",
        laneTypeLabel: "Brukerreise",
        notes: null,
        version: 2,
        expectedState: "classified",
      }),
      mockContext,
    );

    expect(response.status).toBe(200);
    expect(mockDb.set).toHaveBeenCalledTimes(1);
    expect(mockDb.set.mock.calls[0]?.[0]).toMatchObject({ notes: null });
  });

  it("stores missing notes as null when creating a classification", async () => {
    mockDb.limit
      .mockResolvedValueOnce([{ id: validProjectId }])
      .mockResolvedValueOnce([{ id: validWidgetId, version: 1 }])
      .mockResolvedValueOnce([]);
    mockDb.returning.mockResolvedValueOnce([{ id: "class-id-1", version: 1 }]);

    const { PUT } = await import(
      "@/app/api/projects/[id]/widgets/[widgetId]/classify/route"
    );

    const response = await (PUT as RouteHandler)(
      makeRequest({
        laneTypeKey: "brukerreise",
        laneTypeLabel: "Brukerreise",
        version: 1,
        expectedState: "unclassified",
      }),
      mockContext,
    );

    expect(response.status).toBe(201);
    expect(mockDb.values).toHaveBeenCalledTimes(1);
    expect(mockDb.values.mock.calls[0]?.[0]).toMatchObject({ notes: null });
  });

  it("returns 409 when update attempted but classification was deleted", async () => {
    // Setup: project exists, widget exists, NO classification
    mockDb.limit
      .mockResolvedValueOnce([{ id: validProjectId }]) // project
      .mockResolvedValueOnce([{ id: validWidgetId, version: 1 }]) // widget
      .mockResolvedValueOnce([]); // no classification

    const { PUT } = await import(
      "@/app/api/projects/[id]/widgets/[widgetId]/classify/route"
    );

    const body = {
      laneTypeKey: "brukerreise",
      laneTypeLabel: "Brukerreise",
      version: 2,
      expectedState: "classified", // Client expects it exists
    };

    const response = await (PUT as RouteHandler)(
      makeRequest(body),
      mockContext,
    );
    expect(response.status).toBe(409);

    const json = await response.json();
    expect(json.message).toContain("finnes ikke lenger");
  });

  it("returns 409 when Drizzle-wrapped insert throws unique violation (cause.code)", async () => {
    // Setup: project exists, widget exists, no classification at read time
    mockDb.limit
      .mockResolvedValueOnce([{ id: validProjectId }]) // project
      .mockResolvedValueOnce([{ id: validWidgetId, version: 1 }]) // widget
      .mockResolvedValueOnce([]); // no classification at read time

    // Drizzle wraps the PG error — code is on cause, not on the top-level error
    const pgError = new Error("duplicate key value violates unique constraint");
    (pgError as unknown as Record<string, unknown>).code = "23505";

    const drizzleError = new Error("Query failed");
    (drizzleError as unknown as Record<string, unknown>).cause = pgError;
    mockDb.returning.mockRejectedValueOnce(drizzleError);

    const { PUT } = await import(
      "@/app/api/projects/[id]/widgets/[widgetId]/classify/route"
    );

    const body = {
      laneTypeKey: "brukerreise",
      laneTypeLabel: "Brukerreise",
      version: 1,
      expectedState: "unclassified",
    };

    const response = await (PUT as RouteHandler)(
      makeRequest(body),
      mockContext,
    );
    expect(response.status).toBe(409);

    const json = await response.json();
    expect(json.message).toContain("allerede klassifisert");
  });

  it("returns 409 when insert throws unique violation (DB-level create-race)", async () => {
    // Setup: project exists, widget exists, no classification at read time
    mockDb.limit
      .mockResolvedValueOnce([{ id: validProjectId }]) // project
      .mockResolvedValueOnce([{ id: validWidgetId, version: 1 }]) // widget
      .mockResolvedValueOnce([]); // no classification at read time

    // Insert throws unique constraint violation (another request inserted between read and write)
    const uniqueViolationError = new Error(
      "duplicate key value violates unique constraint",
    );
    (uniqueViolationError as unknown as Record<string, unknown>).code = "23505";
    mockDb.returning.mockRejectedValueOnce(uniqueViolationError);

    const { PUT } = await import(
      "@/app/api/projects/[id]/widgets/[widgetId]/classify/route"
    );

    const body = {
      laneTypeKey: "brukerreise",
      laneTypeLabel: "Brukerreise",
      version: 1,
      expectedState: "unclassified",
    };

    const response = await (PUT as RouteHandler)(
      makeRequest(body),
      mockContext,
    );
    expect(response.status).toBe(409);

    const json = await response.json();
    expect(json.message).toContain("allerede klassifisert");
  });
});
