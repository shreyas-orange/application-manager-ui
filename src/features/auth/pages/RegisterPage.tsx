import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { useRegister } from "../hooks/useRegister";
import {
  registerSchema,
  type RegisterFormValues,
} from "../schemas/register.schema";
import { getAuthErrorMessage } from "../utils/auth-error";

export function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const [serverError, setServerError] = useState<string | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (
    formValues: RegisterFormValues,
  ): Promise<void> => {
    setServerError(null);

    try {
      await registerMutation.mutateAsync(formValues);

      navigate("/applications", {
        replace: true,
      });
    } catch (error) {
      setServerError(getAuthErrorMessage(error));
    }
  };

  const isLoading =
    isSubmitting || registerMutation.isPending;

  return (
    <section className="auth-card">
      <div className="auth-card__header">
        <h1>Create your account</h1>
        <p>Register to access Application Manager.</p>
      </div>

      {serverError && (
        <div role="alert" className="form-error">
          {serverError}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidateValidate
        className="auth-form"
      >
        <div className="form-field">
          <label htmlFor="name">Full name</label>

          <input
            id="name"
            type="text"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />

          {errors.name && (
            <p className="field-error">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="email">Email address</label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />

          {errors.email && (
            <p className="field-error">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />

          {errors.password && (
            <p className="field-error">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="confirm_password">
            Confirm password
          </label>

          <input
            id="confirm_password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(
              errors.confirm_password,
            )}
            {...register("confirm_password")}
          />

          {errors.confirm_password && (
            <p className="field-error">
              {errors.confirm_password.message}
            </p>
          )}
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading
            ? "Creating account..."
            : "Create account"}
        </button>
      </form>

      <p>
        Already have an account?{" "}
        <Link to="/login">Sign in</Link>
      </p>
    </section>
  );
}