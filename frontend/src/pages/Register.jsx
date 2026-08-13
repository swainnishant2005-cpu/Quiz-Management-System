import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      first_name,
      last_name,
      username,
      email,
      password,
      confirm_password,
    } = formData;

    if (
      !first_name.trim() ||
      !last_name.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password ||
      !confirm_password
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (password !== confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/auth/register/", {
        first_name,
        last_name,
        username,
        email,
        password,
      });

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      console.error("Registration error:", error);

      const data = error.response?.data;

      if (data?.username) {
        setError(
          `Username: ${
            Array.isArray(data.username)
              ? data.username[0]
              : data.username
          }`
        );
      } else if (data?.email) {
        setError(
          `Email: ${
            Array.isArray(data.email)
              ? data.email[0]
              : data.email
          }`
        );
      } else if (data?.password) {
        setError(
          `Password: ${
            Array.isArray(data.password)
              ? data.password[0]
              : data.password
          }`
        );
      } else if (data?.detail) {
        setError(data.detail);
      } else {
        setError(
          "Unable to create your account. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">

      {/* Animated background */}

      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950" />

        <div className="register-blob register-blob-one" />
        <div className="register-blob register-blob-two" />
        <div className="register-blob register-blob-three" />

        <div className="register-grid absolute inset-0 opacity-20" />

        <span className="register-particle register-particle-1" />
        <span className="register-particle register-particle-2" />
        <span className="register-particle register-particle-3" />
        <span className="register-particle register-particle-4" />
        <span className="register-particle register-particle-5" />

      </div>

      {/* Main */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-8">

        <div className="register-container grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">

          {/* LEFT SIDE */}

          <div className="relative hidden overflow-hidden lg:flex">

            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700" />

            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />

            <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/10" />

            <div className="relative z-10 flex w-full flex-col justify-between p-12 text-white">

              {/* Brand */}

              <div className="register-brand-enter">

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

              {/* Content */}

              <div className="flex flex-1 flex-col justify-center">

                <div className="register-icon">

                  <div className="register-icon-glow" />

                  <div className="register-icon-box">
                    🚀
                  </div>

                </div>

                <h2 className="mt-10 max-w-md text-4xl font-bold leading-tight">
                  Start your
                  <br />
                  <span className="text-blue-200">
                    learning journey.
                  </span>
                </h2>

                <p className="mt-5 max-w-md text-sm leading-6 text-blue-100">
                  Create your account and challenge
                  yourself with interactive quizzes,
                  performance tracking and rankings.
                </p>

                <div className="mt-8 space-y-3">

                  <RegisterFeature
                    icon="✓"
                    text="Track your quiz performance"
                  />

                  <RegisterFeature
                    icon="✓"
                    text="Compete on the leaderboard"
                  />

                  <RegisterFeature
                    icon="✓"
                    text="Improve your knowledge"
                  />

                </div>

              </div>

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div className="bg-white px-7 py-9 sm:px-10 lg:px-12">

            <div className="mx-auto w-full max-w-xl">

              {/* Mobile logo */}

              <div className="mb-7 flex items-center gap-3 lg:hidden">

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

              <div className="register-form-enter">

                <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                  Get started
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  Create your account
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Join QuizMaster and start testing
                  your knowledge.
                </p>

              </div>

              {/* Error */}

              {error && (
                <div className="register-error mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                  <span>⚠️</span>

                  <p className="text-sm font-medium text-red-600">
                    {error}
                  </p>

                </div>
              )}

              {/* Success */}

              {success && (
                <div className="register-success mt-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">

                  <span>✓</span>

                  <p className="text-sm font-medium text-green-700">
                    {success}
                  </p>

                </div>
              )}

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="mt-7 space-y-4"
              >

                {/* Names */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <InputField
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="John"
                    icon="👤"
                  />

                  <InputField
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Doe"
                    icon="👤"
                  />

                </div>

                {/* Username */}

                <InputField
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  icon="🔑"
                />

                {/* Email */}

                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  icon="✉️"
                />

                {/* Password */}

                <PasswordField
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  show={showPassword}
                  setShow={setShowPassword}
                />

                {/* Confirm Password */}

                <PasswordField
                  label="Confirm Password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  show={showConfirmPassword}
                  setShow={setShowConfirmPassword}
                />

                {/* Password indicator */}

                {formData.password && (
                  <div className="pt-1">

                    <div className="mb-1 flex justify-between">

                      <span className="text-xs font-medium text-slate-500">
                        Password strength
                      </span>

                      <span
                        className={`text-xs font-bold ${
                          formData.password.length >= 8
                            ? "text-green-600"
                            : "text-orange-500"
                        }`}
                      >
                        {formData.password.length >= 8
                          ? "Good"
                          : "Too short"}
                      </span>

                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          formData.password.length >= 12
                            ? "w-full bg-green-500"
                            : formData.password.length >= 8
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
                  className="register-button group relative mt-3 w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                >

                  <span className="relative z-10 flex items-center justify-center gap-2">

                    {loading ? (
                      <>
                        <span className="register-spinner" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <span className="text-lg transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </>
                    )}

                  </span>

                </button>

              </form>

              {/* Login */}

              <div className="mt-6 text-center">

                <p className="text-sm text-slate-500">

                  Already have an account?{" "}

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/login")
                    }
                    className="font-bold text-blue-600 hover:text-blue-700"
                  >
                    Sign in
                  </button>

                </p>

              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                🔐 Your account is securely protected
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


/* =========================================
   INPUT
========================================= */

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
}) {
  return (
    <div>

      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <div className="register-input-wrapper">

        <span className="register-input-icon">
          {icon}
        </span>

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="register-input"
        />

      </div>

    </div>
  );
}


/* =========================================
   PASSWORD
========================================= */

function PasswordField({
  label,
  name,
  value,
  onChange,
  placeholder,
  show,
  setShow,
}) {
  return (
    <div>

      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <div className="register-input-wrapper">

        <span className="register-input-icon">
          🔒
        </span>

        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="register-input pr-12"
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          {show ? "🙈" : "👁️"}
        </button>

      </div>

    </div>
  );
}


/* =========================================
   FEATURE
========================================= */

function RegisterFeature({
  icon,
  text,
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-sm font-bold">
        {icon}
      </div>

      <span className="text-sm text-blue-50">
        {text}
      </span>

    </div>
  );
}


export default Register;