import { and, eq, inArray } from "drizzle-orm";
import type { getDb } from "@/db/client";
import { clusterMemberships, clusters, widgets } from "@/db/schema";

type Database = ReturnType<typeof getDb>;

const MAX_WIDGET_TEXT_LENGTH = 200;

export type ClusterListItem = {
  id: string;
  name: string;
  status: string;
  widgetCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ClusterDetailWidget = {
  id: string;
  muralWidgetId: string;
  widgetType: string;
  textContent: string;
};

export type ClusterWithWidgets = {
  id: string;
  name: string;
  summary: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  widgets: ClusterDetailWidget[];
};

type ClusterRow = Omit<ClusterWithWidgets, "widgets">;

type ClusterMembershipRow = {
  clusterId: string;
};

type ClusterWidgetRow = {
  id: string;
  muralWidgetId: string;
  widgetType: string;
  textContent: string;
};

export type ClusterQueryStore = {
  fetchClusterRows(projectId: string): Promise<ClusterRow[]>;
  fetchClusterMembershipRows(
    clusterIds: string[],
  ): Promise<ClusterMembershipRow[]>;
  fetchCluster(
    projectId: string,
    clusterId: string,
  ): Promise<ClusterRow | null>;
  fetchClusterWidgetRows(
    projectId: string,
    clusterId: string,
  ): Promise<ClusterWidgetRow[]>;
};

export async function listClusters(
  store: ClusterQueryStore,
  projectId: string,
): Promise<ClusterListItem[]> {
  const clusterRows = await store.fetchClusterRows(projectId);

  if (clusterRows.length === 0) {
    return [];
  }

  const membershipRows = await store.fetchClusterMembershipRows(
    clusterRows.map((cluster) => cluster.id),
  );
  const widgetCountByClusterId = new Map<string, number>();

  for (const membership of membershipRows) {
    widgetCountByClusterId.set(
      membership.clusterId,
      (widgetCountByClusterId.get(membership.clusterId) ?? 0) + 1,
    );
  }

  return clusterRows.map((cluster) => ({
    id: cluster.id,
    name: cluster.name,
    status: cluster.status,
    widgetCount: widgetCountByClusterId.get(cluster.id) ?? 0,
    createdAt: cluster.createdAt,
    updatedAt: cluster.updatedAt,
  }));
}

export async function getClusterWithWidgets(
  store: ClusterQueryStore,
  projectId: string,
  clusterId: string,
): Promise<ClusterWithWidgets | null> {
  const cluster = await store.fetchCluster(projectId, clusterId);

  if (!cluster) {
    return null;
  }

  const widgetRows = await store.fetchClusterWidgetRows(projectId, clusterId);

  return {
    ...cluster,
    widgets: widgetRows.map((widget) => ({
      id: widget.id,
      muralWidgetId: widget.muralWidgetId,
      widgetType: widget.widgetType,
      textContent: truncateWidgetText(widget.textContent),
    })),
  };
}

export function createDrizzleClusterQueryStore(
  db: Database,
): ClusterQueryStore {
  return {
    fetchClusterRows(projectId) {
      return db
        .select({
          id: clusters.id,
          name: clusters.name,
          summary: clusters.summary,
          status: clusters.status,
          createdAt: clusters.createdAt,
          updatedAt: clusters.updatedAt,
        })
        .from(clusters)
        .where(eq(clusters.projectId, projectId))
        .orderBy(clusters.updatedAt, clusters.createdAt, clusters.id);
    },

    fetchClusterMembershipRows(clusterIds) {
      if (clusterIds.length === 0) {
        return Promise.resolve([]);
      }

      return db
        .select({
          clusterId: clusterMemberships.clusterId,
        })
        .from(clusterMemberships)
        .where(inArray(clusterMemberships.clusterId, clusterIds));
    },

    async fetchCluster(projectId, clusterId) {
      const [cluster] = await db
        .select({
          id: clusters.id,
          name: clusters.name,
          summary: clusters.summary,
          status: clusters.status,
          createdAt: clusters.createdAt,
          updatedAt: clusters.updatedAt,
        })
        .from(clusters)
        .where(
          and(eq(clusters.projectId, projectId), eq(clusters.id, clusterId)),
        )
        .limit(1);

      return cluster ?? null;
    },

    fetchClusterWidgetRows(projectId, clusterId) {
      return db
        .select({
          id: widgets.id,
          muralWidgetId: widgets.muralWidgetId,
          widgetType: widgets.widgetType,
          textContent: widgets.textContent,
        })
        .from(clusterMemberships)
        .innerJoin(widgets, eq(clusterMemberships.widgetId, widgets.id))
        .innerJoin(clusters, eq(clusterMemberships.clusterId, clusters.id))
        .where(
          and(
            eq(clusterMemberships.clusterId, clusterId),
            eq(clusters.id, clusterId),
            eq(clusters.projectId, projectId),
            eq(widgets.projectId, projectId),
          ),
        )
        .orderBy(widgets.rowIndex, widgets.columnIndex, widgets.createdAt);
    },
  };
}

function truncateWidgetText(text: string) {
  const plainText = text.replace(/<[^>]*>/g, "").trim();

  if (plainText.length <= MAX_WIDGET_TEXT_LENGTH) {
    return plainText;
  }

  return `${plainText.slice(0, MAX_WIDGET_TEXT_LENGTH)}…`;
}
