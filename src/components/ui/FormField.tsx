import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}

export function FormField({ label, htmlFor, error, hint, children }: FormFieldProps) {
  return (
    <div className="mb-3">
      <label htmlFor={htmlFor} className="form-label">
        {label}
      </label>
      {children}
      {error && <div className="invalid-feedback d-block">{error}</div>}
      {!error && hint && <div className="form-text">{hint}</div>}
    </div>
  );
}
