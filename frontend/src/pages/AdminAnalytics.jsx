import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminAnalytics() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/dashboard/admin/analytics/"
      );

      setAnalytics(response.data);
    } catch (err) {
      console.error("Analytics error:", err);

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "Admin access is required to view analytics."
        );
        return;
      }

      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          "Unable to load analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * IMPORTANT:
   * All calculations are normal variables.
   * No hooks are used after useEffect.
   * This prevents React Hooks order errors.
   */

  const students = analytics?.students || {};
  const quizzes = analytics?.quizzes || {};
  const questions = analytics?.questions || {};
  const attempts = analytics?.attempts || {};
  const performance = analytics?.performance || {};

  const popularQuizzes =
    analytics?.popular_quizzes || [];

  const categories =
    analytics?.categories || [];

  const totalAttempts =
    Number(attempts.total_attempts) || 0;

  const passedAttempts =
    Number(attempts.passed_attempts) || 0;

  const failedAttempts =
    Number(attempts.failed_attempts) || 0;

  const passPercentage =
    totalAttempts > 0
      ? (passedAttempts / totalAttempts) * 100
      : 0;

  const failPercentage =
    totalAttempts > 0
      ? (failedAttempts / totalAttempts) * 100
      : 0;

  const totalQuestions =
    Number(questions.total_questions) || 0;

  const easyQuestions =
    Number(questions.easy_questions) || 0;

  const mediumQuestions =
    Number(questions.medium_questions) || 0;

  const hardQuestions =
    Number(questions.hard_questions) || 0;

  const maxQuizAttempts =
    popularQuizzes.length > 0
      ? Math.max(
          ...popularQuizzes.map(
            (quiz) =>
              Number(quiz.attempt_count) || 0
          ),
          1
        )
      : 1;


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">

        <div className="text-center">

          <div className="mx-auto relative flex h-20 w-20 items-center justify-center">

            <div className="absolute inset-0 animate-ping rounded-full bg-blue-200 opacity-40" />

            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl">

              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

            </div>

          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800">
            Loading Analytics
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Preparing your performance dashboard...
          </p>

        </div>

      </div>
    );
  }


  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">

        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
            ⚠️
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800">
            Analytics Unavailable
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-600">
            {error}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">

            <button
              onClick={fetchAnalytics}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Try Again
            </button>

            {error.includes("session") && (
              <button
                onClick={() => navigate("/login")}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Login Again
              </button>
            )}

          </div>

        </div>

      </div>
    );
  }


  /* =====================================================
     MAIN PAGE
  ===================================================== */

  return (
    <div className="analytics-page min-h-screen bg-slate-100">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">

        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6">

          <div className="flex items-center gap-3">

            <div className="analytics-icon flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl text-white shadow-lg shadow-blue-500/20">
              🧠
            </div>

            <div>

              <h1 className="text-lg font-bold text-slate-800">
                QuizMaster
              </h1>

              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Administration
              </p>

            </div>

          </div>


          <button
            onClick={() => navigate("/admin")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            ← Dashboard
          </button>

        </div>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="analytics-hero relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-7 text-white shadow-2xl sm:p-9">

          <div className="analytics-hero-orb absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />

          <div className="analytics-hero-orb absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-white/10" />

          <div className="absolute right-20 top-10 hidden text-7xl opacity-10 lg:block">
            📊
          </div>

          <div className="relative z-10">

            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur">
              Performance Overview
            </span>

            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              Analytics
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Monitor students, quizzes, questions,
              attempts, and overall performance from
              one centralized dashboard.
            </p>

          </div>

        </section>


        {/* =================================================
            MAIN STATISTICS
        ================================================= */}

        <section className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <AnalyticsCard
            title="Total Students"
            value={students.total_students ?? 0}
            icon="👨‍🎓"
            type="blue"
            delay="0.05s"
          />

          <AnalyticsCard
            title="Total Quizzes"
            value={quizzes.total_quizzes ?? 0}
            icon="📝"
            type="purple"
            delay="0.12s"
          />

          <AnalyticsCard
            title="Total Questions"
            value={questions.total_questions ?? 0}
            icon="❓"
            type="orange"
            delay="0.19s"
          />

          <AnalyticsCard
            title="Total Attempts"
            value={attempts.total_attempts ?? 0}
            icon="📊"
            type="green"
            delay="0.26s"
          />

        </section>


        {/* =================================================
            PERFORMANCE CARDS
        ================================================= */}

        <section className="mt-7 grid gap-5 md:grid-cols-3">

          <PerformanceCard
            title="Average Score"
            value={Number(
              performance.average_score || 0
            ).toFixed(2)}
            suffix="marks"
            icon="🎯"
          />

          <PerformanceCard
            title="Average Percentage"
            value={Number(
              performance.average_percentage || 0
            ).toFixed(2)}
            suffix="%"
            icon="📈"
          />

          <PerformanceCard
            title="Highest Percentage"
            value={Number(
              performance.highest_percentage || 0
            ).toFixed(2)}
            suffix="%"
            icon="🏆"
          />

        </section>


        {/* =================================================
            ATTEMPT PERFORMANCE + QUIZ STATUS
        ================================================= */}

        <section className="mt-7 grid gap-6 lg:grid-cols-2">

          {/* ATTEMPT PERFORMANCE */}

          <div className="analytics-panel rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <h3 className="text-lg font-bold text-slate-800">
                  Attempt Performance
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Passed versus failed attempts
                </p>

              </div>

              <div className="analytics-icon flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl">
                📊
              </div>

            </div>


            <div className="mt-7 flex flex-col items-center gap-7 sm:flex-row sm:justify-center">

              {/* DONUT */}

              <div
                className="analytics-donut relative h-44 w-44 shrink-0 rounded-full"
                style={{
                  background: `conic-gradient(
                    #22c55e 0% ${passPercentage}%,
                    #f87171 ${passPercentage}% ${
                      passPercentage + failPercentage
                    }%,
                    #e2e8f0 ${
                      passPercentage + failPercentage
                    }% 100%
                  )`,
                }}
              >

                <div className="absolute inset-[18px] flex flex-col items-center justify-center rounded-full bg-white">

                  <span className="text-3xl font-extrabold text-slate-800">
                    {passPercentage.toFixed(0)}%
                  </span>

                  <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Pass Rate
                  </span>

                </div>

              </div>


              {/* LEGEND */}

              <div className="w-full max-w-xs space-y-4">

                <LegendRow
                  label="Passed"
                  value={passedAttempts}
                  percentage={passPercentage}
                  type="green"
                />

                <LegendRow
                  label="Failed"
                  value={failedAttempts}
                  percentage={failPercentage}
                  type="red"
                />

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Total Attempts
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-slate-800">
                    {totalAttempts}
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* QUIZ STATUS */}

          <div className="analytics-panel rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <h3 className="text-lg font-bold text-slate-800">
                  Quiz Status
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Current quiz distribution
                </p>

              </div>

              <div className="analytics-icon flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                📝
              </div>

            </div>


            <div className="mt-7 space-y-6">

              <ProgressRow
                label="Published"
                value={
                  quizzes.published_quizzes || 0
                }
                total={
                  quizzes.total_quizzes || 0
                }
                type="blue"
              />

              <ProgressRow
                label="Draft"
                value={
                  quizzes.draft_quizzes || 0
                }
                total={
                  quizzes.total_quizzes || 0
                }
                type="orange"
              />

              <ProgressRow
                label="Unpublished"
                value={
                  quizzes.unpublished_quizzes || 0
                }
                total={
                  quizzes.total_quizzes || 0
                }
                type="gray"
              />

            </div>

          </div>

        </section>


        {/* =================================================
            QUESTION DIFFICULTY
        ================================================= */}

        <section className="analytics-panel mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

            <div>

              <h3 className="text-lg font-bold text-slate-800">
                Question Difficulty
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Distribution of questions across difficulty levels
              </p>

            </div>

            <div className="rounded-xl bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-600">
              {totalQuestions} Total Questions
            </div>

          </div>


          <div className="mt-7 grid gap-4 md:grid-cols-3">

            <DifficultyCard
              title="Easy"
              value={easyQuestions}
              total={totalQuestions}
              icon="🟢"
              type="easy"
            />

            <DifficultyCard
              title="Medium"
              value={mediumQuestions}
              total={totalQuestions}
              icon="🟡"
              type="medium"
            />

            <DifficultyCard
              title="Hard"
              value={hardQuestions}
              total={totalQuestions}
              icon="🔴"
              type="hard"
            />

          </div>

        </section>


        {/* =================================================
            POPULAR QUIZZES
        ================================================= */}

        <section className="analytics-panel mt-7 rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 p-6">

            <div className="flex items-center justify-between">

              <div>

                <h3 className="text-lg font-bold text-slate-800">
                  Popular Quizzes
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Quizzes with the highest number of attempts
                </p>

              </div>

              <div className="analytics-icon hidden h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl sm:flex">
                🏆
              </div>

            </div>

          </div>


          {popularQuizzes.length > 0 ? (

            <div className="space-y-5 p-6">

              {popularQuizzes.map(
                (quiz, index) => {

                  const count =
                    Number(
                      quiz.attempt_count
                    ) || 0;

                  const percentage =
                    (count /
                      maxQuizAttempts) *
                    100;

                  return (
                    <div
                      key={
                        quiz.quiz_id ||
                        index
                      }
                      className="analytics-ranking"
                      style={{
                        animationDelay: `${
                          index * 0.08
                        }s`,
                      }}
                    >

                      <div className="flex items-center gap-4">

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${
                            index === 0
                              ? "bg-yellow-100 text-yellow-700"
                              : index === 1
                              ? "bg-slate-100 text-slate-600"
                              : index === 2
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {index + 1}
                        </div>


                        <div className="min-w-0 flex-1">

                          <div className="flex items-center justify-between gap-4">

                            <p className="truncate font-semibold text-slate-800">
                              {quiz.quiz_title ||
                                "Untitled Quiz"}
                            </p>

                            <span className="shrink-0 text-sm font-extrabold text-slate-700">
                              {count}
                            </span>

                          </div>


                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">

                            <div
                              className="analytics-bar h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />

                          </div>

                        </div>

                      </div>

                      <div className="ml-14 mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {quiz.category ||
                          "General"}{" "}
                        • Attempts
                      </div>

                    </div>
                  );
                }
              )}

            </div>

          ) : (

            <EmptyState
              icon="📊"
              text="No quiz attempt data available yet."
            />

          )}

        </section>


        {/* =================================================
            CATEGORY STATISTICS
        ================================================= */}

        <section className="analytics-panel mt-7 rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                📚
              </div>

              <div>

                <h3 className="text-lg font-bold text-slate-800">
                  Category Statistics
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Quiz and attempt activity by category
                </p>

              </div>

            </div>

          </div>


          {categories.length > 0 ? (

            <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">

              {categories.map(
                (category, index) => (

                  <div
                    key={
                      category.category_id ||
                      index
                    }
                    className="analytics-category-card rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    style={{
                      animationDelay: `${
                        index * 0.08
                      }s`,
                    }}
                  >

                    <div className="flex items-center justify-between">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                        📚
                      </div>

                      <span className="text-xs font-bold text-slate-400">
                        #{category.category_id}
                      </span>

                    </div>

                    <h4 className="mt-4 font-bold text-slate-800">
                      {category.category_name ||
                        "Unknown Category"}
                    </h4>


                    <div className="mt-4 grid grid-cols-2 gap-3">

                      <div className="rounded-xl bg-white p-3">

                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Quizzes
                        </p>

                        <p className="mt-1 text-xl font-extrabold text-slate-800">
                          {category.quiz_count ||
                            0}
                        </p>

                      </div>

                      <div className="rounded-xl bg-white p-3">

                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Attempts
                        </p>

                        <p className="mt-1 text-xl font-extrabold text-blue-600">
                          {category.attempt_count ||
                            0}
                        </p>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            <EmptyState
              icon="📚"
              text="No category data available yet."
            />

          )}

        </section>


        {/* =================================================
            REFRESH
        ================================================= */}

        <div className="mt-8 flex items-center justify-center">

          <button
            onClick={fetchAnalytics}
            className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >

            <span className="transition-transform duration-500 group-hover:rotate-180">
              ↻
            </span>

            Refresh Analytics

          </button>

        </div>

      </main>

    </div>
  );
}


