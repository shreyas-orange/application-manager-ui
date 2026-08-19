// src/features/db-syncup/pages/DbSyncupDetailsPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Pencil, Save, X } from "lucide-react";
import axios from "axios";

import { EmptyState, PageHeader, PageLoader, Spinner } from "@/components/ui";

import DbSyncupEnvironmentAnalytics from "../components/DbSyncupEnvironmentAnalytics";
import DbSyncupEnvironmentsPanel, {
  type EnvEdit,
  type NewEnvSelection,
} from "../components/DbSyncupEnvironmentsPanel";
import DbSyncupDetailsForm, { type DbSyncupDetailsFormValues } from "../components/DbSyncupDetailsForm";
import DbSyncupHistoryPanel from "../components/DbSyncupHistoryPanel";
import { useAllDbSyncups, useUpdateDbSyncup, useUpdateDbSyncupEnvironmentStatus } from "../hooks/useDbSyncup";
import type {
  DbSyncEnvironmentUpdate,
  DbSyncup,
  UpdateDbSyncupPayload,
} from "../types/db-syncup.types";

function buildDetailsForm(item: DbSyncup): DbSyncupDetailsFormValues {
  return {
    db_validation: item.db_validation || "",
    migration_incharge: item.requests?.[0]?.assigned_to_name || item.migration_incharge || "",
    assigned_to_user_id: item.requests?.[0]?.assigned_to_user_id ?? null,
    date_of_request: item.date_of_request?.slice(0, 10) || "",
    time_taken_in_prod: item.time_taken_in_prod || "",
    remarks: item.remarks || "",
    // application_priority lives on the request, not the syncup record itself.
    application_priority: item.requests?.[0]?.application_priority || "",
  };
}

function buildEnvEdits(item: DbSyncup): Record<number, EnvEdit> {
  const envMap: Record<number, EnvEdit> = {};
  (item.requests?.[0]?.environments ?? []).forEach((env) => {
    envMap[env.id] = {
      status: env.request_status || "",
      prodSecondLoadCutOver: env.prod_second_load_cut_over || "",
    };
  });
  return envMap;
}

