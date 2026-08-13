import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      setError("Please enter your username.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // JWT login
      const response = await api.post(
        "/auth/login/",
        {
          username: formData.username,
          password: formData.password,
        }
      );

      const { access, refresh } = response.data;

      if (!access || !refresh) {
        throw new Error("Invalid login response.");
      }

      localStorage.setItem(
        "access_token",
        access
      );

      localStorage.setItem(
        "refresh_token",
        refresh
      );

      // Get current logged-in user
      const userResponse = await api.get(
        "/auth/me/"
      );

      const user = userResponse.data;

      // Redirect according to role
      if (user.role === "ADMIN") {
        navigate("/admin", {
          replace: true,
        });
      } else {
        navigate("/dashboard", {
          replace: true,
        });
      
    }

    } catch (error) {
    console.error("Login error:", error);

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    if (
      error.response?.status === 401
    ) {
      setError(
        "Invalid username or password."
      );
    } else if (
      error.response?.data?.detail
    ) {
      setError(
        error.response.data.detail
      );
    } else {
      setError(
        "Unable to login. Please try again."
      );
    }

  } finally {
    setLoading(false);
  }
};

return (
  <div className="relative min-h-screen overflow-hidden bg-slate-950">

    {/* =================================
          ANIMATED BACKGROUND
      ================================= */}

    <div className="absolute inset-0 overflow-hidden">

      {/* Gradient */}

      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950" />

      {/* Blob 1 */}

      <div className="login-blob login-blob-one" />

      {/* Blob 2 */}

      <div className="login-blob login-blob-two" />

      {/* Blob 3 */}

      <div className="login-blob login-blob-three" />

      {/* Grid */}

      <div className="login-grid absolute inset-0 opacity-20" />

      {/* Floating particles */}

      <span className="login-particle particle-1" />
      <span className="login-particle particle-2" />
      <span className="login-particle particle-3" />
      <span className="login-particle particle-4" />
      <span className="login-particle particle-5" />

    </div>


    {/* =================================
          MAIN CONTENT
      ================================= */}

    <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">

      <div className="login-container grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl lg:grid-cols-2">


        {/* =================================
              LEFT BRAND PANEL
          ================================= */}

        <div className="relative hidden overflow-hidden lg:flex">

          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700" />

          {/* Decorative circles */}

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />

          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10" />

          <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />


          <div className="relative z-10 flex w-full flex-col justify-between p-12 text-white">

            {/* Logo */}

            <div className="login-brand-enter">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl shadow-lg backdrop-blur-md">
                  🧠
                </div>

                <div>

                  <h1 className="text-2xl font-bold tracking-tight">
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

              <div className="brain-wrapper">

                <div className="brain-glow" />

                <div className="brain-circle">
                  🧠
                </div>

                <div className="brain-ring ring-one" />
                <div className="brain-ring ring-two" />

              </div>


              <h2 className="mt-10 max-w-md text-4xl font-bold leading-tight">
                Learn.
                <br />
                Challenge.
                <br />
                <span className="text-blue-200">
                  Achieve.
                </span>
              </h2>

              <p className="mt-5 max-w-md text-sm leading-6 text-blue-100">
                Test your knowledge, improve your
                skills, and compete with students
                through interactive quizzes.
              </p>

            </div>


            {/* Features */}

            <div className="grid grid-cols-3 gap-3">

              <Feature
                icon="📝"
                text="Quizzes"
              />

              <Feature
                icon="📊"
                text="Analytics"
              />

              <Feature
                icon="🏆"
                text="Leaderboard"
              />

            </div>

          </div>

        </div>


        {/* =================================
              LOGIN PANEL
          ================================= */}

        <div className="relative flex items-center bg-white px-7 py-10 sm:px-10 lg:px-12">

          <div className="w-full max-w-md mx-auto">

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

            <div className="login-form-enter">

              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Welcome back
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Sign in to your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Continue your learning journey with
                QuizMaster.
              </p>

            </div>


            {/* Error */}

            {error && (

              <div className="login-error mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                <span className="text-lg">
                  ⚠️
                </span>

                <p className="text-sm font-medium text-red-600">
                  {error}
                </p>

              </div>

            )}


            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* Username */}

              <div>

                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Username
                </label>

                <div className="login-input-wrapper">

                  <span className="login-input-icon">
                    👤
                  </span>

                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    autoComplete="username"
                    className="login-input"
                  />

                </div>

              </div>


              {/* Password */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/forgot-password")
                    }
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Forgot password?
                  </button>

                </div>


                <div className="login-input-wrapper">

                  <span className="login-input-icon">
                    🔒
                  </span>

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="login-input pr-12"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword
                      ? "🙈"
                      : "👁️"}
                  </button>

                </div>

              </div>


              {/* Remember */}

              <div className="flex items-center">

                <label className="flex cursor-pointer items-center gap-2">

                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span className="text-sm text-slate-500">
                    Remember me
                  </span>

                </label>

              </div>


              {/* Login */}

              <button
                type="submit"
                disabled={loading}
                className="login-button group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-70"
              >

                <span className="relative z-10 flex items-center justify-center gap-2">

                  {loading ? (
                    <>
                      <span className="login-spinner" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <span className="text-lg transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </>
                  )}

                </span>

              </button>

            </form>


            {/* Register */}

            <div className="mt-8 text-center">

              <p className="text-sm text-slate-500">

                Don't have an account?{" "}

                <button
                  onClick={() =>
                    navigate("/register")
                  }
                  className="font-bold text-blue-600 hover:text-blue-700"
                >
                  Create account
                </button>

              </p>

            </div>


            {/* Security */}

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">

              <span>
                🔐
              </span>

              Secure authentication powered by JWT

            </div>

          </div>

        </div>

      </div>

    </div>

  </div>
);
}


/* =================================
   FEATURE
================================= */

function Feature({ icon, text }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 p-3 text-center backdrop-blur-sm">

      <div className="text-lg">
        {icon}
      </div>

      <p className="mt-1 text-xs font-semibold text-blue-50">
        {text}
      </p>

    </div>
  );
}


export default Login;