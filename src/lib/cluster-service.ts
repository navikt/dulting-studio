import { and, eq, inArray } from "drizzle-orm";
import type { getDb } from "@/db/client";
import {
  clusterMemberships,
  clusters,
  type NewCluster,
  type NewClusterMembership,
  widgets,
} from "@/db/schema";
import type { ProtectedApiContext } from "./auth";
import type { CreateClusterInput } from "./cluster-validation";
import { isUniqueViolation } from "./postgres-error";

type Database = ReturnType<typeof getDb>;

export class MinimumClusterWidgetCountError extends Error {
  readonly code = "cluster_minimum_widgets";

  constructor() {
    super("En klynge må ha minst to widgets.");
  }
}

export class ClusterWidgetsProjectMismatchError extends Error {
  readonly code = "cluster_widgets_project_mismatch";

  constructor() {
    super("Alle widgets i klyngen må tilhøre prosjektet.");
  }
}

export class DuplicateClusterMembershipError extends Error {
  readonly code = "duplicate_cluster_membership";

  constructor() {
    super("Samme widget kan ikke legges inn flere ganger i samme klynge.");
  }
}

export type ClusterStore = {
  findWidgetsByIds(
    projectId: string,
    widgetIds: string[],
  ): Promise<Array<{ id: string }>>;
  insertCluster(input: {
    cluster: NewCluster;
    memberships: Pick<NewClusterMembership, "widgetId">[];
  }): Promise<{ clusterId: string }>;
};

export type CreateClusterResult = {
  clusterId: string;
};

export async function createCluster(
  store: ClusterStore,
  payload: CreateClusterInput,
  context: ProtectedApiContext,
): Promise<CreateClusterResult> {
  const uniqueWidgetIds = [...new Set(payload.widgetIds)];

  if (uniqueWidgetIds.length !== payload.widgetIds.length) {
    throw new DuplicateClusterMembershipError();
  }

  if (uniqueWidgetIds.length < 2) {
    throw new MinimumClusterWidgetCountError();
  }

  const matchingWidgets = await store.findWidgetsByIds(
    payload.projectId,
    uniqueWidgetIds,
  );

  if (matchingWidgets.length !== uniqueWidgetIds.length) {
    throw new ClusterWidgetsProjectMismatchError();
  }

  const cluster: NewCluster = {
    projectId: payload.projectId,
    name: payload.name,
    summary: payload.summary,
    status: payload.status,
    createdBy: context.user.navIdent,
    updatedBy: context.user.navIdent,
  };

  const memberships: Pick<NewClusterMembership, "widgetId">[] =
    uniqueWidgetIds.map((widgetId) => ({
      widgetId,
    }));

  try {
    return await store.insertCluster({
      cluster,
      memberships,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new DuplicateClusterMembershipError();
    }

    throw error;
  }
}

export function createDrizzleClusterStore(db: Database): ClusterStore {
  return {
    async findWidgetsByIds(projectId, widgetIds) {
      if (widgetIds.length === 0) {
        return [];
      }

      return db
        .select({ id: widgets.id })
        .from(widgets)
        .where(
          and(eq(widgets.projectId, projectId), inArray(widgets.id, widgetIds)),
        );
    },

    async insertCluster(input) {
      return db.transaction(async (tx) => {
        const [insertedCluster] = await tx
          .insert(clusters)
          .values(input.cluster)
          .returning({ id: clusters.id });

        await tx.insert(clusterMemberships).values(
          input.memberships.map((membership) => ({
            ...membership,
            clusterId: insertedCluster.id,
          })),
        );

        return {
          clusterId: insertedCluster.id,
        };
      });
    },
  };
}