export default function DbSyncupDetailsPage() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const dbSyncupId = Number(params.id);
  const applicationIdParam = Number(searchParams.get("applicationId"));
  const applicationId = Number.isFinite(applicationIdParam) && applicationIdParam > 0
    ? applicationIdParam
    : undefined;

  const { data, isLoading, isError, error, refetch } = useAllDbSyncups({ applicationId });
  const updateMutation = useUpdateDbSyncup();
  const requestEnvMutation = useUpdateDbSyncup();
  const environmentStatusMutation = useUpdateDbSyncupEnvironmentStatus();

  const item = useMemo(
    () => data?.items.find((i) => i.id === dbSyncupId) ?? null,
    [data?.items, dbSyncupId],
  );

  const [editing, setEditing] = useState(false);
  const [detailsForm, setDetailsForm] = useState<DbSyncupDetailsFormValues | null>(null);
  const [envEdits, setEnvEdits] = useState<Record<number, EnvEdit>>({});
  const [newEnvSelections, setNewEnvSelections] = useState<Record<string, NewEnvSelection>>({});
  const [saveError, setSaveError] = useState("");
  const [requestEnvError, setRequestEnvError] = useState("");
  const [updatingEnvId, setUpdatingEnvId] = useState<number | null>(null);

  useEffect(() => {
    if (item) {
      setDetailsForm(buildDetailsForm(item));
      setEnvEdits(buildEnvEdits(item));
      setNewEnvSelections({});
      setEditing(false);
      setSaveError("");
      setRequestEnvError("");
    }
  }, [item]);

  if (!Number.isFinite(dbSyncupId) || dbSyncupId <= 0) {
    return (
      <EmptyState
        icon="⚠️"
        title="Database migration record not found"
        action={
          <button type="button" className="btn btn-primary mt-3" onClick={() => navigate("/app/db-syncups")}>
            Back to Database Migrations
          </button>
        }
      />
    );
  }

  if (isLoading) {
    return <PageLoader label="Loading database migration..." />;
  }

  if (isError) {
    return (
      <EmptyState
        icon="⚠️"
        title="Unable to load database migration"
        text={error instanceof Error ? error.message : "Something went wrong."}
        action={
          <button type="button" className="btn btn-primary mt-3" onClick={() => { void refetch(); }}>
            Try again
          </button>
        }
      />
    );
  }

  if (!item || !detailsForm) {
    return (
      <EmptyState
        icon="⚠️"
        title="Database migration record not found"
        text="This record may have been deleted."
        action={
          <button type="button" className="btn btn-primary mt-3" onClick={() => navigate("/app/db-syncups")}>
            Back to Database Migrations
          </button>
        }
      />
    );
  }

  const request = item.requests?.[0] ?? null;
  const environments = request?.environments ?? [];

  const cancelEditing = () => {
    setDetailsForm(buildDetailsForm(item));
    setEnvEdits(buildEnvEdits(item));
    setNewEnvSelections({});
    setEditing(false);
    setSaveError("");
  };

  const handleEnvEditChange = (envId: number, field: "status" | "prodSecondLoadCutOver", value: string) => {
    setEnvEdits((prev) => ({
      ...prev,
      [envId]: {
        status: prev[envId]?.status ?? "",
        prodSecondLoadCutOver: prev[envId]?.prodSecondLoadCutOver ?? "",
        [field]: value,
      },
    }));
  };

  const handleToggleNewEnv = (envCode: string) => {
    setNewEnvSelections((prev) => ({
      ...prev,
      [envCode]: {
        priority: prev[envCode]?.priority ?? "",
        selected: !(prev[envCode]?.selected ?? false),
      },
    }));
  };

  const handleNewEnvPriorityChange = (envCode: string, priority: string) => {
    setNewEnvSelections((prev) => ({
      ...prev,
      [envCode]: {
        selected: prev[envCode]?.selected ?? false,
        priority,
      },
    }));
  };

  const handleDetailsChange = <K extends keyof DbSyncupDetailsFormValues>(
    field: K,
    value: DbSyncupDetailsFormValues[K],
  ) => {
    setDetailsForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async () => {
    setSaveError("");

    const payload: UpdateDbSyncupPayload = { version: item.version };

    const diffField = <K extends keyof DbSyncupDetailsFormValues & keyof UpdateDbSyncupPayload>(
      field: K,
      original: string,
    ) => {
      if (detailsForm[field] !== (original ?? "")) {
        payload[field] = detailsForm[field];
      }
    };

    diffField("db_validation", item.db_validation);
    diffField("migration_incharge", item.migration_incharge);
    diffField("time_taken_in_prod", item.time_taken_in_prod);
    diffField("remarks", item.remarks);

    const originalRequestDate = item.date_of_request?.slice(0, 10) ?? "";
    if (detailsForm.date_of_request !== originalRequestDate) {
      payload.date_of_request = detailsForm.date_of_request || null;
    }

    const environmentUpdates: DbSyncEnvironmentUpdate[] = environments
      .map((env): DbSyncEnvironmentUpdate | null => {
        const edit = envEdits[env.id];
        if (!edit) return null;

        const update: DbSyncEnvironmentUpdate = { id: env.id };
        let changed = false;

        if (edit.status !== (env.request_status ?? "")) {
          update.request_status = edit.status;
          changed = true;
        }
        if (edit.prodSecondLoadCutOver !== (env.prod_second_load_cut_over ?? "")) {
          update.prod_second_load_cut_over = edit.prodSecondLoadCutOver;
          changed = true;
        }

        return changed ? update : null;
      })
      .filter((update): update is DbSyncEnvironmentUpdate => update !== null);

    const assignmentChanged = Boolean(request) &&
      detailsForm.assigned_to_user_id !== (request?.assigned_to_user_id ?? null);

    if (request && (environmentUpdates.length > 0 || assignmentChanged)) {
      payload.request = {
        id: request.id,
        ...(environmentUpdates.length > 0 ? { environments: environmentUpdates } : {}),
        ...(assignmentChanged ? { assigned_to_user_id: detailsForm.assigned_to_user_id } : {}),
      };
    }

    if (Object.keys(payload).length === 1) {
      setEditing(false);
      return;
    }

    try {
      await updateMutation.mutateAsync({ syncupId: item.id, payload });
      setEditing(false);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        await refetch();
        setSaveError("This record was changed by another user. Reload it and try again.");
        return;
      }
      setSaveError(err instanceof Error ? err.message : "Unable to save changes.");
    }
  };

  // Independent of the page's Edit/Save flow — requesting a new environment
  // submits immediately rather than waiting on the rest of the form.
  const handleRequestEnvironments = async () => {
    setRequestEnvError("");

    if (!request) return;

    const environmentUpdates: DbSyncEnvironmentUpdate[] = Object.entries(newEnvSelections)
      .filter(([, selection]) => selection.selected)
      .map(([envCode, selection]) => ({
        environment: envCode,
        deployment_target: "BLEU",
        priority: selection.priority || undefined,
      }));

    if (environmentUpdates.length === 0) return;

    try {
      await requestEnvMutation.mutateAsync({
        syncupId: item.id,
        payload: {
          version: item.version,
          request: {
            id: request.id,
            environments: environmentUpdates,
          },
        },
      });
      setNewEnvSelections({});
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        await refetch();
        setRequestEnvError("This record was changed by another user. Reload it and try again.");
        throw err;
      }
      setRequestEnvError(err instanceof Error ? err.message : "Unable to request environments.");
      throw err;
    }
  };

  const handleEnvironmentStatusUpdate = async (
    environment: (typeof environments)[number],
    status: string,
  ) => {
    setSaveError("");
    setUpdatingEnvId(environment.id);
    try {
      await environmentStatusMutation.mutateAsync({
        syncupId: item.id,
        environmentId: environment.id,
        version: item.version,
        requestStatus: status,
      });
    } catch (updateError) {
      if (axios.isAxiosError(updateError) && updateError.response?.status === 409) {
        await refetch();
        setSaveError("This record was changed by another user. Reload it and try again.");
        return;
      }
      setSaveError(updateError instanceof Error ? updateError.message : "Unable to update environment status.");
    } finally {
      setUpdatingEnvId(null);
    }
  };

  const handleMissingEnvironmentStatusUpdate = async (
    cloud: string,
    environment: string,
    status: string,
  ) => {
    setSaveError("");
    try {
      await updateMutation.mutateAsync({
        syncupId: item.id,
        payload: {
          version: item.version,
          request: {
            ...(request ? { id: request.id } : {}),
            environments: [{ deployment_target: cloud.toUpperCase(), environment, request_status: status }],
          },
        },
      });
    } catch (updateError) {
      if (axios.isAxiosError(updateError) && updateError.response?.status === 409) {
        await refetch();
        setSaveError("This record was changed by another user. Reload it and try again.");
        return;
      }
      setSaveError(updateError instanceof Error ? updateError.message : "Unable to set environment status.");
    }
  };

  return (
    <div>
      <PageHeader
        leading={
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate("/app/db-syncups")}
            style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
          >
            <ArrowLeft size={15} />
            Back
          </button>
        }
        title={item.application_name}
        subtitle={`Serial #${item.serial_number ?? item.id}${item.carto_id ? ` · Carto: ${item.carto_id}` : ""}`}
        actions={
          !editing ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setEditing(true)}
              style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
            >
              <Pencil size={15} />
              Edit
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={updateMutation.isPending}
                onClick={cancelEditing}
                style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
              >
                <X size={15} />
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={updateMutation.isPending}
                onClick={() => { void handleSave(); }}
                style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
              >
                {updateMutation.isPending ? (
                  <>
                    <Spinner size={16} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Save changes
                  </>
                )}
              </button>
            </>
          )
        }
      />

      {saveError && (
        <div className="ods-form-message error" style={{ margin: "0 0 1rem" }}>
          {saveError}
        </div>
      )}

      {/* ── Environments (analytics first, then editable list) ────── */}
      <DbSyncupEnvironmentAnalytics environments={environments} />

      <DbSyncupEnvironmentsPanel
        environments={environments}
        showBleuEnvironments={
          environments.some((environment) => environment.deployment_target === "BLEU") ||
          (item.clouds ?? []).some((cloud) => ["bleu", "blue"].includes(cloud.name.trim().toLowerCase()))
        }
        readOnly={!editing}
        envEdits={envEdits}
        onEnvEditChange={handleEnvEditChange}
        newEnvSelections={newEnvSelections}
        onToggleNewEnv={handleToggleNewEnv}
        onNewEnvPriorityChange={handleNewEnvPriorityChange}
        canRequestEnvironment={Boolean(request) && (item.clouds ?? []).some((cloud) => ["bleu", "blue"].includes(cloud.name.trim().toLowerCase()))}
        onRequestEnvironments={handleRequestEnvironments}
        isRequestingEnvironments={requestEnvMutation.isPending}
        requestEnvironmentsError={requestEnvError}
        onEnvStatusUpdate={handleEnvironmentStatusUpdate}
        onMissingEnvStatusUpdate={handleMissingEnvironmentStatusUpdate}
        updatingEnvId={updatingEnvId}
      />

      {/* ── Everything else ──────────────────────────────────────── */}
      <div style={{ marginBottom: "1.5rem" }}>
        <DbSyncupDetailsForm
          values={detailsForm}
          onChange={handleDetailsChange}
          readOnly={!editing}
          environmentCount={environments.length}
        />
      </div>

      {/* ── History ──────────────────────────────────────────────── */}
      <DbSyncupHistoryPanel dbSyncupId={item.id} />
    </div>
  );
}
