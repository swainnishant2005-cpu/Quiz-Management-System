import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AttemptHistory() {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/attempts/history/"
      );

      setAttempts(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (error) {
      console.error(
        "History error:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem(
          "access_token"
        );
        localStorage.removeItem(
          "refresh_token"
        );

        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.detail ||
          error.response?.data?.error ||
          "Unable to load attempt history."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     ATTEMPT HELPERS
  ========================================= */

  const getAttemptId = (attempt) =>
    attempt.attempt_id || attempt.id;

  const getQuizTitle = (attempt) =>
    attempt.quiz_title ||
    attempt.quiz?.title ||
    "Quiz";

  const getPercentage = (attempt) =>
    Number(
      attempt.percentage ??
        attempt.score_percentage ??
        0
    );

  const getStatus = (attempt) => {
    const percentage =
      getPercentage(attempt);

    if (
      attempt.status === "PASSED" ||
      attempt.passed === true
    ) {
      return "PASSED";
    }

    if (attempt.status === "FAILED") {
      return "FAILED";
    }

    return percentage >= 50
      ? "PASSED"
      : "FAILED";
  };

  /* =========================================
     FILTERED ATTEMPTS
  ========================================= */

  const filteredAttempts = useMemo(() => {
    const searchValue =
      search.toLowerCase().trim();

    return attempts.filter((attempt) => {
      const title =
        getQuizTitle(attempt).toLowerCase();

      const status =
        getStatus(attempt);

      const matchesSearch =
        !searchValue ||
        title.includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    attempts,
    search,
    statusFilter,
  ]);

  /* =========================================
     STATISTICS
  ========================================= */

  const passedCount = attempts.filter(
    (attempt) =>
      getStatus(attempt) === "PASSED"
  ).length;

  const failedCount = attempts.filter(
    (attempt) =>
      getStatus(attempt) === "FAILED"
  ).length;

  const averageScore =
    attempts.length > 0
      ? attempts.reduce(
          (total, attempt) =>
            total +
            getPercentage(attempt),
          0
        ) / attempts.length
      : 0;

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">

        <div className="text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">

            <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-800">
            Loading attempt history
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Fetching your previous quiz attempts...
          </p>

        </div>

      </div>
    );
  }

  /* =========================================
     ERROR
  ========================================= */

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">

        <div className="history-error w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
            ⚠️
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800">
            Unable to load history
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-600">
            {error}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">

            <button
              onClick={fetchHistory}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Try Again
            </button>

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Dashboard
            </button>

          </div>

        </div>

      </div>
    );
  }

  /* =========================================
     MAIN
  ========================================= */

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =====================================
          NAVBAR
      ===================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">

        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl shadow-lg shadow-blue-500/20">
              🧠
            </div>

            <div>

              <h1 className="text-lg font-bold text-slate-800">
                QuizMaster
              </h1>

              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Student Portal
              </p>

            </div>

          </div>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            Dashboard
          </button>

        </div>

      </header>


      {/* =====================================
          MAIN
      ===================================== */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">

        {/* BACK */}

        <div className="mb-6">

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-x-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >

            <span className="text-lg transition-transform group-hover:-translate-x-1">
              ←
            </span>

            Back to Dashboard

          </button>

        </div>


        {/* =====================================
            PAGE HEADER
        ===================================== */}

        <section className="history-hero relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-7 text-white shadow-2xl sm:p-9">

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />

          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-white/10" />

          <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-center">

            <div className="max-w-2xl">

              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur">
                Student Activity
              </span>

              <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
                Attempt History
              </h2>

              <p className="mt-3 text-sm leading-6 text-blue-100 sm:text-base">
                Review your previous quiz attempts,
                scores, results, and answers.
              </p>

            </div>


            <div className="flex shrink-0 items-center gap-3">

              <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-center backdrop-blur">

                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-100">
                  Total Attempts
                </p>

                <p className="mt-1 text-3xl font-black">
                  {attempts.length}
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================
            STAT CARDS
        ===================================== */}

        <section className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <HistoryStat
            title="Total Attempts"
            value={attempts.length}
            icon="📝"
            accent="blue"
          />

          <HistoryStat
            title="Passed"
            value={passedCount}
            icon="✓"
            accent="green"
          />

          <HistoryStat
            title="Failed"
            value={failedCount}
            icon="✕"
            accent="red"
          />

          <HistoryStat
            title="Average Score"
            value={`${averageScore.toFixed(
              1
            )}%`}
            icon="🎯"
            accent="orange"
          />

        </section>


        {/* =====================================
            SEARCH & FILTER
        ===================================== */}

        {attempts.length > 0 && (

          <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              {/* Search */}

              <div className="relative flex-1">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                  ⌕
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search quiz attempts..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />

              </div>


              {/* Filters */}

              <div className="flex flex-wrap gap-2">

                <HistoryFilter
                  active={
                    statusFilter === "ALL"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "ALL"
                    )
                  }
                  label={`All (${attempts.length})`}
                />

                <HistoryFilter
                  active={
                    statusFilter ===
                    "PASSED"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "PASSED"
                    )
                  }
                  label={`Passed (${passedCount})`}
                />

                <HistoryFilter
                  active={
                    statusFilter ===
                    "FAILED"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "FAILED"
                    )
                  }
                  label={`Failed (${failedCount})`}
                />

              </div>

            </div>

          </section>

        )}


        {/* =====================================
            EMPTY STATE
        ===================================== */}

        {attempts.length === 0 ? (

          <section className="mt-7 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-4xl">
              📝
            </div>

            <h3 className="mt-6 text-xl font-bold text-slate-800">
              No attempts yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You haven't completed any quizzes yet.
              Browse the available quizzes and start
              your learning journey.
            </p>

            <button
              onClick={() =>
                navigate(
                  "/student/quizzes"
                )
              }
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Browse Quizzes →
            </button>

          </section>

        ) : (

          /* ===================================
             ATTEMPTS
          =================================== */

          <section className="mt-7">

            {filteredAttempts.length === 0 ? (

              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                  🔎
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-800">
                  No matching attempts
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try changing your search or filter.
                </p>

                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter(
                      "ALL"
                    );
                  }}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Clear Filters
                </button>

              </div>

            ) : (

              <div className="space-y-4">

                {filteredAttempts.map(
                  (attempt, index) => {

                    const id =
                      getAttemptId(
                        attempt
                      );

                    const title =
                      getQuizTitle(
                        attempt
                      );

                    const percentage =
                      getPercentage(
                        attempt
                      );

                    const status =
                      getStatus(
                        attempt
                      );

                    const isPassed =
                      status ===
                      "PASSED";

                    return (
                      <AttemptCard
                        key={
                          id || index
                        }
                        attempt={attempt}
                        title={title}
                        percentage={
                          percentage
                        }
                        isPassed={
                          isPassed
                        }
                        onResult={() =>
                          navigate(
                            `/attempts/${id}/result`
                          )
                        }
                        onReview={() =>
                          navigate(
                            `/attempts/${id}/review`
                          )
                        }
                      />
                    );
                  }
                )}

              </div>

            )}

          </section>

        )}


        {/* =====================================
            BOTTOM NAVIGATION
        ===================================== */}

        <section className="mt-10">

          <div className="flex flex-col justify-center gap-3 sm:flex-row">

            <button
              onClick={() =>
                navigate(
                  "/student/quizzes"
                )
              }
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Browse Quizzes
            </button>

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              ← Dashboard
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}


