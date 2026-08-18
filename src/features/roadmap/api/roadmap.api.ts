import { apiClient } from "@/lib/api-client";

import type {
  LookupField,
  RoadmapApiResponse,
  RoadmapApiItem,
  RoadmapItem,
  RoadmapResponse,
  RoadmapLookupOption,
  UpdateRoadmapItemPayload,
} from "../types/roadmap.types";

type RoadmapLookupKind = "phases" | "environments";

function lookupItems(
  data: RoadmapLookupOption[] | { items?: RoadmapLookupOption[]; data?: RoadmapLookupOption[] },
): RoadmapLookupOption[] {
  if (Array.isArray(data)) return data;
  return data.items ?? data.data ?? [];
}

export async function getRoadmapLookups(
  kind: RoadmapLookupKind,
  search = "",
): Promise<RoadmapLookupOption[]> {
  const response = await apiClient.get<
    RoadmapLookupOption[] | { items?: RoadmapLookupOption[]; data?: RoadmapLookupOption[] }
  >(`/roadmap/${kind}`, {
    params: { is_active: true, search: search || undefined },
  });
  return lookupItems(response.data);
}

export async function createRoadmapLookup(
  kind: RoadmapLookupKind,
  value: string,
): Promise<RoadmapLookupOption> {
  const name = value.trim();
  const response = await apiClient.post<RoadmapLookupOption>(
    `/roadmap/${kind}`,
    {
      name,
      display_name: name,
      display_order: 0,
      is_active: true,
    },
  );
  return response.data;
}

function lookupName(val: LookupField | null): string {
  if (!val) return "";
  return val.display_name || val.name || "";
}

function joinNames<T extends { name: string }>(items: T[]): string {
  return items.map((t) => t.name).join(", ");
}

function normalizeItem(item: RoadmapApiItem): RoadmapItem {
  return {
    id: item.id,
    application_id: item.application_id,
    phase: lookupName(item.phase),
    phase_id: item.phase?.id ?? 0,
    environment: lookupName(item.environment),
    environment_id: item.environment?.id ?? 0,
    section_name: item.section_name ?? "",
    activity_number: item.activity_number ?? "",
    activity: item.activity ?? "",
    status: item.status ?? null,
    planned_start_date: item.planned_start_date,
    planned_end_date: item.planned_end_date,
    actual_start_date: item.actual_start_date,
    actual_end_date: item.actual_end_date,
    remarks: item.remarks ?? "",
    display_order: item.display_order ?? 0,
    responsible_teams: joinNames(item.responsible_teams ?? []),
    responsible_team_ids: (item.responsible_teams ?? []).map((t) => t.id),
    support_teams: joinNames(item.support_teams ?? []),
    support_team_ids: (item.support_teams ?? []).map((t) => t.id),
    assigned_resources: joinNames(item.assigned_resources ?? []),
    assigned_resource_ids: (item.assigned_resources ?? []).map((r) => r.id),
    source_sheet_name: item.source_sheet_name ?? "",
    source_row_number: item.source_row_number ?? 0,
  };
}

export async function getRoadmapDetails(
  applicationId: number,
): Promise<RoadmapResponse> {
  const response =
    await apiClient.get<RoadmapApiResponse>(
      `/roadmap/applications/${applicationId}/roadmap-details`,
    );
  return {
    items: response.data.roadmap_details.map(normalizeItem),
    total: response.data.total_roadmap_activities,
  };
}

export async function updateRoadmapItem(
  applicationId: number,
  itemId: number,
  payload: UpdateRoadmapItemPayload,
): Promise<RoadmapItem> {
  const response = await apiClient.patch<
    RoadmapApiItem | { roadmap_details: RoadmapApiItem[] }
  >(
    `/roadmap/applications/${applicationId}/roadmap-details/${itemId}`,
    payload,
  );
  const data = response.data;
  const item = "roadmap_details" in data
    ? data.roadmap_details[0]
    : data;
  return normalizeItem(item);
}

export async function deleteRoadmapItem(
  applicationId: number,
  itemId: number,
): Promise<void> {
  await apiClient.delete(
    `/roadmap/applications/${applicationId}/roadmap-details/${itemId}`,
  );
}

export async function importRoadmap(
  applicationId: number,
  file: File,
  replaceExisting: boolean,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  await apiClient.post(
    `/roadmap/${applicationId}/roadmap/import`,
    formData,
    { params: { replace_existing: replaceExisting } },
  );
}

export async function createRoadmapItem(
  applicationId: number,
  payload: UpdateRoadmapItemPayload,
): Promise<RoadmapItem> {
  const response = await apiClient.post<RoadmapApiResponse>(
    `/roadmap/applications/${applicationId}/roadmap-create`,
    { roadmap_details: [payload] },
  );
  const details = response.data.roadmap_details;
  const item = details[details.length - 1];

  if (!item) {
    throw new Error("The roadmap item was created but was not returned by the API.");
  }

  return normalizeItem(item);
}
