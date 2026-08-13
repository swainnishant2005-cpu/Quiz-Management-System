import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function QuizResult() {
  const navigate = useNavigate();
  const { attemptId } = useParams();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResult();
  }, [attemptId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/attempts/${attemptId}/result/`
      );

      setResult(response.data);

    } catch (error) {
      console.error("Result error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          "Unable to load quiz result."
      );

    } finally {
      setLoading(false);
    }
  };

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
            Preparing your result
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Loading your quiz performance...
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

        <div className="result-error-card w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
            ⚠️
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800">
            Unable to load result
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-600">
            {error}
          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            ← Back to Dashboard
          </button>

        </div>

      </div>
    );
  }

  /* =========================================
     CALCULATIONS
  ========================================= */

  const correctAnswers =
    Number(result?.correct_answers ?? 0);

  const incorrectAnswers =
    Number(result?.incorrect_answers ?? 0);

  const unanswered =
    Number(result?.unanswered ?? 0);

  const totalQuestions =
    correctAnswers +
    incorrectAnswers +
    unanswered;

  const answered =
    correctAnswers +
    incorrectAnswers;

  const percentage =
    Number(result?.percentage ?? 0);

  const passed =
    result?.status === "PASSED";

  const timeTaken =
    Number(result?.time_taken ?? 0);

  const score =
    result?.score ?? 0;

  const percentageWidth = Math.min(
    Math.max(percentage, 0),
    100
  );

  const correctPercentage =
    totalQuestions > 0
      ? (correctAnswers /
          totalQuestions) *
        100
      : 0;

  const incorrectPercentage =
    totalQuestions > 0
      ? (incorrectAnswers /
          totalQuestions) *
        100
      : 0;

  const unansweredPercentage =
    totalQuestions > 0
      ? (unanswered /
          totalQuestions) *
        100
      : 0;

  /* =========================================
     MAIN UI
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
            onClick={() => navigate("/dashboard")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            Dashboard
          </button>

        </div>

      </header>


      {/* =====================================
          MAIN
      ===================================== */}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">

        {/* BACK */}

        <div className="mb-6">

          <button
            onClick={() => navigate("/quizzes")}
            className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-x-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >

            <span className="text-lg transition-transform group-hover:-translate-x-1">
              ←
            </span>

            Back to Quizzes

          </button>

        </div>


        {/* =====================================
            RESULT HERO
        ===================================== */}

        <section
          className={`result-hero relative overflow-hidden rounded-3xl p-7 text-white shadow-2xl sm:p-10 ${
            passed
              ? "bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700"
              : "bg-gradient-to-br from-orange-500 via-red-500 to-rose-600"
          }`}
        >

          {/* Decorative */}

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />

          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-white/10" />

          <div className="absolute right-20 top-10 h-20 w-20 rounded-full bg-white/5" />

          <div className="relative z-10">

            <div className="flex flex-col items-center text-center">

              {/* Icon */}

              <div className="result-trophy flex h-24 w-24 items-center justify-center rounded-3xl border border-white/20 bg-white/15 text-5xl shadow-2xl backdrop-blur-sm">

                {passed ? "🏆" : "📚"}

              </div>


              <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-white/75">
                Quiz Completed
              </p>


              <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">

                {passed
                  ? "Congratulations!"
                  : "Keep Practicing!"}

              </h2>


              <p className="mt-2 max-w-xl text-sm text-white/80 sm:text-base">
                {result?.quiz_title ||
                  "Quiz Result"}
              </p>


              {/* Score */}

              <div className="mt-8">

                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  Your Score
                </p>

                <p className="result-score mt-1 text-6xl font-black tracking-tight sm:text-7xl">
                  {percentage.toFixed(2)}%
                </p>

              </div>


              {/* Status */}

              <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-800 shadow-lg">

                <span>
                  {passed ? "✓" : "!"}
                </span>

                {result?.status ||
                  "COMPLETED"}

              </span>

            </div>

          </div>

        </section>


        {/* =====================================
            SCORE CARDS
        ===================================== */}

        <section className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <ResultCard
            title="Score"
            value={score}
            icon="🎯"
            accent="blue"
          />

          <ResultCard
            title="Correct"
            value={correctAnswers}
            icon="✓"
            accent="green"
          />

          <ResultCard
            title="Incorrect"
            value={incorrectAnswers}
            icon="✕"
            accent="red"
          />

          <ResultCard
            title="Unanswered"
            value={unanswered}
            icon="○"
            accent="orange"
          />

        </section>


        {/* =====================================
            PERFORMANCE
        ===================================== */}

        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Performance
              </p>

              <h3 className="mt-1 text-xl font-bold text-slate-800">
                Your overall performance
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Here's how you performed in this quiz.
              </p>

            </div>


            <span
              className={`inline-flex w-fit rounded-full px-4 py-2 text-xs font-bold ${
                passed
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {passed
                ? "PASSED"
                : "FAILED"}
            </span>

          </div>


          {/* Main percentage */}

          <div className="mt-7">

            <div className="mb-2 flex items-center justify-between">

              <span className="text-sm font-semibold text-slate-600">
                Overall Score
              </span>

              <span className="text-sm font-bold text-slate-800">
                {percentage.toFixed(2)}%
              </span>

            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">

              <div
                className={`result-progress h-full rounded-full ${
                  passed
                    ? "bg-gradient-to-r from-emerald-400 to-green-500"
                    : "bg-gradient-to-r from-orange-400 to-red-500"
                }`}
                style={{
                  width: `${percentageWidth}%`,
                }}
              />

            </div>

          </div>


          {/* Breakdown */}

          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">

            <PerformanceItem
              label="Correct"
              value={correctAnswers}
              percentage={correctPercentage}
              color="green"
            />

            <PerformanceItem
              label="Incorrect"
              value={incorrectAnswers}
              percentage={incorrectPercentage}
              color="red"
            />

            <PerformanceItem
              label="Unanswered"
              value={unanswered}
              percentage={unansweredPercentage}
              color="slate"
            />

          </div>


          {/* Message */}

          <div
            className={`mt-6 rounded-xl p-4 ${
              passed
                ? "border border-green-100 bg-green-50"
                : "border border-orange-100 bg-orange-50"
            }`}
          >

            {passed ? (

              <div className="flex items-start gap-3">

                <span className="text-xl">
                  🎉
                </span>

                <div>

                  <p className="text-sm font-bold text-green-700">
                    Excellent work!
                  </p>

                  <p className="mt-1 text-sm leading-5 text-green-600">
                    You passed this quiz. Keep practicing
                    to improve your score even further.
                  </p>

                </div>

              </div>

            ) : (

              <div className="flex items-start gap-3">

                <span className="text-xl">
                  💪
                </span>

                <div>

                  <p className="text-sm font-bold text-orange-700">
                    Keep going!
                  </p>

                  <p className="mt-1 text-sm leading-5 text-orange-600">
                    Review the questions you missed and
                    try again when you're ready.
                  </p>

                </div>

              </div>

            )}

          </div>

        </section>


        {/* =====================================
            ATTEMPT SUMMARY
        ===================================== */}

        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Attempt Details
              </p>

              <h3 className="mt-1 text-xl font-bold text-slate-800">
                Attempt Summary
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Overview of this quiz attempt.
              </p>

            </div>


            <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
              Attempt #{attemptId}
            </div>

          </div>


          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <InfoRow
              label="Total Questions"
              value={totalQuestions}
              icon="❓"
            />

            <InfoRow
              label="Answered"
              value={answered}
              icon="✓"
            />

            <InfoRow
              label="Unanswered"
              value={unanswered}
              icon="○"
            />

            <InfoRow
              label="Time Taken"
              value={formatTime(
                timeTaken
              )}
              icon="⏱"
            />

            <InfoRow
              label="Started At"
              value={
                result?.started_at
                  ? new Date(
                      result.started_at
                    ).toLocaleString()
                  : "-"
              }
              icon="▶"
            />

            <InfoRow
              label="Completed At"
              value={
                result?.completed_at
                  ? new Date(
                      result.completed_at
                    ).toLocaleString()
                  : "-"
              }
              icon="✓"
            />

          </div>

        </section>


        {/* =====================================
            ACTIONS
        ===================================== */}

        <section className="mt-8">

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

            {/* Review */}

            <button
              onClick={() =>
                navigate(
                  `/attempts/${attemptId}/review`
                )
              }
              className="group rounded-2xl border border-blue-200 bg-blue-50 px-6 py-4 text-left transition hover:-translate-y-1 hover:bg-blue-100 hover:shadow-lg"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-lg shadow-blue-600/20">
                  📝
                </div>

                <div>

                  <p className="font-bold text-blue-800">
                    Review Answers
                  </p>

                  <p className="mt-0.5 text-xs text-blue-600">
                    See your answers and corrections
                  </p>

                </div>

                <span className="ml-auto text-lg text-blue-500 transition-transform group-hover:translate-x-1">
                  →
                </span>

              </div>

            </button>


            {/* History */}

            <button
              onClick={() =>
                navigate("/history")
              }
              className="group rounded-2xl border border-slate-200 bg-white px-6 py-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
                  📊
                </div>

                <div>

                  <p className="font-bold text-slate-800">
                    Attempt History
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    View your previous attempts
                  </p>

                </div>

                <span className="ml-auto text-lg text-slate-400 transition-transform group-hover:translate-x-1">
                  →
                </span>

              </div>

            </button>


            {/* Dashboard */}

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="group rounded-2xl border border-slate-200 bg-white px-6 py-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
                  🏠
                </div>

                <div>

                  <p className="font-bold text-slate-800">
                    Dashboard
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Return to your student portal
                  </p>

                </div>

                <span className="ml-auto text-lg text-slate-400 transition-transform group-hover:translate-x-1">
                  →
                </span>

              </div>

            </button>

          </div>


          {/* Browse more */}

          <div className="mt-5 text-center">

            <button
              onClick={() =>
                navigate("/quizzes")
              }
              className="text-sm font-bold text-blue-600 transition hover:text-blue-700"
            >
              Browse More Quizzes →
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}


/* =========================================
   RESULT CARD
========================================= */

function ResultCard({
  title,
  value,
  icon,
  accent,
}) {
  const accentStyles = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="result-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${
          accentStyles[accent] ||
          accentStyles.blue
        }`}
      >
        {icon}
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-3xl font-extrabold text-slate-800">
        {value}
      </p>

    </div>
  );
}


/* =========================================
   PERFORMANCE ITEM
========================================= */

function PerformanceItem({
  label,
  value,
  percentage,
  color,
}) {
  const styles = {
    green: {
      bg: "bg-green-50",
      text: "text-green-700",
      bar: "bg-green-500",
    },

    red: {
      bg: "bg-red-50",
      text: "text-red-700",
      bar: "bg-red-500",
    },

    slate: {
      bg: "bg-slate-50",
      text: "text-slate-700",
      bar: "bg-slate-400",
    },
  };

  const current =
    styles[color] || styles.slate;

  return (
    <div
      className={`rounded-xl p-4 ${current.bg}`}
    >

      <div className="flex items-center justify-between">

        <span
          className={`text-sm font-semibold ${current.text}`}
        >
          {label}
        </span>

        <span
          className={`font-bold ${current.text}`}
        >
          {value}
        </span>

      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/70">

        <div
          className={`h-full rounded-full ${current.bar} transition-all duration-700`}
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

      <p
        className={`mt-2 text-xs font-medium ${current.text}`}
      >
        {percentage.toFixed(1)}%
      </p>

    </div>
  );
}


/* =========================================
   INFO ROW
========================================= */

function InfoRow({
  label,
  value,
  icon,
}) {
  return (
    <div className="group rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-100 hover:bg-blue-50/40">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm shadow-sm">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-bold text-slate-700">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}


/* =========================================
   TIME FORMAT
========================================= */

function formatTime(seconds) {
  const totalSeconds =
    Number(seconds) || 0;

  const minutes =
    Math.floor(
      totalSeconds / 60
    );

  const remainingSeconds =
    totalSeconds % 60;

  return `${minutes}m ${String(
    remainingSeconds
  ).padStart(2, "0")}s`;
}


export default QuizResult;