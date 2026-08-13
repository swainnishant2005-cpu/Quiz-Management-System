import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get(
          "/dashboard/admin/analytics/"
        );

        setData(response.data);
      } catch (error) {
        console.error(error);

        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login");
          return;
        }

        if (error.response?.status === 403) {
          setError("You don't have admin access.");
          return;
        }

        setError(
          error.response?.data?.detail ||
          "Unable to load admin dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [navigate]);

  const logout = async () => {
    const refreshToken =
      localStorage.getItem("refresh_token");

    try {
      if (refreshToken) {
        await api.post("/auth/logout/", {
          refresh: refreshToken,
        });
      }
    } catch (error) {
      console.error(error);
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">

          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

          <p className="mt-4 text-slate-300">
            Loading admin dashboard...
          </p>

        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">

          <div className="text-5xl mb-4">
            🔒
          </div>

          <h2 className="text-2xl font-bold text-slate-800">
            Access Denied
          </h2>

          <p className="mt-2 text-slate-500">
            {error}
          </p>

          <button
            onClick={() => navigate("/login")}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Login
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 bg-slate-950 text-white lg:block">

        <div className="flex h-20 items-center border-b border-slate-800 px-6">

          <div>
            <h1 className="text-xl font-bold">
              QuizMaster
            </h1>

            <p className="text-xs text-slate-400">
              Administration
            </p>
          </div>

        </div>

        <nav className="p-4 space-y-2">

          <SidebarButton
            icon="📊"
            label="Dashboard"
            active
            onClick={() => navigate("/admin")}
          />

          <SidebarButton
            icon="📝"
            label="Quizzes"
            onClick={() => navigate("/admin/quizzes")}
          />

          <SidebarButton
            icon="❓"
            label="Questions"
            onClick={() => navigate("/admin/questions")}
          />

          <SidebarButton
            icon="👨‍🎓"
            label="Students"
            onClick={() => navigate("/admin/students")}
          />

          <SidebarButton
            icon="📋"
            label="Attempts"
            onClick={() => navigate("/admin/attempts")}
          />

          <SidebarButton
            icon="📈"
            label="Analytics"
            onClick={() => navigate("/admin/analytics")}
          />

          <SidebarButton
            icon="🏆"
            label="Leaderboard"
            onClick={() => navigate("/admin/leaderboard")}
          />

        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 p-4">

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <span>🚪</span>
            Logout
          </button>

        </div>

      </aside>

      {/* Main */}
      <div className="lg:pl-64">

        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">

          <div className="flex h-20 items-center justify-between px-6 lg:px-8">

            <div>
              <p className="text-sm text-slate-500">
                Administration
              </p>

              <h2 className="text-xl font-bold text-slate-800">
                Dashboard
              </h2>
            </div>

            <div className="flex items-center gap-3">

              <div className="hidden text-right sm:block">

                <p className="text-sm font-semibold text-slate-800">
                  Admin
                </p>

                <p className="text-xs text-slate-500">
                  Administrator
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-lg">
                👨‍💼
              </div>

            </div>

          </div>

        </header>

        <main className="p-6 lg:p-8">

          {/* Welcome */}
          <div className="mb-8">

            <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 p-8 text-white shadow-xl">

              <p className="text-sm font-medium text-blue-100">
                Welcome back, Admin 👋
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                Here's what's happening today.
              </h1>

              <p className="mt-2 max-w-2xl text-blue-100">
                Manage quizzes, monitor students and
                track overall platform performance.
              </p>

            </div>

          </div>

          {/* Main Statistics */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              icon="👨‍🎓"
              title="Total Students"
              value={data?.students?.total_students ?? 0}
              description={`${data?.students?.active_students ?? 0} active`}
              iconClass="bg-blue-100"
            />

            <StatCard
              icon="📝"
              title="Total Quizzes"
              value={data?.quizzes?.total_quizzes ?? 0}
              description={`${data?.quizzes?.published_quizzes ?? 0} published`}
              iconClass="bg-indigo-100"
            />

            <StatCard
              icon="❓"
              title="Total Questions"
              value={data?.questions?.total_questions ?? 0}
              description="Across all quizzes"
              iconClass="bg-violet-100"
            />

            <StatCard
              icon="📋"
              title="Total Attempts"
              value={data?.attempts?.total_attempts ?? 0}
              description={`${data?.attempts?.pass_rate ?? 0}% pass rate`}
              iconClass="bg-emerald-100"
            />

          </div>

          {/* Performance */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">

            <PerformanceCard
              title="Average Score"
              value={`${data?.performance?.average_score ?? 0}`}
              suffix="marks"
              icon="📊"
            />

            <PerformanceCard
              title="Average Percentage"
              value={`${data?.performance?.average_percentage ?? 0}`}
              suffix="%"
              icon="📈"
            />

            <PerformanceCard
              title="Highest Percentage"
              value={`${data?.performance?.highest_percentage ?? 0}`}
              suffix="%"
              icon="🏆"
            />

          </div>

          {/* Quiz Status + Question Difficulty */}
          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Quiz Status
                  </h3>

                  <p className="text-sm text-slate-500">
                    Current quiz distribution
                  </p>
                </div>

                <span className="text-2xl">
                  📝
                </span>

              </div>

              <div className="mt-6 space-y-4">

                <ProgressRow
                  label="Published"
                  value={
                    data?.quizzes?.published_quizzes ?? 0
                  }
                  total={
                    data?.quizzes?.total_quizzes ?? 0
                  }
                  className="bg-green-500"
                />

                <ProgressRow
                  label="Draft"
                  value={
                    data?.quizzes?.draft_quizzes ?? 0
                  }
                  total={
                    data?.quizzes?.total_quizzes ?? 0
                  }
                  className="bg-yellow-500"
                />

                <ProgressRow
                  label="Unpublished"
                  value={
                    data?.quizzes?.unpublished_quizzes ?? 0
                  }
                  total={
                    data?.quizzes?.total_quizzes ?? 0
                  }
                  className="bg-slate-400"
                />

              </div>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Question Difficulty
                  </h3>

                  <p className="text-sm text-slate-500">
                    Question distribution
                  </p>
                </div>

                <span className="text-2xl">
                  🎯
                </span>

              </div>

              <div className="mt-6 space-y-4">

                <ProgressRow
                  label="Easy"
                  value={
                    data?.questions?.easy_questions ?? 0
                  }
                  total={
                    data?.questions?.total_questions ?? 0
                  }
                  className="bg-green-500"
                />

                <ProgressRow
                  label="Medium"
                  value={
                    data?.questions?.medium_questions ?? 0
                  }
                  total={
                    data?.questions?.total_questions ?? 0
                  }
                  className="bg-yellow-500"
                />

                <ProgressRow
                  label="Hard"
                  value={
                    data?.questions?.hard_questions ?? 0
                  }
                  total={
                    data?.questions?.total_questions ?? 0
                  }
                  className="bg-red-500"
                />

              </div>

            </div>

          </div>

          {/* Popular Quizzes */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Popular Quizzes
                </h3>

                <p className="text-sm text-slate-500">
                  Most attempted quizzes
                </p>
              </div>

              <button
                onClick={() => navigate("/admin/quizzes")}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Manage Quizzes →
              </button>

            </div>

            <div className="mt-5 overflow-x-auto">

              <table className="w-full text-left">

                <thead>

                  <tr className="border-b border-slate-200">

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Quiz
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Category
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Attempts
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {data?.popular_quizzes?.map(
                    (quiz) => (

                      <tr
                        key={quiz.quiz_id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >

                        <td className="px-4 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                              📝
                            </div>

                            <span className="font-semibold text-slate-800">
                              {quiz.quiz_title}
                            </span>

                          </div>

                        </td>

                        <td className="px-4 py-4">

                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                            {quiz.category}
                          </span>

                        </td>

                        <td className="px-4 py-4 font-semibold text-slate-700">
                          {quiz.attempt_count}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* Categories */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Categories
              </h3>

              <p className="text-sm text-slate-500">
                Quiz activity by category
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {data?.categories?.map(
                (category) => (

                  <div
                    key={category.category_id}
                    className="rounded-xl border border-slate-200 p-5 transition hover:border-blue-300 hover:shadow-md"
                  >

                    <div className="flex items-center justify-between">

                      <h4 className="font-semibold text-slate-800">
                        {category.category_name}
                      </h4>

                      <span className="text-xl">
                        📚
                      </span>

                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">

                      <div className="rounded-lg bg-slate-50 p-3">

                        <p className="text-xs text-slate-400">
                          Quizzes
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-700">
                          {category.quiz_count}
                        </p>

                      </div>

                      <div className="rounded-lg bg-slate-50 p-3">

                        <p className="text-xs text-slate-400">
                          Attempts
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-700">
                          {category.attempt_count}
                        </p>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}


function SidebarButton({
  icon,
  label,
  active = false,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}


function StatCard({
  icon,
  title,
  value,
  description,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-800">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>

        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${iconClass}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}


function PerformanceCard({
  title,
  value,
  suffix,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <span className="text-xl">
          {icon}
        </span>

      </div>

      <div className="mt-3 flex items-baseline gap-2">

        <span className="text-3xl font-bold text-slate-800">
          {value}
        </span>

        <span className="text-sm text-slate-400">
          {suffix}
        </span>

      </div>

    </div>
  );
}


function ProgressRow({
  label,
  value,
  total,
  className,
}) {
  const percentage =
    total > 0
      ? Math.round((value / total) * 100)
      : 0;

  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <span className="text-sm font-medium text-slate-600">
          {label}
        </span>

        <span className="text-sm font-semibold text-slate-700">
          {value}
        </span>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">

        <div
          className={`h-full rounded-full transition-all duration-700 ${className}`}
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}


export default AdminDashboard;