import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/auth/me/");

      setUser(response.data);

    } catch (error) {
      console.error("Profile error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.detail ||
          error.response?.data?.error ||
          "Unable to load profile."
      );

    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (!user) return "S";

    const first =
      user.first_name?.charAt(0) || "";

    const last =
      user.last_name?.charAt(0) || "";

    if (first || last) {
      return `${first}${last}`.toUpperCase();
    }

    return (
      user.username?.charAt(0) || "S"
    ).toUpperCase();
  };

  const getFullName = () => {
    const fullName =
      `${user?.first_name || ""} ${
        user?.last_name || ""
      }`.trim();

    return fullName || user?.username || "Student";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">

          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading profile...
          </p>

        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">

        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
            ⚠️
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800">
            Unable to load profile
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={fetchProfile}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =========================
          NAVBAR
      ========================= */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-6">

          <div>
            <h1 className="text-xl font-bold text-slate-800">
              QuizMaster
            </h1>

            <p className="text-xs text-slate-500">
              Student Portal
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Dashboard
          </button>

        </div>

      </header>

      {/* =========================
          MAIN
      ========================= */}

      <main className="mx-auto max-w-5xl px-6 py-10">

        {/* Page Header */}

        <div className="mb-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Account
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-800">
            My Profile
          </h2>

          <p className="mt-2 text-slate-500">
            View your account information and student details.
          </p>

        </div>

        {/* =========================
            PROFILE HEADER CARD
        ========================= */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {/* Cover */}

          <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />

          <div className="px-6 pb-7 sm:px-8">

            <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">

                {/* Avatar */}

                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-blue-500 to-violet-600 text-3xl font-bold text-white shadow-lg">
                  {getInitials()}
                </div>

                <div className="pb-1">

                  <h3 className="text-2xl font-bold text-slate-800">
                    {getFullName()}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    @{user?.username}
                  </p>

                </div>

              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-xs font-bold text-green-700">

                <span className="h-2 w-2 rounded-full bg-green-500" />

                {user?.role === "STUDENT"
                  ? "STUDENT"
                  : user?.role}

              </span>

            </div>

          </div>

        </section>

        {/* =========================
            ACCOUNT INFORMATION
        ========================= */}

        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="border-b border-slate-100 pb-5">

            <h3 className="text-lg font-bold text-slate-800">
              Personal Information
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Information associated with your account.
            </p>

          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

            <ProfileField
              label="First Name"
              value={
                user?.first_name || "Not provided"
              }
              icon="👤"
            />

            <ProfileField
              label="Last Name"
              value={
                user?.last_name || "Not provided"
              }
              icon="👤"
            />

            <ProfileField
              label="Username"
              value={user?.username || "-"}
              icon="🔑"
            />

            <ProfileField
              label="Email Address"
              value={user?.email || "Not provided"}
              icon="✉️"
            />

            <ProfileField
              label="Account Role"
              value={user?.role || "-"}
              icon="🎓"
            />

            <ProfileField
              label="User ID"
              value={user?.id ?? "-"}
              icon="🆔"
            />

          </div>

        </section>

        {/* =========================
            QUICK ACTIONS
        ========================= */}

        <section className="mt-7">

          <h3 className="mb-4 text-lg font-bold text-slate-800">
            Quick Actions
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <ActionCard
              icon="📝"
              title="Browse Quizzes"
              description="Find and attempt available quizzes."
              onClick={() =>
                navigate("/student/quizzes")
              }
            />

            <ActionCard
              icon="📊"
              title="Attempt History"
              description="Review your previous quiz attempts."
              onClick={() =>
                navigate("/history")
              }
            />

            <ActionCard
              icon="🏆"
              title="Leaderboard"
              description="See your ranking among students."
              onClick={() =>
                navigate("/leaderboard")
              }
            />

          </div>

        </section>

        {/* =========================
            BOTTOM NAVIGATION
        ========================= */}

        <div className="mt-8 flex flex-wrap justify-center gap-3">

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            ← Dashboard
          </button>

          <button
            onClick={fetchProfile}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            ↻ Refresh Profile
          </button>

        </div>

      </main>

    </div>
  );
}


/* =========================
   PROFILE FIELD
========================= */

function ProfileField({
  label,
  value,
  icon,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-blue-50/30">

      <div className="flex items-start gap-4">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-slate-700">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}


/* =========================
   ACTION CARD
========================= */

function ActionCard({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
    >

      <div className="flex items-start gap-4">

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl transition group-hover:bg-blue-100">
          {icon}
        </div>

        <div>

          <h4 className="font-bold text-slate-800">
            {title}
          </h4>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            {description}
          </p>

        </div>

      </div>

    </button>
  );
}


export default Profile;