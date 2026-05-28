import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import { projects } from "@/db/schema";
import type { ProtectedApiContext } from "@/lib/auth";
import { withProtectedApiRoute } from "@/lib/auth";
import { validateUuid } from "@/lib/classify-validation";
import {
  buildInterventionPackageExport,
  type PackageExportFormat,
  PackageNotFoundForExportError,
  ProbablePiiRiskExportError,
} from "@/lib/intervention-package-export";
import {
  type CurrentInterventionPackage,
  createDrizzleInterventionPackageQueryStore,
  getCurrentPackageWithCandidates,
} from "@/lib/intervention-package-queries";
import {
  createDrizzleInterventionPackageStore,
  recordPackageExport,
} from "@/lib/intervention-package-service";
import {
  type ExportPackageInput,
  type InterventionPackageValidationError,
  validateExportPackageBody,
} from "@/lib/intervention-package-validation";
import { logError, logInfo, logWarn } from "@/lib/logger";

export const dynamic = "force-dynamic";

type PackageExportResult = ReturnType<typeof buildInterventionPackageExport>;

type CurrentPackageExportRouteDependencies = {
  findActiveProject(projectId: string): Promise<{ id: string } | null>;
  getCurrentPackageWithCandidates(
    projectId: string,
  ): Promise<CurrentInterventionPackage>;
  buildInterventionPackageExport(
    packageDetail: CurrentInterventionPackage,
    format: PackageExportFormat,
    context: { exportedBy: string; exportedAt: Date; callId: string },
  ): PackageExportResult;
  recordPackageExport(
    packageId: string,
    packageExport: {
      format: ExportPackageInput["format"];
      contentHash: string;
      includedPiiRiskLevels: string[];
    },
    context: ProtectedApiContext,
  ): Promise<{ exportId: string }>;
  now(): Date;
};

const defaultDependencies: CurrentPackageExportRouteDependencies = {
  async findActiveProject(projectId) {
    const db = getDb();
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
      .limit(1);

    return project ?? null;
  },

  getCurrentPackageWithCandidates(projectId) {
    const db = getDb();
    const store = createDrizzleInterventionPackageQueryStore(db);
    return getCurrentPackageWithCandidates(store, projectId);
  },

  buildInterventionPackageExport,

  recordPackageExport(packageId, packageExport, context) {
    const db = getDb();
    const store = createDrizzleInterventionPackageStore(db);
    return recordPackageExport(store, packageId, packageExport, context);
  },

  now() {
    return new Date();
  },
};

function createErrorResponse(
  callId: string,
  message: string,
  status: number,
  errors?: InterventionPackageValidationError[],
) {
  return Response.json(
    {
      message,
      callId,
      ...(errors ? { errors } : {}),
    },
    { status },
  );
}

function getProjectIdFromRequest(request: Request) {
  return new URL(request.url).pathname.split("/")[3];
}

export async function handleExportCurrentPackage(
  request: Request,
  context: ProtectedApiContext,
  dependencies: CurrentPackageExportRouteDependencies = defaultDependencies,
) {
  const projectId = getProjectIdFromRequest(request);
  const path = `/api/projects/${projectId ?? "unknown"}/intervention-packages/current/export`;

  if (!validateUuid(projectId)) {
    return createErrorResponse(context.callId, "Ugyldig prosjekt-id", 400);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logWarn("Rejected invalid intervention package export JSON", {
      callId: context.callId,
      path,
      method: request.method,
    });
    return createErrorResponse(
      context.callId,
      "Ugyldig JSON i forespørsel",
      400,
    );
  }

  const validation = validateExportPackageBody(body);
  if (!validation.ok) {
    logWarn("Rejected invalid intervention package export payload", {
      callId: context.callId,
      path,
      method: request.method,
    });
    return createErrorResponse(
      context.callId,
      "Ugyldig forespørsel",
      400,
      validation.errors,
    );
  }

  try {
    const project = await dependencies.findActiveProject(projectId);

    if (!project) {
      return createErrorResponse(context.callId, "Prosjektet finnes ikke", 404);
    }

    const packageDetail =
      await dependencies.getCurrentPackageWithCandidates(projectId);
    const currentPackage = packageDetail.package;

    if (!currentPackage) {
      return createErrorResponse(
        context.callId,
        "Tiltakspakken finnes ikke",
        404,
      );
    }

    const exportResult = dependencies.buildInterventionPackageExport(
      packageDetail,
      validation.data.format,
      {
        exportedAt: dependencies.now(),
        exportedBy: context.user.navIdent,
        callId: context.callId,
      },
    );

    await dependencies.recordPackageExport(
      currentPackage.id,
      {
        format: validation.data.format,
        contentHash: exportResult.contentHash,
        includedPiiRiskLevels: exportResult.includedPiiRiskLevels,
      },
      context,
    );

    logInfo("Exported current intervention package", {
      callId: context.callId,
      path,
      method: request.method,
      projectId,
      packageId: currentPackage.id,
      format: validation.data.format,
      includedPiiRiskLevelCount: exportResult.includedPiiRiskLevels.length,
    });

    return new Response(exportResult.content, {
      status: 200,
      headers: {
        "Content-Type": exportResult.contentType,
        "Content-Disposition": `attachment; filename="${exportResult.fileName}"`,
      },
    });
  } catch (error) {
    if (error instanceof PackageNotFoundForExportError) {
      return createErrorResponse(context.callId, error.message, 404);
    }

    if (error instanceof ProbablePiiRiskExportError) {
      return createErrorResponse(context.callId, error.message, 422);
    }

    logError("Failed to export current intervention package", {
      callId: context.callId,
      path,
      method: request.method,
      projectId,
      error: error instanceof Error ? error.message : "unknown",
    });

    return createErrorResponse(context.callId, "Intern serverfeil", 500);
  }
}

export const POST = withProtectedApiRoute((request, context) =>
  handleExportCurrentPackage(request, context),
);
