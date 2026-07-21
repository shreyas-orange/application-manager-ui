import {
  type ChangeEvent,
  type FormEvent,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import "../styles/LoginPage.css";

import {
  loginUser,
  getCurrentUser,
} from "../api/auth.api";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

 const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const loginResponse = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      console.log("Login response:", loginResponse);

      const accessToken =
        loginResponse.access_token ??
        loginResponse.token;

      const refreshToken =
        loginResponse.refresh_token;

      if (!accessToken) {
        throw new Error(
          "Access token was not returned by the server.",
        );
      }

      /*
      * Keep these keys exactly the same as the keys
      * used inside api-client.ts.
      */
      const accessTokenKey =
        "application_manager_access_token";

      const refreshTokenKey =
        "application_manager_refresh_token";

      if (rememberMe) {
        localStorage.setItem(
          accessTokenKey,
          accessToken,
        );

        sessionStorage.removeItem(
          accessTokenKey,
        );

        if (refreshToken) {
          localStorage.setItem(
            refreshTokenKey,
            refreshToken,
          );

          sessionStorage.removeItem(
            refreshTokenKey,
          );
        }
      } else {
        sessionStorage.setItem(
          accessTokenKey,
          accessToken,
        );

        localStorage.removeItem(
          accessTokenKey,
        );

        if (refreshToken) {
          sessionStorage.setItem(
            refreshTokenKey,
            refreshToken,
          );

          localStorage.removeItem(
            refreshTokenKey,
          );
        }
      }

      const currentUser =
        await getCurrentUser();

      localStorage.setItem(
        "auth_user",
        JSON.stringify(currentUser),
      );

      const roleValue =
        typeof currentUser?.role === "string"
          ? currentUser.role
          : currentUser?.role?.name ??
            currentUser?.role_name ??
            "";

      const role = String(roleValue)
        .trim()
        .toLowerCase();

      console.log("Current user:", currentUser);
      console.log("Resolved role:", role);

      navigate(
        role === "admin"
          ? "/dashboard"
          : "/applications",
        {
          replace: true,
        },
      );
    } catch (loginError) {
      console.error(
        "Login failed:",
        loginError,
      );

      setError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to sign in. Please check your credentials.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-decoration login-decoration-top" />
      <div className="login-decoration login-decoration-bottom" />

      <section className="login-shell">
        <div className="login-brand-panel">
          <Link
            to="/"
            className="login-logo"
            aria-label="Service Manager home"
          >
            <span className="login-logo-icon">
              <ShieldCheck size={26} />
            </span>

            <span className="login-logo-text">
              Service
              <strong>Manager</strong>
            </span>
          </Link>

          <div className="login-welcome">
            <p className="login-eyebrow">
              Application management platform
            </p>

            <h1>
              Welcome <span>back!</span>
            </h1>

            <p className="login-description">
              Sign in to manage applications, track
              migrations, and review operational progress.
            </p>

            <div className="login-feature-card">
              <div className="feature-icon">
                <ShieldCheck size={28} />
              </div>

              <div>
                <h2>Secure application access</h2>
                <p>
                  Your account and application data are
                  protected through secure authentication.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="login-form-wrapper">
          <div className="login-card">
            <div className="login-card-icon">
              <LockKeyhole size={32} />
            </div>

            <div className="login-card-heading">
              <p>Welcome back</p>
              <h2>Sign in to your account</h2>
              <span>
                Enter your credentials to continue.
              </span>
            </div>

            <form
              className="login-form"
              onSubmit={handleSubmit}
              noValidate
            >
              {error && (
                <div
                  className="login-error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">
                  Email address
                </label>

                <div className="input-wrapper">
                  <Mail
                    className="input-icon"
                    size={19}
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="password-label-row">
                  <label htmlFor="password">
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="forgot-password"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="input-wrapper">
                  <LockKeyhole
                    className="input-icon"
                    size={19}
                  />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous,
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <label className="remember-option">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(
                      event.target.checked,
                    )
                  }
                  disabled={isSubmitting}
                />

                <span>Remember me</span>
              </label>

              <button
                type="submit"
                className="login-submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Signing in..."
                  : "Sign in"}
              </button>
            </form>

            <p className="login-support">
              Having trouble signing in?{" "}
              <Link to="/forgot-password">
                Reset your password
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}