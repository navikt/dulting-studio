import {
  getToken,
  parseAzureUserToken,
  validateAzureToken,
} from "@navikt/oasis";
import { logError, logWarn } from "./logger";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const LOCAL_AUTH_MOCK_ENABLED = "LOCAL_AUTH_MOCK_ENABLED";

export type AuthenticatedAzureUser = {
  oid: string;
  navIdent: string;
  name?: string;
  preferredUsername?: string;
  groups: string[];
};

export type ProtectedApiContext = {
  callId: string;
  user: AuthenticatedAzureUser;
};

type ProtectedApiHandler = (
  request: Request,
  context: ProtectedApiContext,
) => Promise<Response> | Response;

type AuthorizeOptions = {
  requireSameOriginForUnsafeMethods?: boolean;
  requiredAzureAdGroups?: readonly string[];
};

class RequestAuthorizationError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getCallId(request: Request) {
  return (
    request.headers.get("nav-callid") ??
    request.headers.get("x-correlation-id") ??
    crypto.randomUUID()
  );
}

function isSafeMethod(method: string) {
  return SAFE_METHODS.has(method.toUpperCase());
}

function isLocalAuthMockEnabled() {
  return (
    process.env[LOCAL_AUTH_MOCK_ENABLED] === "true" &&
    process.env.NODE_ENV !== "production"
  );
}

function getLocalAuthMockUser() {
  const groups = process.env.LOCAL_AUTH_MOCK_GROUPS?.split(",")
    .map((group) => group.trim())
    .filter(Boolean);

  return {
    oid: process.env.LOCAL_AUTH_MOCK_OID ?? "local-auth-mock-oid",
    navIdent: process.env.LOCAL_AUTH_MOCK_NAV_IDENT ?? "Z999999",
    name: process.env.LOCAL_AUTH_MOCK_NAME ?? "Lokal utvikler",
    preferredUsername: process.env.LOCAL_AUTH_MOCK_EMAIL ?? "local.dev@nav.no",
    groups: groups ?? [],
  } satisfies AuthenticatedAzureUser;
}

function ensureSameOriginForUnsafeMethod(request: Request) {
  if (isSafeMethod(request.method)) {
    return;
  }

  const expectedOrigin = new URL(request.url).origin;
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (origin) {
    if (origin !== expectedOrigin) {
      throw new RequestAuthorizationError(
        403,
        "Cross-origin requests are not allowed",
      );
    }

    return;
  }

  if (referer) {
    let refererOrigin: string;

    try {
      refererOrigin = new URL(referer).origin;
    } catch {
      throw new RequestAuthorizationError(403, "Invalid referer header");
    }

    if (refererOrigin !== expectedOrigin) {
      throw new RequestAuthorizationError(
        403,
        "Cross-origin requests are not allowed",
      );
    }

    return;
  }

  throw new RequestAuthorizationError(403, "Missing CSRF headers");
}

export function getAuthenticatedAzureUser(
  token: string,
  validation: Awaited<ReturnType<typeof validateAzureToken>>,
) {
  if (!validation.ok) {
    throw new RequestAuthorizationError(401, "Invalid Azure token");
  }

  const parsedUser = parseAzureUserToken(token);

  if (!parsedUser.ok || !parsedUser.oid || !parsedUser.NAVident) {
    throw new RequestAuthorizationError(401, "Missing required Azure claims");
  }

  return {
    oid: parsedUser.oid,
    navIdent: parsedUser.NAVident,
    name: parsedUser.name,
    preferredUsername: parsedUser.preferred_username,
    groups: parsedUser.groups ?? [],
  } satisfies AuthenticatedAzureUser;
}

function ensureRequiredAzureAdGroups(
  user: AuthenticatedAzureUser,
  requiredAzureAdGroups: readonly string[] | undefined,
) {
  if (!requiredAzureAdGroups?.length) {
    return;
  }

  const userGroups = new Set(user.groups);
  const isMemberOfRequiredGroup = requiredAzureAdGroups.some((group) =>
    userGroups.has(group),
  );

  if (!isMemberOfRequiredGroup) {
    throw new RequestAuthorizationError(403, "Missing required Azure AD group");
  }
}

async function authorizeRequest(
  request: Request,
  options: AuthorizeOptions = {},
): Promise<ProtectedApiContext> {
  const callId = getCallId(request);

  if (options.requireSameOriginForUnsafeMethods ?? true) {
    ensureSameOriginForUnsafeMethod(request);
  }

  if (isLocalAuthMockEnabled()) {
    const user = getLocalAuthMockUser();

    ensureRequiredAzureAdGroups(user, options.requiredAzureAdGroups);
    logWarn("Using local auth mock for protected API request", {
      callId,
      path: new URL(request.url).pathname,
      method: request.method,
    });

    return {
      callId,
      user,
    };
  }

  const token = getToken(request);

  if (!token) {
    throw new RequestAuthorizationError(401, "Missing bearer token");
  }

  let validation: Awaited<ReturnType<typeof validateAzureToken>>;

  try {
    validation = await validateAzureToken(token);
  } catch (error) {
    throw new RequestAuthorizationError(
      503,
      error instanceof Error
        ? error.message
        : "Azure token validation is unavailable",
    );
  }

  const user = getAuthenticatedAzureUser(token, validation);

  ensureRequiredAzureAdGroups(user, options.requiredAzureAdGroups);

  return {
    callId,
    user,
  };
}

function createErrorResponse(status: number, message: string, callId: string) {
  return Response.json(
    {
      message,
      callId,
    },
    { status },
  );
}

export function withProtectedApiRoute(
  handler: ProtectedApiHandler,
  options: AuthorizeOptions = {},
) {
  return async function protectedRoute(request: Request) {
    const callId = getCallId(request);

    try {
      const context = await authorizeRequest(request, options);

      return handler(request, context);
    } catch (error) {
      if (error instanceof RequestAuthorizationError) {
        const log = error.status >= 500 ? logError : logWarn;

        log("Rejected protected API request", {
          callId,
          method: request.method,
          path: new URL(request.url).pathname,
          status: error.status,
          reason: error.message,
        });

        return createErrorResponse(error.status, "Access denied", callId);
      }

      logError("Unhandled error in protected API wrapper", {
        callId,
        method: request.method,
        path: new URL(request.url).pathname,
      });

      return createErrorResponse(500, "Internal server error", callId);
    }
  };
}
