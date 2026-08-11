import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type {
  CloudConfiguration,
  CreateCloudRequest,
} from "../types/clouds.types";
import { cloudFormSchema, type CloudFormValues } from "../schemas/cloud.schema";

interface CloudFormProps {
  cloud?: CloudConfiguration | null;
  isSubmitting: boolean;
  onSubmit: (payload: CreateCloudRequest) => void;
  onCancel: () => void;
}

const EMPTY_FORM: CloudFormValues = {
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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CloudFormValues>({
    resolver: zodResolver(cloudFormSchema),
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    reset(
      cloud
        ? {
            name: cloud.name,
            provider: cloud.provider,
            region: cloud.region ?? "",
            description: cloud.description ?? "",
            is_active: cloud.is_active,
          }
        : EMPTY_FORM,
    );
  }, [cloud, reset]);

  const submit = (values: CloudFormValues) => {
    onSubmit({
      ...values,
      region: values.region?.trim() || undefined,
      description: values.description?.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <div className="ods-form-group" style={{ marginBottom: "1rem" }}>
        <label htmlFor="cloud-name">Name</label>
        <input
          id="cloud-name"
          type="text"
          placeholder="Production AWS"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name && (
          <div className="invalid-feedback d-block">{errors.name.message}</div>
        )}
      </div>

      <div className="ods-form-group" style={{ marginBottom: "1rem" }}>
        <label htmlFor="cloud-provider">Provider</label>
        <select id="cloud-provider" {...register("provider")}>
          <option value="AWS">AWS</option>
          <option value="AZURE">Azure</option>
          <option value="GCP">Google Cloud</option>
        </select>
        {errors.provider && (
          <div className="invalid-feedback d-block">{errors.provider.message}</div>
        )}
      </div>

      <div className="ods-form-group" style={{ marginBottom: "1rem" }}>
        <label htmlFor="cloud-region">Region</label>
        <input
          id="cloud-region"
          type="text"
          placeholder="ap-south-1"
          {...register("region")}
        />
      </div>

      <div className="ods-form-group" style={{ marginBottom: "1rem" }}>
        <label htmlFor="cloud-description">Description</label>
        <textarea
          id="cloud-description"
          placeholder="Optional description"
          rows={4}
          {...register("description")}
        />
      </div>

      <div className="ods-status-toggle" style={{ marginBottom: "1.5rem" }}>
        <input id="cloud-active" type="checkbox" {...register("is_active")} />
        <label htmlFor="cloud-active">Active configuration</label>
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
