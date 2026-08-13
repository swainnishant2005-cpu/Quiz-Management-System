import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/forgot-password/",
        {
          email: email.trim(),
        }
      );

      /*
       * Your current Django development endpoint
       * returns uid and token.
       *
       * We keep them temporarily so the user can
       * continue to Reset Password.
       */
      if (
        response.data?.uid &&
        response.data?.token
      ) {
        sessionStorage.setItem(
          "reset_uid",
          response.data.uid
        );

        sessionStorage.setItem(
          "reset_token",
          response.data.token
        );
      }

      setSuccess(
        response.data?.message ||
          "Password reset information generated successfully."
      );

    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      setError(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          "Unable to process your request. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">

      {/* ================================
          ANIMATED BACKGROUND
      ================================= */}

      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950" />

        <div className="forgot-blob forgot-blob-one" />
        <div className="forgot-blob forgot-blob-two" />
        <div className="forgot-blob forgot-blob-three" />

        <div className="forgot-grid absolute inset-0 opacity-20" />

        <span className="forgot-particle forgot-particle-1" />
        <span className="forgot-particle forgot-particle-2" />
        <span className="forgot-particle forgot-particle-3" />
        <span className="forgot-particle forgot-particle-4" />
        <span className="forgot-particle forgot-particle-5" />

      </div>

      {/* ================================
          MAIN
      ================================= */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">

        <div className="forgot-container grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl lg:grid-cols-2">

          {/* ================================
              LEFT PANEL
          ================================= */}

          <div className="relative hidden overflow-hidden lg:flex">

            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700" />

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />

            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10" />

            <div className="relative z-10 flex w-full flex-col justify-between p-12 text-white">

              {/* Brand */}

              <div className="forgot-brand-enter">

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl shadow-lg backdrop-blur-md">
                    🧠
                  </div>

                  <div>

                    <h1 className="text-2xl font-bold">
                      QuizMaster
                    </h1>

                    <p className="text-sm text-blue-100">
                      Smart Quiz Management
                    </p>

                  </div>

                </div>

              </div>

              {/* Illustration */}

              <div className="flex flex-1 flex-col items-center justify-center text-center">

                <div className="forgot-icon-wrapper">

                  <div className="forgot-icon-glow" />

                  <div className="forgot-icon-circle">
                    🔐
                  </div>

                  <div className="forgot-ring forgot-ring-one" />
                  <div className="forgot-ring forgot-ring-two" />

                </div>

                <h2 className="mt-10 text-4xl font-bold leading-tight">
                  Don't worry.
                  <br />
                  <span className="text-blue-200">
                    We've got you.
                  </span>
                </h2>

                <p className="mt-5 max-w-md text-sm leading-6 text-blue-100">
                  Reset your password securely and
                  get back to your quizzes in just a
                  few simple steps.
                </p>

              </div>

              {/* Security */}

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    🛡️
                  </div>

                  <div>

                    <p className="text-sm font-bold">
                      Secure recovery
                    </p>

                    <p className="mt-0.5 text-xs text-blue-100">
                      Your account remains protected.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* ================================
              RIGHT PANEL
          ================================= */}

          <div className="flex items-center bg-white px-7 py-10 sm:px-10 lg:px-12">

            <div className="mx-auto w-full max-w-md">

              {/* Mobile Logo */}

              <div className="mb-8 flex items-center gap-3 lg:hidden">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-2xl shadow-lg">
                  🧠
                </div>

                <div>

                  <h1 className="text-xl font-bold text-slate-800">
                    QuizMaster
                  </h1>

                  <p className="text-xs text-slate-400">
                    Student Portal
                  </p>

                </div>

              </div>

              {/* Heading */}

              <div className="forgot-form-enter">

                <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                  Account recovery
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  Forgot your password?
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Enter the email address associated
                  with your account and we'll help you
                  reset your password.
                </p>

              </div>

              {/* Error */}

              {error && (

                <div className="forgot-message mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                  <span className="text-lg">
                    ⚠️
                  </span>

                  <p className="text-sm font-medium text-red-600">
                    {error}
                  </p>

                </div>

              )}

              {/* Success */}

              {success && (

                <div className="forgot-message mt-6 rounded-xl border border-green-200 bg-green-50 p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                      ✓
                    </div>

                    <div>

                      <p className="text-sm font-bold text-green-700">
                        Request successful
                      </p>

                      <p className="mt-1 text-sm leading-5 text-green-600">
                        {success}
                      </p>

                    </div>

                  </div>

                  {sessionStorage.getItem(
                    "reset_uid"
                  ) &&
                    sessionStorage.getItem(
                      "reset_token"
                    ) && (

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            "/reset-password"
                          )
                        }
                        className="mt-4 w-full rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700"
                      >
                        Continue to Reset Password →
                      </button>

                    )}

                </div>

              )}

              {/* Form */}

              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email Address
                  </label>

                  <div className="forgot-input-wrapper">

                    <span className="forgot-input-icon">
                      ✉️
                    </span>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                        setSuccess("");
                      }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="forgot-input"
                    />

                  </div>

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="forgot-button group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                >

                  <span className="relative z-10 flex items-center justify-center gap-2">

                    {loading ? (
                      <>
                        <span className="forgot-spinner" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Continue
                        <span className="text-lg transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </>
                    )}

                  </span>

                </button>

              </form>

              {/* Back to Login */}

              <div className="mt-8 text-center">

                <button
                  type="button"
                  onClick={() =>
                    navigate("/login")
                  }
                  className="text-sm font-bold text-slate-600 transition hover:text-blue-600"
                >
                  ← Back to Login
                </button>

              </div>

              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                🔐 Secure password recovery
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;