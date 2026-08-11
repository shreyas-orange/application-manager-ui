// src/features/applications/pages/ApplicationDetailsPage.tsx
import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Pencil,
  Save,
  X,
} from "lucide-react";

import { EmptyState, PageHeader, PageLoader, Spinner, Tabs } from "@/components/ui";
import RoadmapAnalytics from "@/features/roadmap/components/RoadmapAnalytics";
import RoadmapSection  from "@/features/roadmap/components/RoadmapSection";
import DbSyncupSection from "@/features/db-syncup/components/DbSyncupSection";

import { useApplication } from "../hooks/useApplication";
import { useUpdateApplication } from "../hooks/useUpdateApplication";
import { populateApplicationForm } from "../utils/populate-application-form";
import {
  applicationEditSchema,
  type ApplicationEditFormInput,
  type ApplicationEditFormValues,
} from "../schemas/application-edit.schema";
import ApplicationEditFormFields from "../components/ApplicationEditFormFields";
import type {
  Application,
  UpdateApplicationPayload,
} from "../types/application.types";

type TabId = "analytics" | "roadmap" | "application" | "db-syncup";

const TABS: { id: TabId; label: string }[] = [
  { id: "analytics",   label: "Analytics (roadmap)" },
  { id: "roadmap",     label: "Roadmap" },
  { id: "application", label: "Application" },
  { id: "db-syncup",   label: "DB Syncup" },
];

