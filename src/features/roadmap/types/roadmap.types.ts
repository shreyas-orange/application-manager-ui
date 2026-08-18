export interface LookupField {
  id: number;
  name: string;
  display_name: string;
  display_order: number;
}

export interface RoadmapLookupOption {
  id: number;
  name: string;
  display_name: string;
  display_order: number;
  is_active?: boolean;
}

export interface TeamMember {
  id: number;
  name: string;
  role?: string;
  is_primary?: boolean;
}

export interface AssignedResource {
  id: number;
  name: string;
  email?: string;
  is_primary?: boolean;
}

export type RoadmapStatus = "TO_DO" | "IN_PROGRESS" | "DONE" | "NOT_REQUIRED" | null;

export interface RoadmapItem {
  id: number;
  application_id: number;
  phase: string;
  phase_id: number;
  environment: string;
  environment_id: number;
  section_name: string;
  activity_number: string;
  activity: string;
  status: RoadmapStatus;
  planned_start_date: string | null;
  planned_end_date: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  remarks: string;
  display_order: number;
  responsible_teams: string;
  responsible_team_ids: number[];
  support_teams: string;
  support_team_ids: number[];
  assigned_resources: string;
  assigned_resource_ids: number[];
  source_sheet_name: string;
  source_row_number: number;
}

export interface RoadmapResponse {
  items: RoadmapItem[];
  total: number;
}

export interface RoadmapApiItem {
  id: number;
  application_id: number;
  phase: LookupField | null;
  environment: LookupField | null;
  section_name: string | null;
  activity_number: string | null;
  activity: string | null;
  status: RoadmapStatus;
  planned_start_date: string | null;
  planned_end_date: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  remarks: string | null;
  display_order: number | null;
  responsible_teams: TeamMember[];
  support_teams: TeamMember[];
  assigned_resources: AssignedResource[];
  source_sheet_name: string | null;
  source_row_number: number | null;
  import_batch_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface RoadmapApiResponse {
  application: unknown;
  total_roadmap_activities: number;
  roadmap_details: RoadmapApiItem[];
}

export interface UpdateRoadmapItemPayload {
  phase_id: number;
  environment_id: number;
  section_name: string;
  activity_number: number;
  activity: string;
  status: string | null;
  planned_start_date: string | null;
  planned_end_date: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  remarks: string;
  display_order: number;
  responsible_team_ids: number[];
  support_team_ids: number[];
  assigned_resource_ids: number[];
}
