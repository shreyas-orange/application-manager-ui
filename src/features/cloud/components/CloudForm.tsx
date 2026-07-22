import {
  useEffect,
  useState,
} from "react";

import type {
  CloudConfiguration,
  CreateCloudRequest,
} from "../types/cloud";

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
      className="cloud-form"
      onSubmit={handleSubmit}
    >
      {error && (
        <div className="cloud-form-error">
          {error}
        </div>
      )}

      <div className="cloud-form-group">
        <label htmlFor="cloud-name">
          Name
        </label>

        <input
          id="cloud-name"
          type="text"
          value={form.name}
          placeholder="Production AWS"
          onChange={(event) => {
            setForm((current) => ({
              ...current,
              name: event.target.value,
            }));
          }}
        />
      </div>

      <div className="cloud-form-group">
        <label htmlFor="cloud-provider">
          Provider
        </label>

        <select
          id="cloud-provider"
          value={form.provider}
          onChange={(event) => {
            setForm((current) => ({
              ...current,
              provider:
                event.target.value,
            }));
          }}
        >
          <option value="AWS">
            AWS
          </option>

          <option value="AZURE">
            Azure
          </option>

          <option value="GCP">
            Google Cloud
          </option>
        </select>
      </div>

      <div className="cloud-form-group">
        <label htmlFor="cloud-region">
          Region
        </label>

        <input
          id="cloud-region"
          type="text"
          value={form.region}
          placeholder="ap-south-1"
          onChange={(event) => {
            setForm((current) => ({
              ...current,
              region:
                event.target.value,
            }));
          }}
        />
      </div>

      <div className="cloud-form-group">
        <label htmlFor="cloud-description">
          Description
        </label>

        <textarea
          id="cloud-description"
          value={form.description}
          placeholder="Optional description"
          rows={4}
          onChange={(event) => {
            setForm((current) => ({
              ...current,
              description:
                event.target.value,
            }));
          }}
        />
      </div>

      <label className="cloud-checkbox">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(event) => {
            setForm((current) => ({
              ...current,
              is_active:
                event.target.checked,
            }));
          }}
        />

        <span>
          Active configuration
        </span>
      </label>

      <div className="cloud-form-actions">
        <button
          type="button"
          className="secondary-button"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="primary-button"
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