/* =========================================================
   ANALYTICS CARD
========================================================= */

function AnalyticsCard({
  title,
  value,
  icon,
  type,
  delay,
}) {

  const styles = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-violet-50 text-violet-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <div
      className="analytics-stat-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      style={{
        animationDelay: delay,
      }}
    >

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${
          styles[type]
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


/* =========================================================
   PERFORMANCE CARD
========================================================= */

function PerformanceCard({
  title,
  value,
  suffix,
  icon,
}) {

  return (
    <div className="analytics-stat-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
          {icon}
        </div>

      </div>

      <p className="mt-5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <div className="mt-1 flex items-baseline gap-2">

        <span className="text-3xl font-extrabold text-slate-800">
          {value}
        </span>

        <span className="text-sm font-semibold text-slate-400">
          {suffix}
        </span>

      </div>

    </div>
  );
}


/* =========================================================
   LEGEND ROW
========================================================= */

function LegendRow({
  label,
  value,
  percentage,
  type,
}) {

  const styles = {
    green: {
      dot: "bg-green-500",
      text: "text-green-600",
    },

    red: {
      dot: "bg-red-400",
      text: "text-red-500",
    },
  };

  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        <span
          className={`h-3 w-3 rounded-full ${styles[type].dot}`}
        />

        <span className="text-sm font-semibold text-slate-600">
          {label}
        </span>

      </div>

      <div className="flex items-center gap-3">

        <span className="text-sm font-bold text-slate-800">
          {value}
        </span>

        <span
          className={`text-xs font-bold ${styles[type].text}`}
        >
          {percentage.toFixed(1)}%
        </span>

      </div>

    </div>
  );
}


