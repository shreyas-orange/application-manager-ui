import {
  useEffect,
  useState,
} from "react";

import type {
  CloudConfiguration,
  CreateCloudRequest,
} from "../types/clouds.types";

interface CloudFormProps {
  cloud?: CloudConfiguration | null;
  isSubmitting: boolean;
  onSubmit: (
    payload: CreateCloudRequest,
  ) => void;
  onCancel: () => void;
}

const initialForm: CreateCloudRequest = {
  name: "",
  provider: "AWS",
  region: "",
  description: "",
  is_active: true,
};

export default function CloudForm({
  cloud,
  isSubmitting,
  onSubmit,
  onCancel,
}: CloudFormProps) {
  const [form, setForm] =
    useState<CreateCloudRequest>(
      initialForm,
    );

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (cloud) {
      setForm({
        name: cloud.name,
        provider: cloud.provider,
        region: cloud.region ?? "",
        description:
          cloud.description ?? "",
        is_active: cloud.is_active,
      });

      return;
    }

    setForm(initialForm);
  }, [cloud]);

  const handleSubmit = (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError(
        "Cloud configuration name is required.",
      );
      return;
    }

    if (!form.provider) {
      setError(
        "Cloud provider is required.",
      );
      return;
    }

    setError("");

    onSubmit({
      ...form,
      name: form.name.trim(),
      region:
        form.region?.trim() || undefined,
      description:
        form.description?.trim() ||
        undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ padding: "1.5rem", flex: 1, overflowY: "auto" }}
    >
      {error && (
        <div className="ods-form-message error">
          {error}
        </div>
      )}

      <div className="ods-form-group" style={{ marginBottom: "1rem" }}>
        <label htmlFor="cloud-name">Name</label>
        <input
          id="cloud-name"
          type="text"
          value={form.name}
          placeholder="Production AWS"
          onChange={(event) => {
            setForm((current: CreateCloudRequest) => ({
              ...current,
              name: event.target.value,
            }));
          }}
        />
      </div>

      <div className="ods-form-group" style={{ marginBottom: "1rem" }}>
        <label htmlFor="cloud-provider">Provider</label>
        <select
          id="cloud-provider"
          value={form.provider}
          onChange={(event) => {
            setForm((current: CreateCloudRequest) => ({
              ...current,
              provider: event.target.value,
            }));
          }}
        >
          <option value="AWS">AWS</option>
          <option value="AZURE">Azure</option>
          <option value="GCP">Google Cloud</option>
        </select>
      </div>

      <div className="ods-form-group" style={{ marginBottom: "1rem" }}>
        <label htmlFor="cloud-region">Region</label>
        <input
          id="cloud-region"
          type="text"
          value={form.region}
          placeholder="ap-south-1"
          onChange={(event) => {
            setForm((current: CreateCloudRequest) => ({
              ...current,
              region: event.target.value,
            }));
          }}
        />
      </div>

      <div className="ods-form-group" style={{ marginBottom: "1rem" }}>
        <label htmlFor="cloud-description">Description</label>
        <textarea
          id="cloud-description"
          value={form.description}
          placeholder="Optional description"
          rows={4}
          onChange={(event) => {
            setForm((current: CreateCloudRequest) => ({
              ...current,
              description: event.target.value,
            }));
          }}
        />
      </div>

      <div className="ods-status-toggle" style={{ marginBottom: "1.5rem" }}>
        <input
          id="cloud-active"
          type="checkbox"
          checked={form.is_active}
          onChange={(event) => {
            setForm((current: CreateCloudRequest) => ({
              ...current,
              is_active: event.target.checked,
            }));
          }}
        />
        <label htmlFor="cloud-active">
          Active configuration
        </label>
      </div>

      <div
        style={{
          display:        "flex",
          justifyContent: "flex-end",
          gap:            "0.75rem",
          paddingTop:     "1rem",
          borderTop:      "1px solid var(--ods-gray-200)",
        }}
      >
        <button
          type="button"
          className="btn btn-outline-secondary"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : cloud
              ? "Update Cloud"
              : "Create Cloud"}
        </button>
      </div>
    </form>
  );
}
