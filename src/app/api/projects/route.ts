import { getDb } from "@/db/client";
import type { ProtectedApiContext } from "@/lib/auth";
import { withProtectedApiRoute } from "@/lib/auth";
import { logError, logInfo } from "@/lib/logger";
import {
  createDrizzleProjectListStore,
  listProjects,
  type ProjectListItem,
  type ProjectListQueryParams,
  parseProjectListQueryParams,
} from "@/lib/project-list-query";

export const dynamic = "force-dynamic";

type ProjectListRouteDependencies = {
  listProjects: (params: ProjectListQueryParams) => Promise<ProjectListItem[]>;
};

const defaultDependencies: ProjectListRouteDependencies = {
  listProjects(params) {
    const db = getDb();
    const store = createDrizzleProjectListStore(db);
    return listProjects(store, params);
  },
};

export async function handleGetProjects(
  request: Request,
  context: ProtectedApiContext,
  dependencies: ProjectListRouteDependencies = defaultDependencies,
) {
  const url = new URL(request.url);
  const parseResult = parseProjectListQueryParams(url.searchParams);

  if (!parseResult.ok) {
    return Response.json(
      {
        message: "Ugyldige søkeparametre",
        errors: parseResult.errors,
        callId: context.callId,
      },
      { status: 400 },
    );
  }

  try {
    const projects = await dependencies.listProjects(parseResult.params);

    logInfo("Served project list", {
      callId: context.callId,
      path: "/api/projects",
      method: request.method,
      sort: parseResult.params.sort,
      order: parseResult.params.order,
      resultCount: projects.length,
    });

    return Response.json({
      projects,
      sort: parseResult.params.sort,
      order: parseResult.params.order,
    });
  } catch (error) {
    logError("Failed to fetch project list", {
      callId: context.callId,
      path: "/api/projects",
      method: request.method,
      error: error instanceof Error ? error.message : "unknown",
    });

    return Response.json(
      { message: "Intern serverfeil", callId: context.callId },
      { status: 500 },
    );
  }
}

export const GET = withProtectedApiRoute((request, context) =>
  handleGetProjects(request, context),
);
