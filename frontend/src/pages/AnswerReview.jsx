import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function AnswerReview() {
  const navigate = useNavigate();
  const { attemptId } = useParams();

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("ALL");
  const [selectedQuestion, setSelectedQuestion] =
    useState(null);

  /* =========================================
     FETCH REVIEW
  ========================================= */

  useEffect(() => {
    fetchReview();
  }, [attemptId]);

  const fetchReview = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/attempts/${attemptId}/review/`
      );

      setReview(response.data);
    } catch (error) {
      console.error("Review error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          "Unable to load answer review."
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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">

        <div className="text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">

            <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-800">
            Loading answer review
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Preparing your answers and explanations...
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

        <div className="answer-review-error w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
            ⚠️
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800">
            Unable to load review
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-600">
            {error}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">

            <button
              onClick={() =>
                navigate(
                  `/attempts/${attemptId}/result`
                )
              }
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              ← Back to Result
            </button>

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Dashboard
            </button>

          </div>

        </div>

      </div>
    );
  }

  /* =========================================
     ANSWERS
  ========================================= */

  const answers = review?.review || [];

  const correctCount = answers.filter(
    (answer) => answer.is_correct
  ).length;

  const incorrectCount = answers.filter(
    (answer) => !answer.is_correct
  ).length;

  const answeredCount = answers.filter(
    (answer) =>
      answer.selected_option &&
      answer.selected_option !== "Not answered"
  ).length;

  const unansweredCount =
    answers.length - answeredCount;

  const totalMarks = answers.reduce(
    (total, answer) =>
      total + Number(answer.marks_earned || 0),
    0
  );

  /* =========================================
     FILTER
  ========================================= */

  const filteredAnswers = useMemo(() => {
    if (filter === "CORRECT") {
      return answers.filter(
        (answer) => answer.is_correct
      );
    }

    if (filter === "INCORRECT") {
      return answers.filter(
        (answer) => !answer.is_correct
      );
    }

    if (filter === "UNANSWERED") {
      return answers.filter(
        (answer) =>
          !answer.selected_option ||
          answer.selected_option ===
            "Not answered"
      );
    }

    return answers;
  }, [answers, filter]);

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

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">

        {/* BACK */}

        <div className="mb-6">

          <button
            onClick={() =>
              navigate(
                `/attempts/${attemptId}/result`
              )
            }
            className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-x-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >

            <span className="text-lg transition-transform group-hover:-translate-x-1">
              ←
            </span>

            Back to Result

          </button>

        </div>


        {/* =====================================
            PAGE HERO
        ===================================== */}

        <section className="answer-review-hero relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-7 text-white shadow-2xl sm:p-10">

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />

          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-white/10" />

          <div className="relative z-10">

            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">

              <div className="max-w-2xl">

                <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur">
                  Answer Review
                </span>

                <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
                  {review?.quiz_title ||
                    "Quiz Review"}
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                  Review your answers, understand your mistakes,
                  and learn from every question.
                </p>

              </div>


              {/* Score */}

              <div className="shrink-0 rounded-2xl border border-white/10 bg-white/10 p-5 text-center backdrop-blur-sm">

                <p className="text-xs font-bold uppercase tracking-wider text-blue-100">
                  Your Score
                </p>

                <p className="mt-1 text-4xl font-black">
                  {review?.score ?? 0}
                </p>

                <p className="mt-1 text-sm font-bold text-blue-100">
                  {Number(
                    review?.percentage ?? 0
                  ).toFixed(2)}
                  %
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================
            SUMMARY CARDS
        ===================================== */}

        <section className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <SummaryCard
            title="Total"
            value={answers.length}
            icon="📝"
            accent="blue"
          />

          <SummaryCard
            title="Correct"
            value={correctCount}
            icon="✓"
            accent="green"
          />

          <SummaryCard
            title="Incorrect"
            value={incorrectCount}
            icon="✕"
            accent="red"
          />

          <SummaryCard
            title="Unanswered"
            value={unansweredCount}
            icon="○"
            accent="orange"
          />

        </section>


        {/* =====================================
            PERFORMANCE BAR
        ===================================== */}

        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Performance Overview
              </p>

              <h3 className="mt-1 text-xl font-bold text-slate-800">
                How you performed
              </h3>

            </div>

            <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
              {totalMarks} marks earned
            </div>

          </div>


          <div className="mt-6">

            <div className="mb-2 flex justify-between text-xs font-semibold">

              <span className="text-slate-500">
                Correct answers
              </span>

              <span className="text-green-600">
                {answers.length > 0
                  ? Math.round(
                      (correctCount /
                        answers.length) *
                        100
                    )
                  : 0}
                %
              </span>

            </div>

            <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">

              <div
                className="answer-correct-bar bg-green-500"
                style={{
                  width: `${
                    answers.length
                      ? (correctCount /
                          answers.length) *
                        100
                      : 0
                  }%`,
                }}
              />

              <div
                className="answer-incorrect-bar bg-red-500"
                style={{
                  width: `${
                    answers.length
                      ? (incorrectCount /
                          answers.length) *
                        100
                      : 0
                  }%`,
                }}
              />

              <div
                className="bg-slate-300"
                style={{
                  width: `${
                    answers.length
                      ? (unansweredCount /
                          answers.length) *
                        100
                      : 0
                  }%`,
                }}
              />

            </div>


            <div className="mt-4 flex flex-wrap gap-5">

              <Legend
                color="bg-green-500"
                label={`Correct (${correctCount})`}
              />

              <Legend
                color="bg-red-500"
                label={`Incorrect (${incorrectCount})`}
              />

              <Legend
                color="bg-slate-300"
                label={`Unanswered (${unansweredCount})`}
              />

            </div>

          </div>

        </section>


        {/* =====================================
            FILTER
        ===================================== */}

        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h3 className="font-bold text-slate-800">
                Question Review
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Check your answers and learn from your mistakes.
              </p>

            </div>


            <div className="flex flex-wrap gap-2">

              <FilterButton
                active={filter === "ALL"}
                onClick={() =>
                  setFilter("ALL")
                }
                label={`All (${answers.length})`}
              />

              <FilterButton
                active={filter === "CORRECT"}
                onClick={() =>
                  setFilter("CORRECT")
                }
                label={`Correct (${correctCount})`}
              />

              <FilterButton
                active={filter === "INCORRECT"}
                onClick={() =>
                  setFilter("INCORRECT")
                }
                label={`Incorrect (${incorrectCount})`}
              />

              <FilterButton
                active={filter === "UNANSWERED"}
                onClick={() =>
                  setFilter("UNANSWERED")
                }
                label={`Unanswered (${unansweredCount})`}
              />

            </div>

          </div>

        </section>


        {/* =====================================
            QUESTIONS
        ===================================== */}

        <section className="mt-6">

          {filteredAnswers.length > 0 ? (

            <div className="space-y-5">

              {filteredAnswers.map(
                (answer, index) => (

                  <AnswerCard
                    key={
                      answer.question_id ||
                      answer.id ||
                      index
                    }
                    answer={answer}
                    index={index}
                    onOpen={() =>
                      setSelectedQuestion(
                        answer
                      )
                    }
                  />

                )
              )}

            </div>

          ) : (

            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                🔎
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-800">
                No questions found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                There are no questions matching this filter.
              </p>

              <button
                onClick={() =>
                  setFilter("ALL")
                }
                className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Show All Questions
              </button>

            </div>

          )}

        </section>


        {/* =====================================
            BOTTOM ACTIONS
        ===================================== */}

        <section className="mt-10">

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

            <button
              onClick={() =>
                navigate(
                  `/attempts/${attemptId}/result`
                )
              }
              className="group rounded-2xl border border-blue-200 bg-blue-50 p-5 text-left transition hover:-translate-y-1 hover:bg-blue-100 hover:shadow-lg"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-lg shadow-blue-600/20">
                  📊
                </div>

                <div>

                  <p className="font-bold text-blue-800">
                    Back to Result
                  </p>

                  <p className="mt-0.5 text-xs text-blue-600">
                    View your complete score
                  </p>

                </div>

                <span className="ml-auto text-lg text-blue-500 transition-transform group-hover:translate-x-1">
                  →
                </span>

              </div>

            </button>


            <button
              onClick={() =>
                navigate("/quizzes")
              }
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
                  📚
                </div>

                <div>

                  <p className="font-bold text-slate-800">
                    Browse Quizzes
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Try another quiz
                  </p>

                </div>

                <span className="ml-auto text-lg text-slate-400 transition-transform group-hover:translate-x-1">
                  →
                </span>

              </div>

            </button>


            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
                  🏠
                </div>

                <div>

                  <p className="font-bold text-slate-800">
                    Student Dashboard
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Return to your portal
                  </p>

                </div>

                <span className="ml-auto text-lg text-slate-400 transition-transform group-hover:translate-x-1">
                  →
                </span>

              </div>

            </button>

          </div>

        </section>

      </main>


      {/* =====================================
          QUESTION DETAIL MODAL
      ===================================== */}

      {selectedQuestion && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">

          <div className="review-modal max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Question Details
                </p>

                <h3 className="mt-1 font-bold text-slate-800">
                  {selectedQuestion.question_text}
                </h3>

              </div>

              <button
                onClick={() =>
                  setSelectedQuestion(
                    null
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
              >
                ✕
              </button>

            </div>

            <div className="p-6">

              <AnswerContent
                answer={selectedQuestion}
              />

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


/* =========================================
   ANSWER CARD
========================================= */

function AnswerCard({
  answer,
  index,
  onOpen,
}) {
  const isCorrect = answer.is_correct;

  const isUnanswered =
    !answer.selected_option ||
    answer.selected_option ===
      "Not answered";

  return (
    <article
      className={`answer-review-card overflow-hidden rounded-2xl border bg-white shadow-sm ${
        isCorrect
          ? "border-green-200"
          : isUnanswered
          ? "border-slate-200"
          : "border-red-200"
      }`}
    >

      {/* HEADER */}

      <div
        className={`flex flex-col gap-4 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${
          isCorrect
            ? "border-green-100 bg-green-50"
            : isUnanswered
            ? "border-slate-100 bg-slate-50"
            : "border-red-100 bg-red-50"
        }`}
      >

        <div className="flex items-center gap-3">

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
              isCorrect
                ? "bg-green-100 text-green-700"
                : isUnanswered
                ? "bg-slate-200 text-slate-600"
                : "bg-red-100 text-red-700"
            }`}
          >
            {index + 1}
          </div>

          <div>

            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Question {index + 1}
            </p>

            <p
              className={`mt-0.5 text-sm font-bold ${
                isCorrect
                  ? "text-green-700"
                  : isUnanswered
                  ? "text-slate-600"
                  : "text-red-700"
              }`}
            >
              {isCorrect
                ? "Correct Answer"
                : isUnanswered
                ? "Not Answered"
                : "Incorrect Answer"}
            </p>

          </div>

        </div>


        <div className="flex items-center gap-2">

          <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              isCorrect
                ? "bg-green-100 text-green-700"
                : isUnanswered
                ? "bg-slate-200 text-slate-600"
                : "bg-red-100 text-red-700"
            }`}
          >
            {isCorrect
              ? "✓ CORRECT"
              : isUnanswered
              ? "○ UNANSWERED"
              : "✕ INCORRECT"}
          </span>

        </div>

      </div>


      {/* CONTENT */}

      <div className="p-5 sm:p-6">

        <h4 className="text-lg font-bold leading-7 text-slate-800">
          {answer.question_text}
        </h4>


        {/* YOUR ANSWER */}

        <div className="mt-6">

          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Your Answer
          </p>

          <div
            className={`rounded-xl border p-4 ${
              isCorrect
                ? "border-green-200 bg-green-50"
                : isUnanswered
                ? "border-slate-200 bg-slate-50"
                : "border-red-200 bg-red-50"
            }`}
          >

            <div className="flex items-start gap-3">

              <span className="mt-0.5 text-lg">

                {isCorrect
                  ? "✓"
                  : isUnanswered
                  ? "○"
                  : "✕"}

              </span>

              <p
                className={`font-semibold ${
                  isCorrect
                    ? "text-green-800"
                    : isUnanswered
                    ? "text-slate-600"
                    : "text-red-800"
                }`}
              >
                {answer.selected_option ||
                  "Not answered"}
              </p>

            </div>

          </div>

        </div>


        {/* CORRECT ANSWER */}

        {(!isCorrect ||
          isUnanswered) && (

          <div className="mt-5">

            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Correct Answer
            </p>

            <div className="rounded-xl border border-green-200 bg-green-50 p-4">

              <div className="flex items-start gap-3">

                <span className="mt-0.5 text-lg text-green-600">
                  ✓
                </span>

                <p className="font-semibold text-green-800">
                  {answer.correct_option ||
                    "-"}
                </p>

              </div>

            </div>

          </div>

        )}


        {/* EXPLANATION */}

        {answer.explanation && (

          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-5">

            <div className="flex items-start gap-3">

              <span className="text-xl">
                💡
              </span>

              <div>

                <p className="text-sm font-bold text-blue-800">
                  Explanation
                </p>

                <p className="mt-1 text-sm leading-6 text-blue-700">
                  {answer.explanation}
                </p>

              </div>

            </div>

          </div>

        )}


        {/* MARKS + VIEW */}

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2">

            <span className="text-sm text-slate-500">
              Marks earned
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                isCorrect
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {answer.marks_earned ?? 0}
            </span>

          </div>


          <button
            onClick={onOpen}
            className="rounded-lg px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-50"
          >
            View Details →
          </button>

        </div>

      </div>

    </article>
  );
}


/* =========================================
   ANSWER CONTENT
========================================= */

function AnswerContent({ answer }) {
  const isCorrect = answer.is_correct;

  const isUnanswered =
    !answer.selected_option ||
    answer.selected_option ===
      "Not answered";

  return (
    <div>

      <div
        className={`rounded-xl border p-4 ${
          isCorrect
            ? "border-green-200 bg-green-50"
            : isUnanswered
            ? "border-slate-200 bg-slate-50"
            : "border-red-200 bg-red-50"
        }`}
      >

        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Your Answer
        </p>

        <p className="mt-2 font-semibold text-slate-800">
          {answer.selected_option ||
            "Not answered"}
        </p>

      </div>


      {(!isCorrect ||
        isUnanswered) && (

        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">

          <p className="text-[10px] font-bold uppercase tracking-wider text-green-600">
            Correct Answer
          </p>

          <p className="mt-2 font-semibold text-green-800">
            {answer.correct_option ||
              "-"}
          </p>

        </div>

      )}


      {answer.explanation && (

        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">

          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
            Explanation
          </p>

          <p className="mt-2 text-sm leading-6 text-blue-700">
            {answer.explanation}
          </p>

        </div>

      )}


      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">

        <span className="text-sm text-slate-500">
          Marks earned
        </span>

        <span className="font-bold text-slate-800">
          {answer.marks_earned ?? 0}
        </span>

      </div>

    </div>
  );
}


/* =========================================
   SUMMARY CARD
========================================= */

function SummaryCard({
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
    <div className="answer-summary-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${
          accentStyles[accent] ||
          accentStyles.blue
        }`}
      >
        {icon}
      </div>

      <p className="mt-5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-3xl font-extrabold text-slate-800">
        {value}
      </p>

    </div>
  );
}


/* =========================================
   FILTER BUTTON
========================================= */

function FilterButton({
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


/* =========================================
   LEGEND
========================================= */

function Legend({
  color,
  label,
}) {
  return (
    <div className="flex items-center gap-2">

      <span
        className={`h-3 w-3 rounded-full ${color}`}
      />

      <span className="text-xs font-medium text-slate-500">
        {label}
      </span>

    </div>
  );
}


export default AnswerReview;