/* =========================================================
   PROGRESS ROW
========================================================= */

function ProgressRow({
  label,
  value,
  total,
  type,
}) {

  const percentage =
    total > 0
      ? (value / total) * 100
      : 0;

  const colors = {
    blue: "bg-blue-500",
    orange: "bg-orange-400",
    gray: "bg-slate-400",
  };

  return (
    <div>

      <div className="flex items-center justify-between">

        <span className="text-sm font-semibold text-slate-600">
          {label}
        </span>

        <div className="flex items-center gap-2">

          <span className="text-sm font-bold text-slate-800">
            {value}
          </span>

          <span className="text-xs text-slate-400">
            ({percentage.toFixed(0)}%)
          </span>

        </div>

      </div>

      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">

        <div
          className={`analytics-bar h-full rounded-full ${colors[type]}`}
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}


/* =========================================================
   DIFFICULTY CARD
========================================================= */

function DifficultyCard({
  title,
  value,
  total,
  icon,
  type,
}) {

  const percentage =
    total > 0
      ? (value / total) * 100
      : 0;

  const styles = {
    easy: {
      text: "text-green-700",
      bar: "bg-green-500",
    },

    medium: {
      text: "text-yellow-700",
      bar: "bg-yellow-400",
    },

    hard: {
      text: "text-red-700",
      bar: "bg-red-500",
    },
  };

  return (
    <div className="analytics-category-card rounded-2xl border border-slate-200 bg-slate-50 p-5">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <span className="text-xl">
            {icon}
          </span>

          <span className="font-bold text-slate-700">
            {title}
          </span>

        </div>

        <span className="text-2xl font-extrabold text-slate-800">
          {value}
        </span>

      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-white">

        <div
          className={`analytics-bar h-full rounded-full ${styles[type].bar}`}
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

      <div className="mt-2 flex justify-between">

        <span className="text-xs text-slate-400">
          Questions
        </span>

        <span
          className={`text-xs font-bold ${styles[type].text}`}
        >
          {percentage.toFixed(1)}%
        </span>

      </div>

    </div>
  );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon,
  text,
}) {

  return (
    <div className="p-12 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
        {icon}
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {text}
      </p>

    </div>
  );
}


export default AdminAnalytics;