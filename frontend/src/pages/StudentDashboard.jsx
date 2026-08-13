import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard/student/");
        setData(response.data);
      } catch (error) {
        console.error(error);

        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login");
          return;
        }

        setError(
          error.response?.data?.detail ||
          "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
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
      console.error("Logout error:", error);
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
            ⚠️
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-800">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const attempted =
    data?.total_quizzes_attempted ?? 0;

  const passed =
    data?.total_quizzes_passed ?? 0;

  const failed =
    data?.total_quizzes_failed ?? 0;

  const average =
    data?.average_score ?? 0;

  const highest =
    data?.highest_score ?? 0;

  return (
    <div className="min-h-screen bg-slate-100">

      {/* NAVBAR */}
      
      <main className="mx-auto max-w-7xl px-6 py-8 lg:py-10">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 px-7 py-9 text-white shadow-xl lg:px-10 lg:py-11">

          <div className="relative z-10 max-w-2xl">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold backdrop-blur">
              <span>👋</span>
              Welcome back
            </div>

            <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
              Keep learning.
              <br />
              Keep improving.
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100 lg:text-base">
              Track your quiz performance, challenge yourself
              with new quizzes, and see how you rank against
              other students.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">

              <button
                onClick={() =>
                  navigate("/student/quizzes")
                }
                className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-lg transition hover:bg-blue-50"
              >
                Browse Quizzes →
              </button>

              <button
                onClick={() =>
                  navigate("/history")
                }
                className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                View History
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="rounded-lg bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50"
              >
                My Profile
              </button>

            </div>

          </div>

          {/* Decorative shapes */}

          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />

          <div className="absolute -bottom-24 right-28 h-72 w-72 rounded-full bg-white/5" />

          <div className="absolute right-10 top-1/2 hidden -translate-y-1/2 text-8xl opacity-80 lg:block">
            🧠
          </div>

        </section>

        {/* QUICK NAVIGATION */}

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <QuickAction
            icon="📝"
            title="Browse Quizzes"
            description="Find a quiz and start learning."
            onClick={() =>
              navigate("/student/quizzes")
            }
          />

          <QuickAction
            icon="📋"
            title="Attempt History"
            description="Review your previous attempts."
            onClick={() =>
              navigate("/history")
            }
          />

          <QuickAction
            icon="🏆"
            title="Leaderboard"
            description="See your ranking among students."
            onClick={() =>
              navigate("/leaderboard")
            }
          />

        </section>

        {/* PERFORMANCE */}

        <div className="mt-10">

          <div className="mb-5">

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Your Performance
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-800">
              Quiz Statistics
            </h2>

          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              icon="📝"
              title="Quizzes Attempted"
              value={attempted}
              description="Total attempts"
              iconClass="bg-blue-100"
            />

            <StatCard
              icon="✅"
              title="Quizzes Passed"
              value={passed}
              description="Successful attempts"
              iconClass="bg-green-100"
            />

            <StatCard
              icon="❌"
              title="Quizzes Failed"
              value={failed}
              description="Needs improvement"
              iconClass="bg-red-100"
            />

            <StatCard
              icon="📊"
              title="Average Score"
              value={`${average}%`}
              description="Overall performance"
              iconClass="bg-violet-100"
            />

          </div>

        </div>

        {/* SCORE OVERVIEW */}

        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Overall Performance
                </p>

                <h3 className="mt-1 text-xl font-bold text-slate-800">
                  Your Progress
                </h3>

              </div>

              <div className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-bold text-blue-600">
                {average}%
              </div>

            </div>

            <div className="mt-6">

              <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">

                <span>
                  Average percentage
                </span>

                <span>
                  {average}%
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600 transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      Number(average) || 0,
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

            <div className="mt-7 grid grid-cols-2 gap-4">

              <MiniStat
                label="Passed"
                value={passed}
                className="text-green-600"
              />

              <MiniStat
                label="Failed"
                value={failed}
                className="text-red-500"
              />

            </div>

          </div>

          {/* Highest */}

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 p-7 text-white shadow-lg">

            <div className="relative z-10">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl backdrop-blur">
                🏆
              </div>

              <p className="mt-6 text-sm font-medium text-green-100">
                Highest Percentage
              </p>

              <p className="mt-1 text-5xl font-bold">
                {highest}%
              </p>

              <p className="mt-3 text-sm leading-5 text-green-100">
                Your best quiz performance so far.
                Keep pushing for an even higher score!
              </p>

            </div>

            <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-white/10" />

          </div>

        </section>

        {/* RECENT ATTEMPTS */}

        <section className="mt-10">

          <div className="mb-5 flex items-end justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Activity
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-800">
                Recent Attempts
              </h2>

            </div>

            {data?.recent_attempts?.length > 0 && (
              <button
                onClick={() =>
                  navigate("/history")
                }
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View all →
              </button>
            )}

          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {data?.recent_attempts?.length > 0 ? (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[700px] text-left">

                  <thead className="border-b border-slate-200 bg-slate-50">

                    <tr>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Quiz
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Score
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Percentage
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Completed
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {data.recent_attempts.map(
                      (attempt) => {

                        const passed =
                          attempt.status ===
                          "PASSED";

                        return (
                          <tr
                            key={
                              attempt.attempt_id
                            }
                            className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
                          >

                            <td className="px-6 py-5">

                              <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
                                  📝
                                </div>

                                <div>

                                  <p className="font-semibold text-slate-800">
                                    {
                                      attempt.quiz_title
                                    }
                                  </p>

                                  <p className="text-xs text-slate-400">
                                    Quiz Attempt
                                  </p>

                                </div>

                              </div>

                            </td>

                            <td className="px-6 py-5 font-semibold text-slate-700">
                              {attempt.score}
                            </td>

                            <td className="px-6 py-5">

                              <span className="font-semibold text-slate-700">
                                {
                                  attempt.percentage
                                }%
                              </span>

                            </td>

                            <td className="px-6 py-5">

                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${passed
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                  }`}
                              >

                                <span>
                                  {passed
                                    ? "✓"
                                    : "×"}
                                </span>

                                {
                                  attempt.status
                                }

                              </span>

                            </td>

                            <td className="px-6 py-5 text-sm text-slate-500">

                              {attempt.completed_at
                                ? new Date(
                                  attempt.completed_at
                                ).toLocaleString()
                                : "-"}

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            ) : (

              <div className="px-6 py-16 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                  📚
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-800">
                  No quiz attempts yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  Start your first quiz and your performance
                  will appear here.
                </p>

                <button
                  onClick={() =>
                    navigate("/student/quizzes")
                  }
                  className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Browse Quizzes
                </button>

              </div>

            )}

          </div>

        </section>

      </main>

      {/* FOOTER */}

      <footer className="mt-12 border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-center text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:text-left">

          <p>
            © 2026 QuizMaster. Student Learning Portal.
          </p>

          <p>
            Learn • Practice • Improve
          </p>

        </div>

      </footer>

    </div>
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
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

      <div className="flex items-start justify-between">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${iconClass}`}
        >
          {icon}
        </div>

        <span className="text-slate-300 transition group-hover:text-blue-400">
          →
        </span>

      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-bold text-slate-800">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-400">
        {description}
      </p>

    </div>
  );
}


function QuickAction({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
    >

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl transition group-hover:bg-blue-100">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <h3 className="font-bold text-slate-800">
          {title}
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>

      </div>

      <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500">
        →
      </span>

    </button>
  );
}


function MiniStat({
  label,
  value,
  className,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p
        className={`mt-1 text-2xl font-bold ${className}`}
      >
        {value}
      </p>

    </div>
  );
}


export default Dashboard;