function buildUpdatePayload(values: ApplicationEditFormValues): UpdateApplicationPayload {
  return {
    application: {
      application_name:    values.application_name    || null,
      carto_id:            values.carto_id            || null,
      basicat:             values.basicat             || null,
      priority:            values.priority            || null,
      confirmed_domain:    values.confirmed_domain    || null,
      application_status:  values.application_status  || null,
      domain:              values.domain              || null,
      portfolio:           values.portfolio           || null,
      business_importance: values.business_importance || null,
      sov_type:            values.sov_type            || null,
    },
    migration: {
      migration_status:   values.migration_status  || null,
      migration_progress: values.migration_progress,
      strategy:           values.strategy           || null,
      hosting_location:   values.hosting_location   || null,
      cloud_squad:        values.cloud_squad         || null,
      cluster:             values.cluster             || null,
      tentative_start:    values.tentative_start     || null,
      tentative_end:      values.tentative_end       || null,
      confirmed_end:      values.confirmed_end       || null,
      go_live:            values.go_live             || null,
    },
    meta_data: {
      wave:                      values.wave                      || null,
      gate:                      values.gate                      || null,
      assessment_status:         values.assessment_status         || null,
      data_anonymization_status: values.data_anonymization_status || null,
    },
    security: {
      nexus_status:           values.nexus_status           || null,
      rooted_status:          values.rooted_status          || null,
      network_policy_status:  values.network_policy_status  || null,
      security_prod_status:   values.security_prod_status   || null,
    },
    remark: {
      remark:          values.remark          || null,
      remarks_imp:     values.remarks_imp     || null,
      source_comments: values.source_comments || null,
    },
    owners: [
      { owner_type: "QA",                  owner_name: values.qa_owner_name      || null, owner_email: values.qa_owner_email      || null },
      { owner_type: "DevOps",              owner_name: values.devops_owner_name  || null, owner_email: values.devops_owner_email  || null },
      { owner_type: "PM",                  owner_name: values.pm_owner_name      || null, owner_email: values.pm_owner_email      || null },
      { owner_type: "Application Manager", owner_name: values.manager_owner_name || null, owner_email: values.manager_owner_email || null },
    ],
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ApplicationDetailsPage() {
  const navigate      = useNavigate();
  const location      = useLocation();
  const params        = useParams<{ id: string }>();

  const applicationId = Number(params.id);

  // If we arrived here by clicking a row in the list, that row's data is
  // already in hand — use it as a placeholder so there's no loading flash,
  // while the query still fetches (and replaces it with) the current data.
  const navigationStateApplication =
    (location.state as { application?: Application } | null)?.application ?? null;
  const placeholderData =
    navigationStateApplication?.id === applicationId
      ? navigationStateApplication
      : undefined;

  const applicationQuery = useApplication(applicationId, placeholderData);
  const application = applicationQuery.data ?? null;

  const updateMutation = useUpdateApplication();
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("analytics");

  const form = useForm<ApplicationEditFormInput, unknown, ApplicationEditFormValues>({
    resolver: zodResolver(applicationEditSchema),
    defaultValues: application ? populateApplicationForm(application) : undefined,
  });

  useEffect(() => {
    if (application) {
      form.reset(populateApplicationForm(application));
      setEditing(false);
    }
    // form.reset is stable across renders; only re-sync when the application data itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application]);

  if (!Number.isFinite(applicationId) || applicationId <= 0) {
    return (
      <EmptyState
        icon="⚠️"
        title="Application not found"
        text="No application data was found. Please go back to the list and try again."
        action={
          <button
            type="button"
            className="btn btn-primary mt-3"
            onClick={() => navigate("/app/applications")}
          >
            Back to Applications
          </button>
        }
      />
    );
  }

  if (applicationQuery.isLoading) {
    return <PageLoader label="Loading application..." />;
  }

  if (applicationQuery.isError) {
    return (
      <EmptyState
        icon="⚠️"
        title="Unable to load application"
        text={
          applicationQuery.error instanceof Error
            ? applicationQuery.error.message
            : "Something went wrong."
        }
        action={
          <button
            type="button"
            className="btn btn-primary mt-3"
            onClick={() => { void applicationQuery.refetch(); }}
          >
            Try again
          </button>
        }
      />
    );
  }

  if (!application) {
    return (
      <EmptyState
        icon="⚠️"
        title="Application not found"
        text="No application data was found. Please go back to the list and try again."
        action={
          <button
            type="button"
            className="btn btn-primary mt-3"
            onClick={() => navigate("/app/applications")}
          >
            Back to Applications
          </button>
        }
      />
    );
  }

  const cancelEditing = () => {
    form.reset(populateApplicationForm(application));
    setEditing(false);
  };

  const onSubmit = async (values: ApplicationEditFormValues) => {
    try {
      await updateMutation.mutateAsync({
        applicationId,
        payload: buildUpdatePayload(values),
      });
      setEditing(false);
    } catch {
      // Error displayed below via updateMutation.isError
    }
  };

  return (
    <div>
      <PageHeader
        leading={
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate("/app/applications")}
            style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
          >
            <ArrowLeft size={15} />
            Back
          </button>
        }
        title={application.application_name}
        subtitle={
          <>
            Application ID: {applicationId}
            {application.carto_id ? ` · Carto: ${application.carto_id}` : ""}
          </>
        }
        actions={
          activeTab === "application" &&
          !editing && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setEditing(true)}
              style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
            >
              <Pencil size={15} />
              Edit
            </button>
          )
        }
      />

      <Tabs items={TABS} active={activeTab} onChange={setActiveTab} />

      {/* ── Tab: Analytics (roadmap) ─────────────────────────────── */}
      {activeTab === "analytics" && (
        <RoadmapAnalytics appId={applicationId} />
      )}

      {/* ── Tab: Roadmap ─────────────────────────────────────────── */}
      {activeTab === "roadmap" && (
        <RoadmapSection appId={applicationId} />
      )}

      {/* ── Tab: DB Syncup ───────────────────────────────────────── */}
      {activeTab === "db-syncup" && (
        <DbSyncupSection application={application} applicationId={applicationId} />
      )}

      {/* ── Tab: Application ─────────────────────────────────────── */}
      {activeTab === "application" && (
        <FormProvider {...form}>
          {updateMutation.isError && (
            <div className="ods-form-message error">
              {updateMutation.error instanceof Error
                ? updateMutation.error.message
                : "Unable to update application."}
            </div>
          )}

          <form>
            <div className="ods-card">
              <div className="ods-card-body">
                <ApplicationEditFormFields readOnly />
              </div>
            </div>
          </form>

          {editing && (
            <>
              <div className="ods-drawer-overlay" onMouseDown={cancelEditing} />
              <aside
                className="ods-drawer open ods-drawer--wide"
                onMouseDown={(event) => event.stopPropagation()}
              >
                <div className="ods-drawer-header">
                  <div>
                    <div className="ods-drawer-title">Edit Application</div>
                    <div style={{ fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-400)", marginTop: "0.15rem" }}>
                      {application.application_name}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ods-drawer-close"
                    onClick={cancelEditing}
                    aria-label="Close edit application drawer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: "contents" }}>
                  <div className="ods-drawer-body">
                    <ApplicationEditFormFields readOnly={false} />
                  </div>
                  <div className="ods-drawer-footer">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      disabled={updateMutation.isPending}
                      onClick={cancelEditing}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={updateMutation.isPending}
                      style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                    >
                      {updateMutation.isPending ? (
                        <><Spinner size={16} />Saving...</>
                      ) : (
                        <><Save size={15} />Save changes</>
                      )}
                    </button>
                  </div>
                </form>
              </aside>
            </>
          )}
        </FormProvider>
      )}
    </div>
  );
}
