import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function QuizDetails() {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/quizzes/${quizId}/`
      );

      const quizData = response.data;

      setQuiz(quizData);

      // Try to use the count supplied by the backend.
      if (
        typeof quizData.question_count ===
        "number"
      ) {
        setQuestionCount(
          quizData.question_count
        );
      } else if (
        typeof quizData.questions_count ===
        "number"
      ) {
        setQuestionCount(
          quizData.questions_count
        );
      } else {
        // Fallback: get questions for this quiz.
        try {
          const questionsResponse =
            await api.get(
              `/quizzes/${quizId}/questions/`
            );

          const questions =
            Array.isArray(
              questionsResponse.data
            )
              ? questionsResponse.data
              : questionsResponse.data.results ||
                [];

          setQuestionCount(questions.length);
        } catch {
          setQuestionCount(0);
        }
      }
    } catch (error) {
      console.error(error);

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

      if (error.response?.status === 404) {
        setError("Quiz not found.");
        return;
      }

      setError(
        error.response?.data?.detail ||
          error.response?.data?.error ||
          "Unable to load quiz."
      );
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = () => {
    if (!quiz) return "General";

    if (
      typeof quiz.category === "object"
    ) {
      return (
        quiz.category?.name ||
        quiz.category?.category_name ||
        "General"
      );
    }

    return (
      quiz.category_name ||
      "General"
    );
  };

  const getDifficultyClass = () => {
    if (quiz?.difficulty === "Easy") {
      return "bg-green-100 text-green-700";
    }

    if (quiz?.difficulty === "Medium") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (quiz?.difficulty === "Hard") {
      return "bg-red-100 text-red-700";
    }

    return "bg-slate-100 text-slate-600";
  };

  const startQuiz = () => {
    navigate(`/quizzes/${quizId}/start`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading quiz...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100">

        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-6">
            <h1 className="text-xl font-bold text-slate-800">
              QuizMaster
            </h1>

            <button
              onClick={() =>
                navigate(
                  "/student/quizzes"
                )
              }
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
            >
              ← Back to Quizzes
            </button>
          </div>
        </header>

        <main className="flex min-h-[70vh] items-center justify-center px-6">

          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
              ⚠️
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-800">
              Unable to load quiz
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={() =>
                navigate(
                  "/student/quizzes"
                )
              }
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Back to Quizzes
            </button>

          </div>

        </main>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-6">

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="flex items-center gap-3"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-lg shadow-blue-600/20">
              🧠
            </div>

            <div className="text-left">

              <h1 className="text-lg font-bold text-slate-800">
                QuizMaster
              </h1>

              <p className="text-xs text-slate-400">
                Student Portal
              </p>

            </div>

          </button>

          <button
            onClick={() =>
              navigate(
                "/student/quizzes"
              )
            }
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            ← Back to Quizzes
          </button>

        </div>

      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 p-8 text-white shadow-xl lg:p-10">

          <div className="relative z-10">

            <div className="flex flex-wrap items-center gap-3">

              <span className="rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold backdrop-blur">
                {getCategoryName()}
              </span>

              <span
                className={`rounded-full px-4 py-1.5 text-xs font-bold ${getDifficultyClass()}`}
              >
                {quiz?.difficulty || "Easy"}
              </span>

            </div>

            <h2 className="mt-5 max-w-3xl text-3xl font-bold leading-tight lg:text-4xl">
              {quiz?.title}
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100 lg:text-base">
              {quiz?.description ||
                "Test your knowledge and see how well you perform."}
            </p>

          </div>

          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 right-20 h-72 w-72 rounded-full bg-white/5" />

          <div className="absolute right-10 top-1/2 hidden -translate-y-1/2 text-8xl opacity-70 lg:block">
            🧠
          </div>

        </section>

        {/* Stats */}
        <section className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">

          <InfoCard
            icon="❓"
            title="Questions"
            value={questionCount}
          />

          <InfoCard
            icon="⏱️"
            title="Duration"
            value={`${quiz?.duration || 0} min`}
          />

          <InfoCard
            icon="🎯"
            title="Pass Mark"
            value={`${quiz?.passing_percentage || 0}%`}
          />

          <InfoCard
            icon="🔄"
            title="Attempts"
            value={
              quiz?.max_attempts ||
              "Unlimited"
            }
          />

        </section>

        {/* Main content */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Description */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
                📖
              </div>

              <div>

                <h3 className="font-bold text-slate-800">
                  About This Quiz
                </h3>

                <p className="text-xs text-slate-400">
                  What you will learn
                </p>

              </div>

            </div>

            <p className="mt-6 text-sm leading-7 text-slate-600">
              {quiz?.description ||
                "This quiz is designed to test your understanding of the selected topic. Answer each question carefully and try your best."}
            </p>

          </section>

          {/* Quick info */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h3 className="font-bold text-slate-800">
              Quiz Information
            </h3>

            <div className="mt-5 space-y-4">

              <DetailRow
                icon="📚"
                label="Category"
                value={getCategoryName()}
              />

              <DetailRow
                icon="🎯"
                label="Difficulty"
                value={
                  quiz?.difficulty ||
                  "Easy"
                }
              />

              <DetailRow
                icon="⏱️"
                label="Time Limit"
                value={`${quiz?.duration || 0} minutes`}
              />

              <DetailRow
                icon="📝"
                label="Questions"
                value={questionCount}
              />

              <DetailRow
                icon="🏆"
                label="Passing Score"
                value={`${quiz?.passing_percentage || 0}%`}
              />

            </div>

          </section>

        </div>

        {/* Instructions */}
        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">

          <div className="flex gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xl">
              ⚠️
            </div>

            <div>

              <h3 className="font-bold text-amber-900">
                Before You Start
              </h3>

              <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-800">

                <li>
                  • Make sure you have enough time to complete the quiz.
                </li>

                <li>
                  • Once started, the timer will begin automatically.
                </li>

                <li>
                  • Read each question carefully before selecting an answer.
                </li>

                <li>
                  • Submit your answers before the timer expires.
                </li>

                <li>
                  • Your result will be calculated automatically after submission.
                </li>

              </ul>

            </div>

          </div>

        </section>

        {/* Start */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">

            <div>

              <h3 className="text-lg font-bold text-slate-800">
                Ready to begin?
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                You have {quiz?.duration || 0} minutes to complete this quiz.
              </p>

            </div>

            <button
              onClick={startQuiz}
              disabled={questionCount === 0}
              className="w-full rounded-xl bg-blue-600 px-8 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
            >
              {questionCount === 0
                ? "No Questions Available"
                : "Start Quiz →"}
            </button>

          </div>

        </section>

      </main>

      <footer className="mt-10 border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-xs text-slate-400">
          © 2026 QuizMaster • Learn • Practice • Improve
        </div>

      </footer>

    </div>
  );
}


function InfoCard({
  icon,
  title,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
        {icon}
      </div>

      <p className="mt-4 text-xs font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-800">
        {value}
      </p>

    </div>
  );
}


function DetailRow({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">

      <div className="flex items-center gap-3">

        <span className="text-lg">
          {icon}
        </span>

        <span className="text-sm text-slate-500">
          {label}
        </span>

      </div>

      <span className="text-sm font-semibold text-slate-800">
        {value}
      </span>

    </div>
  );
}


export default QuizDetails;