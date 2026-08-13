import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function AdminQuestions() {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (quizId) {
      fetchQuizAndQuestions();
    }
  }, [quizId]);

  const fetchQuizAndQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const quizResponse = await api.get(
        `/quizzes/${quizId}/`
      );

      setQuiz(quizResponse.data);

      const questionResponse = await api.get(
        `/quizzes/${quizId}/questions/`
      );

      const questionData = Array.isArray(
        questionResponse.data
      )
        ? questionResponse.data
        : questionResponse.data.results || [];

      setQuestions(questionData);

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
        error.response?.data?.error ||
        "Unable to load questions."
      );

    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (questionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/questions/${questionId}/`
      );

      setQuestions((current) =>
        current.filter(
          (question) => question.id !== questionId
        )
      );

    } catch (error) {
      alert(
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "Unable to delete question."
      );
    }
  };

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

        <nav className="space-y-2 p-4">

          <SidebarButton
            icon="📊"
            label="Dashboard"
            onClick={() => navigate("/admin")}
          />

          <SidebarButton
            icon="📝"
            label="Quizzes"
            active
            onClick={() =>
              navigate("/admin/quizzes")
            }
          />

          <SidebarButton
            icon="❓"
            label="Questions"
            active
            onClick={() =>
              navigate(
                `/admin/quizzes/${quizId}/questions`
              )
            }
          />

          <SidebarButton
            icon="👨‍🎓"
            label="Students"
            onClick={() =>
              navigate("/admin/students")
            }
          />

          <SidebarButton
            icon="📋"
            label="Attempts"
            onClick={() =>
              navigate("/admin/attempts")
            }
          />

          <SidebarButton
            icon="📈"
            label="Analytics"
            onClick={() =>
              navigate("/admin/analytics")
            }
          />

          <SidebarButton
            icon="🏆"
            label="Leaderboard"
            onClick={() =>
              navigate("/leaderboard")
            }
          />

        </nav>

      </aside>

      {/* Main */}
      <div className="lg:pl-64">

        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">

          <div className="flex min-h-20 items-center justify-between gap-4 px-6 py-4 lg:px-8">

            <div>

              <p className="text-sm text-slate-500">
                Administration / Quizzes / Questions
              </p>

              <h2 className="text-xl font-bold text-slate-800">
                Question Management
              </h2>

            </div>

            <button
              onClick={() =>
                navigate("/admin/quizzes")
              }
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              ← Back to Quizzes
            </button>

          </div>

        </header>

        <main className="p-6 lg:p-8">

          <div className="mx-auto max-w-6xl">

            {/* Quiz information */}
            {!loading && quiz && (

              <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 p-6 text-white shadow-xl">

                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                  <div>

                    <div className="mb-2 flex items-center gap-2">

                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                        {quiz.difficulty}
                      </span>

                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                        {quiz.status}
                      </span>

                    </div>

                    <h1 className="text-2xl font-bold">
                      {quiz.title}
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-blue-100">
                      {quiz.description ||
                        "Manage questions for this quiz."}
                    </p>

                  </div>

                  <div className="flex shrink-0 items-center gap-6">

                    <div className="text-center">

                      <p className="text-2xl font-bold">
                        {questions.length}
                      </p>

                      <p className="text-xs text-blue-100">
                        Questions
                      </p>

                    </div>

                    <div className="text-center">

                      <p className="text-2xl font-bold">
                        {quiz.duration}
                      </p>

                      <p className="text-xs text-blue-100">
                        Minutes
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            )}

            {/* Heading */}
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">

              <div>

                <h1 className="text-3xl font-bold text-slate-800">
                  Questions
                </h1>

                <p className="mt-2 text-slate-500">
                  Add and manage questions and answer options.
                </p>

              </div>

              <button
                onClick={() =>
                  navigate(
                    `/admin/quizzes/${quizId}/questions/create`
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                <span className="text-lg">
                  +
                </span>

                Add Question
              </button>

            </div>

            {/* Error */}
            {error && (

              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">

                {error}

              </div>

            )}

            {/* Loading */}
            {loading ? (

              <div className="flex justify-center py-20">

                <div className="text-center">

                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                  <p className="mt-4 text-sm text-slate-500">
                    Loading questions...
                  </p>

                </div>

              </div>

            ) : questions.length === 0 ? (

              /* Empty state */
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

                <div className="mb-5 text-6xl">
                  ❓
                </div>

                <h3 className="text-xl font-bold text-slate-800">
                  No questions yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-slate-500">
                  This quiz doesn't have any questions.
                  Add your first question to get started.
                </p>

                <button
                  onClick={() =>
                    navigate(
                      `/admin/quizzes/${quizId}/questions/create`
                    )
                  }
                  className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  + Add First Question
                </button>

              </div>

            ) : (

              /* Questions */
              <div className="space-y-5">

                {questions.map(
                  (question, index) => (

                    <QuestionCard
                      key={question.id}
                      question={question}
                      index={index}
                      onEdit={() =>
                        navigate(
                          `/admin/questions/${question.id}/edit`
                        )
                      }
                      onDelete={() =>
                        deleteQuestion(question.id)
                      }
                    />

                  )
                )}

              </div>

            )}

          </div>

        </main>

      </div>

    </div>
  );
}


function QuestionCard({
  question,
  index,
  onEdit,
  onDelete,
}) {
  const options = question.options || [];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">

      {/* Question header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5 md:flex-row md:items-center md:justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
            {index + 1}
          </div>

          <div>

            <div className="flex flex-wrap items-center gap-2">

              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                {question.marks || 1}{" "}
                {Number(question.marks) === 1
                  ? "Mark"
                  : "Marks"}
              </span>

              <DifficultyBadge
                difficulty={question.difficulty}
              />

            </div>

          </div>

        </div>

        <div className="flex gap-2">

          <button
            onClick={onEdit}
            title="Edit question"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100"
          >
            ✏️
          </button>

          <button
            onClick={onDelete}
            title="Delete question"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
          >
            🗑️
          </button>

        </div>

      </div>

      {/* Question body */}
      <div className="p-6">

        <h3 className="text-lg font-semibold leading-7 text-slate-800">
          {question.question_text}
        </h3>

        {/* Options */}
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">

          {options.map(
            (option, optionIndex) => (

              <div
                key={option.id}
                className={`rounded-xl border-2 p-4 ${
                  option.is_correct
                    ? "border-green-300 bg-green-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >

                <div className="flex items-start gap-3">

                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      option.is_correct
                        ? "bg-green-500 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {String.fromCharCode(
                      65 + optionIndex
                    )}
                  </div>

                  <div className="flex-1">

                    <p className="text-sm font-medium text-slate-700">
                      {option.option_text}
                    </p>

                    {option.is_correct && (

                      <p className="mt-1 text-xs font-semibold text-green-600">
                        ✓ Correct Answer
                      </p>

                    )}

                  </div>

                </div>

              </div>

            )
          )}

        </div>

        {/* Explanation */}
        {question.explanation && (

          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Explanation
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              {question.explanation}
            </p>

          </div>

        )}

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


function DifficultyBadge({ difficulty }) {
  const styles = {
    Easy: "bg-green-100 text-green-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Hard: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[difficulty] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {difficulty || "Unknown"}
    </span>
  );
}


export default AdminQuestions;