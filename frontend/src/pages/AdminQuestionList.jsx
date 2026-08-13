import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminQuestionList() {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/quizzes/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setQuizzes(data);
    } catch (error) {
      console.error("Question list error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.detail ||
          error.response?.data?.error ||
          "Unable to load quizzes."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const title = (
      quiz.title ||
      quiz.name ||
      ""
    ).toLowerCase();

    const description = (
      quiz.description ||
      ""
    ).toLowerCase();

    const value = search.toLowerCase().trim();

    return (
      title.includes(value) ||
      description.includes(value)
    );
  });

  const getQuizId = (quiz) =>
    quiz.id || quiz.quiz_id;

  const getQuizTitle = (quiz) =>
    quiz.title ||
    quiz.name ||
    "Untitled Quiz";

  const getQuestionCount = (quiz) =>
    quiz.question_count ??
    quiz.total_questions ??
    quiz.questions_count ??
    0;

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">

        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl text-white shadow-lg shadow-blue-500/20">
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


      {/* =====================================
          MAIN
      ===================================== */}

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">

        {/* PAGE HEADER */}

        <section className="question-list-hero relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-7 text-white shadow-2xl sm:p-9">

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />

          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-white/10" />

          <div className="relative z-10">

            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur">
              Question Management
            </span>

            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              Questions
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Select a quiz to view, create, edit, or
              delete its questions.
            </p>

          </div>

        </section>


        {/* =====================================
            SEARCH
        ===================================== */}

        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h3 className="text-lg font-bold text-slate-800">
                Select a Quiz
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Choose a quiz to manage its questions.
              </p>

            </div>

            <div className="relative w-full sm:w-80">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search quizzes..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

            </div>

          </div>

        </section>


        {/* =====================================
            LOADING
        ===================================== */}

        {loading && (

          <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

            <p className="mt-4 text-sm font-semibold text-slate-600">
              Loading quizzes...
            </p>

          </div>

        )}


        {/* =====================================
            ERROR
        ===================================== */}

        {!loading && error && (

          <div className="mt-7 rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
              ⚠️
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-800">
              Unable to load quizzes
            </h3>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={fetchQuizzes}
              className="mt-5 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Try Again
            </button>

          </div>

        )}


        {/* =====================================
            QUIZ LIST
        ===================================== */}

        {!loading &&
          !error &&
          filteredQuizzes.length > 0 && (

            <section className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {filteredQuizzes.map(
                (quiz, index) => {

                  const quizId =
                    getQuizId(quiz);

                  const title =
                    getQuizTitle(quiz);

                  const questionCount =
                    getQuestionCount(quiz);

                  return (
                    <article
                      key={
                        quizId || index
                      }
                      className="question-quiz-card group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >

                      {/* CARD TOP */}

                      <div className="relative h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

                      <div className="p-6">

                        <div className="flex items-start justify-between gap-4">

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-600">
                            ❓
                          </div>

                          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                            Quiz #{quizId}
                          </span>

                        </div>


                        {/* TITLE */}

                        <h3 className="mt-5 line-clamp-2 text-lg font-bold text-slate-800">
                          {title}
                        </h3>


                        {/* DESCRIPTION */}

                        <p className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-5 text-slate-500">
                          {quiz.description ||
                            "Manage questions for this quiz."}
                        </p>


                        {/* INFO */}

                        <div className="mt-5 grid grid-cols-2 gap-3">

                          <div className="rounded-xl bg-slate-50 p-3">

                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Questions
                            </p>

                            <p className="mt-1 text-xl font-extrabold text-slate-800">
                              {questionCount}
                            </p>

                          </div>

                          <div className="rounded-xl bg-blue-50 p-3">

                            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                              Management
                            </p>

                            <p className="mt-1 text-sm font-bold text-blue-700">
                              Available
                            </p>

                          </div>

                        </div>


                        {/* ACTION */}

                        <button
                          onClick={() =>
                            navigate(
                              `/admin/quizzes/${quizId}/questions`
                            )
                          }
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                        >
                          Manage Questions

                          <span className="transition-transform group-hover:translate-x-1">
                            →
                          </span>
                        </button>

                      </div>

                    </article>
                  );
                }
              )}

            </section>
          )}


        {/* =====================================
            NO QUIZZES
        ===================================== */}

        {!loading &&
          !error &&
          filteredQuizzes.length === 0 && (

            <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                🔎
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-800">
                No quizzes found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {search
                  ? "Try a different search term."
                  : "Create a quiz before managing its questions."}
              </p>

              {!search && (
                <button
                  onClick={() =>
                    navigate(
                      "/admin/quizzes/create"
                    )
                  }
                  className="mt-5 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                >
                  + Create Quiz
                </button>
              )}

            </section>
          )}

      </main>

    </div>
  );
}

export default AdminQuestionList;