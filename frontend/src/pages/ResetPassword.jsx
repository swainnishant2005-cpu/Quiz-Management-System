import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const uid = sessionStorage.getItem("reset_uid");
    const token = sessionStorage.getItem("reset_token");

    if (!uid || !token) {
      setError(
        "Password reset session is missing or expired. Please request a new reset link."
      );
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password/", {
        uid,
        token,
        new_password: password,
      });

      sessionStorage.removeItem("reset_uid");
      sessionStorage.removeItem("reset_token");

      setSuccess(
        "Your password has been reset successfully."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1800);

    } catch (error) {
      console.error("Reset password error:", error);

      setError(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          "Unable to reset your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">

      {/* Background */}

      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950" />

        <div className="reset-blob reset-blob-one" />
        <div className="reset-blob reset-blob-two" />
        <div className="reset-blob reset-blob-three" />

        <div className="reset-grid absolute inset-0 opacity-20" />

      </div>

      {/* Main */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">

        <div className="reset-container grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl lg:grid-cols-2">

          {/* Left */}

          <div className="relative hidden overflow-hidden lg:flex">

            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700" />

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />

            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10" />

            <div className="relative z-10 flex w-full flex-col justify-between p-12 text-white">

              <div>

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl">
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

              <div className="flex flex-1 flex-col items-center justify-center text-center">

                <div className="reset-lock-icon">
                  🔑
                </div>

                <h2 className="mt-10 text-4xl font-bold">
                  Create a new
                  <br />
                  <span className="text-blue-200">
                    secure password.
                  </span>
                </h2>

                <p className="mt-5 max-w-md text-sm leading-6 text-blue-100">
                  Choose a strong password to protect
                  your QuizMaster account and continue
                  your learning journey.
                </p>

              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    🛡️
                  </div>

                  <div>

                    <p className="text-sm font-bold">
                      Account protection
                    </p>

                    <p className="text-xs text-blue-100">
                      Use at least 8 characters.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* Right */}

          <div className="flex items-center bg-white px-7 py-10 sm:px-10 lg:px-12">

            <div className="mx-auto w-full max-w-md">

              {/* Mobile Logo */}

              <div className="mb-8 flex items-center gap-3 lg:hidden">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-2xl">
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

              <div>

                <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                  Account recovery
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  Reset your password
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Enter a new password for your
                  QuizMaster account.
                </p>

              </div>

              {/* Error */}

              {error && (

                <div className="reset-message mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                  <span>⚠️</span>

                  <p className="text-sm font-medium text-red-600">
                    {error}
                  </p>

                </div>

              )}

              {/* Success */}

              {success && (

                <div className="reset-message mt-6 rounded-xl border border-green-200 bg-green-50 p-4">

                  <p className="text-sm font-bold text-green-700">
                    ✓ Password reset successful
                  </p>

                  <p className="mt-1 text-sm text-green-600">
                    Redirecting you to login...
                  </p>

                </div>

              )}

              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >

                {/* Password */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    New Password
                  </label>

                  <div className="reset-input-wrapper">

                    <span className="reset-input-icon">
                      🔒
                    </span>

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Enter new password"
                      className="reset-input pr-12"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>

                  </div>

                </div>

                {/* Confirm */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Confirm Password
                  </label>

                  <div className="reset-input-wrapper">

                    <span className="reset-input-icon">
                      🔒
                    </span>

                    <input
                      type={
                        showConfirm
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      placeholder="Confirm new password"
                      className="reset-input pr-12"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirm(!showConfirm)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirm ? "🙈" : "👁️"}
                    </button>

                  </div>

                </div>

                {/* Strength */}

                {password && (

                  <div>

                    <div className="mb-2 flex justify-between">

                      <span className="text-xs text-slate-500">
                        Password strength
                      </span>

                      <span
                        className={`text-xs font-bold ${
                          password.length >= 12
                            ? "text-green-600"
                            : password.length >= 8
                            ? "text-blue-600"
                            : "text-orange-500"
                        }`}
                      >
                        {password.length >= 12
                          ? "Strong"
                          : password.length >= 8
                          ? "Good"
                          : "Too short"}
                      </span>

                    </div>

                    <div className="h-1.5 rounded-full bg-slate-100">

                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          password.length >= 12
                            ? "w-full bg-green-500"
                            : password.length >= 8
                            ? "w-2/3 bg-blue-500"
                            : "w-1/3 bg-orange-400"
                        }`}
                      />

                    </div>

                  </div>

                )}

                {/* Submit */}

                <button
                  type="submit"
                  disabled={loading}
                  className="reset-button w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                >

                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="reset-spinner" />
                      Updating password...
                    </span>
                  ) : (
                    <span>
                      Reset Password →
                    </span>
                  )}

                </button>

              </form>

              <div className="mt-8 text-center">

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-sm font-bold text-slate-600 hover:text-blue-600"
                >
                  ← Back to Login
                </button>

              </div>

              <div className="mt-8 text-center text-xs text-slate-400">
                🔐 Your new password will be securely encrypted.
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ResetPassword;