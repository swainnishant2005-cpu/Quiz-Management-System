import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Leaderboard() {
  const navigate = useNavigate();

  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/attempts/leaderboard/"
      );

      setLeaders(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (error) {
      console.error(
        "Leaderboard error:",
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
          "Unable to load leaderboard."
      );
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = (rank) => {
    if (rank === 1) {
      return {
        badge:
          "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: "🥇",
      };
    }

    if (rank === 2) {
      return {
        badge:
          "bg-slate-100 text-slate-700 border-slate-200",
        icon: "🥈",
      };
    }

    if (rank === 3) {
      return {
        badge:
          "bg-orange-100 text-orange-700 border-orange-200",
        icon: "🥉",
      };
    }

    return {
      badge:
        "bg-slate-50 text-slate-600 border-slate-200",
      icon: `#${rank}`,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">

          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading leaderboard...
          </p>

        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">

        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
            ⚠️
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800">
            Unable to load leaderboard
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={fetchLeaderboard}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =========================
          NAVBAR
      ========================= */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-6">

          <div>
            <h1 className="text-xl font-bold text-slate-800">
              QuizMaster
            </h1>

            <p className="text-xs text-slate-500">
              Student Portal
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Dashboard
          </button>

        </div>

      </header>

      {/* =========================
          MAIN
      ========================= */}

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* =========================
            PAGE HEADER
        ========================= */}

        <section className="mb-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Student Rankings
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-800">
            Leaderboard 🏆
          </h2>

          <p className="mt-2 max-w-2xl text-slate-500">
            See how students are performing based on
            their completed quiz attempts.
          </p>

        </section>

        {/* =========================
            TOP 3
        ========================= */}

        {leaders.length >= 3 && (

          <section className="mb-8 grid grid-cols-1 items-end gap-5 md:grid-cols-3">

            {/* SECOND PLACE */}

            <PodiumCard
              student={leaders[1]}
              position={2}
            />

            {/* FIRST PLACE */}

            <PodiumCard
              student={leaders[0]}
              position={1}
              first
            />

            {/* THIRD PLACE */}

            <PodiumCard
              student={leaders[2]}
              position={3}
            />

          </section>
        )}

        {/* =========================
            EMPTY STATE
        ========================= */}

        {leaders.length === 0 ? (

          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

            <div className="text-5xl">
              🏆
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-800">
              No rankings yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Complete a quiz to start appearing
              on the leaderboard.
            </p>

            <button
              onClick={() =>
                navigate("/student/quizzes")
              }
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Browse Quizzes
            </button>

          </div>

        ) : (

          /* =========================
             LEADERBOARD TABLE
          ========================= */

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-6 py-5">

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h3 className="text-lg font-bold text-slate-800">
                    Student Rankings
                  </h3>

                  <p className="text-sm text-slate-500">
                    Ranked by average percentage
                  </p>

                </div>

                <span className="w-fit rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700">
                  {leaders.length}{" "}
                  {leaders.length === 1
                    ? "Student"
                    : "Students"}
                </span>

              </div>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="border-b border-slate-200 bg-slate-50">

                  <tr>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Rank
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Student
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Average
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Highest
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Attempts
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Passed
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {leaders.map(
                    (student, index) => {

                      const rank =
                        student.rank ||
                        index + 1;

                      const rankStyle =
                        getRankStyle(rank);

                      return (
                        <tr
                          key={
                            student.student_id ||
                            index
                          }
                          className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50"
                        >

                          {/* RANK */}

                          <td className="px-6 py-5">

                            <span
                              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-2 text-xs font-bold ${rankStyle.badge}`}
                            >
                              {rankStyle.icon}
                            </span>

                          </td>

                          {/* STUDENT */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-bold text-white">
                                {(
                                  student.username ||
                                  "S"
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>

                                <p className="font-semibold text-slate-800">
                                  {student.username ||
                                    "Student"}
                                </p>

                                {rank === 1 && (
                                  <p className="text-xs font-medium text-yellow-600">
                                    🏆 Top Performer
                                  </p>
                                )}

                              </div>

                            </div>

                          </td>

                          {/* AVERAGE */}

                          <td className="px-6 py-5">

                            <span className="font-bold text-blue-600">
                              {Number(
                                student.average_percentage ||
                                  0
                              ).toFixed(2)}
                              %
                            </span>

                          </td>

                          {/* HIGHEST */}

                          <td className="px-6 py-5">

                            <span className="font-semibold text-green-600">
                              {Number(
                                student.highest_percentage ||
                                  0
                              ).toFixed(2)}
                              %
                            </span>

                          </td>

                          {/* ATTEMPTS */}

                          <td className="px-6 py-5 text-sm text-slate-600">

                            {student.quizzes_attempted ??
                              0}

                          </td>

                          {/* PASSED */}

                          <td className="px-6 py-5">

                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                              {student.quizzes_passed ??
                                0}
                            </span>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          </section>

        )}

        {/* =========================
            BOTTOM ACTIONS
        ========================= */}

        <div className="mt-8 flex flex-wrap justify-center gap-3">

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            ← Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/student/quizzes")
            }
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Browse Quizzes
          </button>

          <button
            onClick={fetchLeaderboard}
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            ↻ Refresh
          </button>

        </div>

      </main>

    </div>
  );
}


/* ============================================================
   PODIUM CARD
============================================================ */

function PodiumCard({
  student,
  position,
  first = false,
}) {
  if (!student) {
    return null;
  }

  const percentage = Number(
    student.average_percentage || 0
  );

  const styles = {
    1: {
      border:
        "border-yellow-200",
      background:
        "bg-gradient-to-br from-yellow-50 to-white",
      icon: "🥇",
      title: "1st Place",
      color: "text-yellow-700",
    },

    2: {
      border:
        "border-slate-200",
      background:
        "bg-gradient-to-br from-slate-50 to-white",
      icon: "🥈",
      title: "2nd Place",
      color: "text-slate-700",
    },

    3: {
      border:
        "border-orange-200",
      background:
        "bg-gradient-to-br from-orange-50 to-white",
      icon: "🥉",
      title: "3rd Place",
      color: "text-orange-700",
    },
  };

  const style = styles[position];

  return (
    <div
      className={`relative rounded-2xl border p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        style.border
      } ${style.background} ${
        first ? "md:-translate-y-4" : ""
      }`}
    >

      <div className="text-4xl">
        {style.icon}
      </div>

      <p
        className={`mt-3 text-xs font-bold uppercase tracking-wider ${style.color}`}
      >
        {style.title}
      </p>

      <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xl font-bold text-white">
        {student.username
          ?.charAt(0)
          .toUpperCase() || "S"}
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-800">
        {student.username || "Student"}
      </h3>

      <p className="mt-2 text-3xl font-extrabold text-blue-600">
        {percentage.toFixed(2)}%
      </p>

      <p className="mt-1 text-xs text-slate-500">
        Average Percentage
      </p>

      <div className="mt-5 flex justify-center gap-5 border-t border-slate-200 pt-4">

        <div>
          <p className="text-lg font-bold text-slate-800">
            {student.quizzes_attempted ??
              0}
          </p>

          <p className="text-xs text-slate-500">
            Attempts
          </p>
        </div>

        <div>
          <p className="text-lg font-bold text-green-600">
            {student.quizzes_passed ??
              0}
          </p>

          <p className="text-xs text-slate-500">
            Passed
          </p>
        </div>

      </div>

    </div>
  );
}


export default Leaderboard;