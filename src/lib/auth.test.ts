import { beforeEach, describe, expect, it, vi } from "vitest";

const getToken = vi.fn();
const parseAzureUserToken = vi.fn();
const validateAzureToken = vi.fn();

vi.mock("@navikt/oasis", () => ({
  getToken,
  parseAzureUserToken,
  validateAzureToken,
}));

describe("withProtectedApiRoute", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("rejects missing bearer token", async () => {
    getToken.mockReturnValueOnce(null);

    const { withProtectedApiRoute } = await import("./auth");
    const handler = vi.fn();

    const response = await withProtectedApiRoute(handler)(
      new Request("https://dulting-studio.intern.dev.nav.no/api/import", {
        method: "GET",
      }),
    );

    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      message: "Access denied",
    });
  });

  it("rejects unsafe cross-origin requests before token validation", async () => {
    const { withProtectedApiRoute } = await import("./auth");
    const handler = vi.fn();

    const response = await withProtectedApiRoute(handler)(
      new Request("https://dulting-studio.intern.dev.nav.no/api/import", {
        method: "POST",
        headers: {
          origin: "https://evil.example.com",
        },
      }),
    );

    expect(response.status).toBe(403);
    expect(validateAzureToken).not.toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
  });

  it("accepts unsafe requests behind a reverse proxy via x-forwarded headers", async () => {
    getToken.mockReturnValueOnce("token");
    validateAzureToken.mockResolvedValueOnce({ ok: true, payload: {} });
    parseAzureUserToken.mockReturnValueOnce({
      ok: true,
      oid: "oid-123",
      NAVident: "Z123456",
      groups: [],
    });

    const { withProtectedApiRoute } = await import("./auth");
    const handler = vi.fn(() => Response.json({ ok: true }));

    // Intern URL er http://localhost:3000 (Wonderwall→app), men browseren
    // poster fra den eksterne https-origin som proxyen videreformidler.
    const response = await withProtectedApiRoute(handler)(
      new Request("http://localhost:3000/api/pakke-tiltak", {
        method: "PUT",
        headers: {
          authorization: "Bearer token",
          origin: "https://dulting-studio.intern.nav.no",
          "x-forwarded-host": "dulting-studio.intern.nav.no",
          "x-forwarded-proto": "https",
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalled();
  });

  it("still rejects cross-origin unsafe requests even with forwarded headers", async () => {
    const { withProtectedApiRoute } = await import("./auth");
    const handler = vi.fn();

    const response = await withProtectedApiRoute(handler)(
      new Request("http://localhost:3000/api/pakke-tiltak", {
        method: "PUT",
        headers: {
          origin: "https://evil.example.com",
          "x-forwarded-host": "dulting-studio.intern.nav.no",
          "x-forwarded-proto": "https",
        },
      }),
    );

    expect(response.status).toBe(403);
    expect(validateAzureToken).not.toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
  });

  it("passes authenticated Azure user and callId to handler", async () => {
    getToken.mockReturnValueOnce("token");
    validateAzureToken.mockResolvedValueOnce({
      ok: true,
      payload: {
        oid: "oid-123",
        NAVident: "Z123456",
        groups: ["group-1"],
        name: "Nav Ansatt",
        preferred_username: "nav.ansatt@nav.no",
      },
    });
    parseAzureUserToken.mockReturnValueOnce({
      ok: true,
      oid: "oid-123",
      NAVident: "Z123456",
      groups: ["group-1"],
      name: "Nav Ansatt",
      preferred_username: "nav.ansatt@nav.no",
    });

    const { withProtectedApiRoute } = await import("./auth");

    const response = await withProtectedApiRoute((_request, context) => {
      return Response.json({
        navIdent: context.user.navIdent,
        callId: context.callId,
        groups: context.user.groups,
      });
    })(
      new Request("https://dulting-studio.intern.dev.nav.no/api/projects", {
        method: "POST",
        headers: {
          authorization: "Bearer token",
          origin: "https://dulting-studio.intern.dev.nav.no",
          "nav-callid": "call-123",
        },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      navIdent: "Z123456",
      callId: "call-123",
      groups: ["group-1"],
    });
  });

  it("rejects request without required Azure AD group", async () => {
    getToken.mockReturnValueOnce("token");
    validateAzureToken.mockResolvedValueOnce({
      ok: true,
      payload: {
        oid: "oid-123",
        NAVident: "Z123456",
        groups: ["group-1"],
      },
    });
    parseAzureUserToken.mockReturnValueOnce({
      ok: true,
      oid: "oid-123",
      NAVident: "Z123456",
      groups: ["group-1"],
    });

    const { withProtectedApiRoute } = await import("./auth");
    const handler = vi.fn();

    const response = await withProtectedApiRoute(handler, {
      requiredAzureAdGroups: ["group-2"],
    })(
      new Request("https://dulting-studio.intern.dev.nav.no/api/projects", {
        method: "POST",
        headers: {
          authorization: "Bearer token",
          origin: "https://dulting-studio.intern.dev.nav.no",
        },
      }),
    );

    expect(response.status).toBe(403);
    expect(handler).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      message: "Access denied",
    });
  });

  it("allows explicit local auth mock outside production", async () => {
    vi.stubEnv("LOCAL_AUTH_MOCK_ENABLED", "true");
    vi.stubEnv("LOCAL_AUTH_MOCK_NAV_IDENT", "Z123456");
    vi.stubEnv("LOCAL_AUTH_MOCK_GROUPS", "group-1, group-2");

    const { withProtectedApiRoute } = await import("./auth");

    const response = await withProtectedApiRoute(
      (_request, context) =>
        Response.json({
          navIdent: context.user.navIdent,
          groups: context.user.groups,
        }),
      { requiredAzureAdGroups: ["group-2"] },
    )(
      new Request("http://localhost:3000/api/projects/import", {
        method: "POST",
        headers: {
          origin: "http://localhost:3000",
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(getToken).not.toHaveBeenCalled();
    expect(validateAzureToken).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      navIdent: "Z123456",
      groups: ["group-1", "group-2"],
    });
  });

  it("does not allow local auth mock in production", async () => {
    vi.stubEnv("LOCAL_AUTH_MOCK_ENABLED", "true");
    vi.stubEnv("NODE_ENV", "production");
    getToken.mockReturnValueOnce(null);

    const { withProtectedApiRoute } = await import("./auth");
    const handler = vi.fn();

    const response = await withProtectedApiRoute(handler)(
      new Request("https://dulting-studio.intern.nav.no/api/projects/import", {
        method: "GET",
      }),
    );

    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });
});
