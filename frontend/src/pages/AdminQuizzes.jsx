import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminQuizzes() {
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
      const response = await api.get("/quizzes/");

      const quizData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setQuizzes(quizData);
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
        "Unable to load quizzes."
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (quizId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this quiz?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/quizzes/${quizId}/`);

      setQuizzes((current) =>
        current.filter((quiz) => quiz.id !== quizId)
      );
    } catch (error) {
      alert(
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "Unable to delete quiz."
      );
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const searchText = search.toLowerCase();

    return (
      quiz.title?.toLowerCase().includes(searchText) ||
      quiz.description?.toLowerCase().includes(searchText) ||
      quiz.difficulty?.toLowerCase().includes(searchText) ||
      quiz.status?.toLowerCase().includes(searchText)
    );
  });

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
            onClick={() => navigate("/leaderboard")}
          />

        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 p-4">

          <button
            onClick={() => navigate("/dashboard")}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <span>👤</span>
            Student View
          </button>

        </div>

      </aside>

      {/* Main */}
      <div className="lg:pl-64">

        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">

          <div className="flex min-h-20 items-center justify-between gap-4 px-6 py-4 lg:px-8">

            <div>
              <p className="text-sm text-slate-500">
                Administration
              </p>

              <h2 className="text-xl font-bold text-slate-800">
                Quiz Management
              </h2>
            </div>

            <button
              onClick={() => navigate("/admin")}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              ← Dashboard
            </button>

          </div>

        </header>

        <main className="p-6 lg:p-8">

          {/* Page heading */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">

            <div>

              <h1 className="text-3xl font-bold text-slate-800">
                Quizzes
              </h1>

              <p className="mt-2 text-slate-500">
                Create, manage and organize your quizzes.
              </p>

            </div>

            <button
              onClick={() => navigate("/admin/quizzes/create")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:-translate-y-0.5"
            >
              <span className="text-lg">+</span>
              Create Quiz
            </button>

          </div>

          {/* Search */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="relative">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search quizzes by title, difficulty or status..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

            </div>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (

            <div className="flex justify-center py-20">

              <div className="text-center">

                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                <p className="mt-4 text-sm text-slate-500">
                  Loading quizzes...
                </p>

              </div>

            </div>

          ) : filteredQuizzes.length === 0 ? (

            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

              <div className="mb-4 text-5xl">
                📝
              </div>

              <h3 className="text-xl font-bold text-slate-800">
                No quizzes found
              </h3>

              <p className="mt-2 text-slate-500">
                {search
                  ? "Try changing your search."
                  : "Create your first quiz to get started."}
              </p>

              {!search && (
                <button
                  onClick={() =>
                    navigate("/admin/quizzes/create")
                  }
                  className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  + Create Quiz
                </button>
              )}

            </div>

          ) : (

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              {/* Table header */}
              <div className="border-b border-slate-200 px-6 py-4">

                <div className="flex items-center justify-between">

                  <div>
                    <h3 className="font-bold text-slate-800">
                      All Quizzes
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {filteredQuizzes.length} quiz
                      {filteredQuizzes.length !== 1 ? "zes" : ""}
                    </p>
                  </div>

                </div>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px] text-left">

                  <thead className="bg-slate-50">

                    <tr>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Quiz
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Category
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Difficulty
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Duration
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredQuizzes.map((quiz) => (

                      <tr
                        key={quiz.id}
                        className="border-t border-slate-100 transition hover:bg-slate-50"
                      >

                        {/* Quiz */}
                        <td className="px-6 py-5">

                          <div className="flex items-center gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl text-white">

                              {quiz.thumbnail ? (
                                <img
                                  src={quiz.thumbnail}
                                  alt={quiz.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                "🧠"
                              )}

                            </div>

                            <div className="max-w-xs">

                              <p className="font-semibold text-slate-800">
                                {quiz.title}
                              </p>

                              <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                                {quiz.description ||
                                  "No description"}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* Category */}
                        <td className="px-6 py-5">

                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                            {quiz.category_name ||
                              quiz.category?.name ||
                              "General"}
                          </span>

                        </td>

                        {/* Difficulty */}
                        <td className="px-6 py-5">

                          <DifficultyBadge
                            difficulty={quiz.difficulty}
                          />

                        </td>

                        {/* Duration */}
                        <td className="px-6 py-5">

                          <div className="text-sm font-medium text-slate-700">
                            ⏱ {quiz.duration} min
                          </div>

                          <div className="mt-1 text-xs text-slate-400">
                            Pass: {quiz.passing_percentage}%
                          </div>

                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">

                          <StatusBadge
                            status={quiz.status}
                          />

                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5">

                          <div className="flex justify-end gap-2">

                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/quizzes/${quiz.id}/edit`
                                )
                              }
                              title="Edit quiz"
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                            >
                              ✏️
                            </button>

                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/quizzes/${quiz.id}/questions`
                                )
                              }
                              title="Manage questions"
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 transition hover:bg-violet-100"
                            >
                              ❓
                            </button>

                            <button
                              onClick={() =>
                                deleteQuiz(quiz.id)
                              }
                              title="Delete quiz"
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                            >
                              🗑️
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          )}

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


function StatusBadge({ status }) {
  const styles = {
    Published: "bg-green-100 text-green-700",
    Draft: "bg-yellow-100 text-yellow-700",
    Unpublished: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}


export default AdminQuizzes;