/* =========================================
   ATTEMPT CARD
========================================= */

function AttemptCard({
  attempt,
  title,
  percentage,
  isPassed,
  onResult,
  onReview,
}) {
  return (
    <article className="attempt-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="p-5 sm:p-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          {/* Quiz information */}

          <div className="flex min-w-0 items-start gap-4">

            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${
                isPassed
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {isPassed
                ? "🏆"
                : "📚"}
            </div>

            <div className="min-w-0">

              <h3 className="truncate text-lg font-bold text-slate-800">
                {title}
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                {attempt.completed_at
                  ? new Date(
                      attempt.completed_at
                    ).toLocaleString()
                  : "Completion date unavailable"}
              </p>

            </div>

          </div>


          {/* Score */}

          <div className="flex items-center gap-5">

            <div className="text-left lg:text-right">

              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Score
              </p>

              <p className="mt-1 text-xl font-extrabold text-slate-800">
                {attempt.score ??
                  0}
              </p>

            </div>

            <div className="h-10 w-px bg-slate-200" />

            <div className="text-left lg:text-right">

              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Percentage
              </p>

              <p
                className={`mt-1 text-xl font-extrabold ${
                  isPassed
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {percentage.toFixed(
                  2
                )}
                %
              </p>

            </div>

            <span
              className={`hidden rounded-full px-3 py-1.5 text-xs font-bold sm:inline-flex ${
                isPassed
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isPassed
                ? "PASSED"
                : "FAILED"}
            </span>

          </div>

        </div>


        {/* Progress */}

        <div className="mt-5">

          <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider">

            <span className="text-slate-400">
              Performance
            </span>

            <span
              className={
                isPassed
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {percentage.toFixed(
                1
              )}
              %
            </span>

          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">

            <div
              className={`attempt-progress h-full rounded-full ${
                isPassed
                  ? "bg-gradient-to-r from-emerald-400 to-green-500"
                  : "bg-gradient-to-r from-orange-400 to-red-500"
              }`}
              style={{
                width: `${Math.min(
                  Math.max(
                    percentage,
                    0
                  ),
                  100
                )}%`,
              }}
            />

          </div>

        </div>


        {/* Actions */}

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

          <button
            onClick={onReview}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            📝 Review Answers
          </button>

          <button
            onClick={onResult}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            View Result →
          </button>

        </div>

      </div>

    </article>
  );
}


/* =========================================
   HISTORY STAT
========================================= */

function HistoryStat({
  title,
  value,
  icon,
  accent,
}) {
  const styles = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="history-stat rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${
          styles[accent] ||
          styles.blue
        }`}
      >
        {icon}
      </div>

      <p className="mt-5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-2xl font-extrabold text-slate-800 sm:text-3xl">
        {value}
      </p>

    </div>
  );
}


/* =========================================
   FILTER
========================================= */

function HistoryFilter({
  active,
  onClick,
  label,
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
        active
          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}


export default AttemptHistory;