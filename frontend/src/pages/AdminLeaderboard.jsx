import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminLeaderboard() {
  const navigate = useNavigate();

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/leaderboard/");

      console.log(
        "Admin leaderboard response:",
        response.data
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results ||
          response.data.leaderboard ||
          [];

      setLeaderboard(data);
    } catch (err) {
      console.error(
        "Admin leaderboard error:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to view the admin leaderboard."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.error ||
            "Unable to load leaderboard."
        );
      }
    } finally {
      setLoading(false);
    }
  };


  /* ================================
     LOADING
  ================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">

        <div className="text-center">

          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="mt-4 text-sm font-semibold text-slate-600">
            Loading leaderboard...
          </p>

        </div>

      </div>
    );
  }


  /* ================================
     ERROR
  ================================= */

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">

        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
            ⚠️
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-800">
            Leaderboard Error
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <div className="mt-6 flex justify-center gap-3">

            <button
              onClick={fetchLeaderboard}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Try Again
            </button>

            <button
              onClick={() => navigate("/admin")}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Dashboard
            </button>

          </div>

        </div>

      </div>
    );
  }


  /* ================================
     MAIN PAGE
  ================================= */

  return (
    <div className="min-h-screen bg-slate-100">

      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>

            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Administration
            </p>

            <h1 className="mt-1 text-2xl font-extrabold text-slate-800">
              Admin Leaderboard 🏆
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Student performance rankings
            </p>

          </div>


          <button
            onClick={() => navigate("/admin")}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            ← Dashboard
          </button>

        </div>

      </header>


      {/* MAIN */}

      <main className="mx-auto max-w-7xl px-6 py-8">


        {/* TOP STAT */}

        <div className="mb-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
                👨‍🎓
              </div>

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ranked Students
                </p>

                <p className="mt-1 text-2xl font-extrabold text-slate-800">
                  {leaderboard.length}
                </p>

              </div>

            </div>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50 text-xl">
                🥇
              </div>

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Top Performer
                </p>

                <p className="mt-1 text-lg font-extrabold text-slate-800">
                  {leaderboard[0]?.username ||
                    "No data"}
                </p>

              </div>

            </div>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl">
                📈
              </div>

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Highest Average
                </p>

                <p className="mt-1 text-2xl font-extrabold text-green-600">

                  {leaderboard.length > 0
                    ? Math.max(
                        ...leaderboard.map(
                          (student) =>
                            Number(
                              student.average_percentage
                            ) || 0
                        )
                      ).toFixed(2)
                    : "0.00"}
                  %

                </p>

              </div>

            </div>

          </div>

        </div>


        {/* LEADERBOARD TABLE */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* TABLE HEADER */}

          <div className="border-b border-slate-100 p-6">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-lg font-bold text-slate-800">
                  Student Rankings
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Ranked by average percentage
                </p>

              </div>


              <button
                onClick={fetchLeaderboard}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                ↻ Refresh
              </button>

            </div>

          </div>


          {leaderboard.length === 0 ? (

            /* EMPTY */

            <div className="p-14 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                🏆
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-800">
                No leaderboard data
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Students will appear here after completing quizzes.
              </p>

            </div>

          ) : (

            /* TABLE */

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="bg-slate-50">

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Rank
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Student
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                      Best Score
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                      Average
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                      Highest
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Best Quiz
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {leaderboard.map(
                    (student, index) => {

                      const rank =
                        student.rank ||
                        index + 1;

                      const bestScore =
                        Number(
                          student.best_score
                        ) || 0;

                      const bestPercentage =
                        Number(
                          student.best_percentage
                        ) || 0;

                      const averagePercentage =
                        Number(
                          student.average_percentage
                        ) || 0;


                      return (
                        <tr
                          key={
                            student.student_id ||
                            index
                          }
                          className="border-t border-slate-100 transition hover:bg-blue-50/40"
                        >

                          {/* RANK */}

                          <td className="px-6 py-5">

                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-xl font-extrabold ${
                                rank === 1
                                  ? "bg-yellow-100 text-yellow-700"
                                  : rank === 2
                                  ? "bg-slate-200 text-slate-700"
                                  : rank === 3
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-blue-50 text-blue-600"
                              }`}
                            >

                              {rank === 1
                                ? "🥇"
                                : rank === 2
                                ? "🥈"
                                : rank === 3
                                ? "🥉"
                                : rank}

                            </div>

                          </td>


                          {/* STUDENT */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 font-bold text-white">

                                {(
                                  student.username ||
                                  "S"
                                )
                                  .charAt(0)
                                  .toUpperCase()}

                              </div>

                              <div>

                                <p className="font-bold text-slate-800">
                                  {student.username ||
                                    "Unknown Student"}
                                </p>

                                {rank === 1 && (
                                  <p className="text-xs font-semibold text-yellow-600">
                                    🏆 Top Performer
                                  </p>
                                )}

                              </div>

                            </div>

                          </td>


                          {/* BEST SCORE */}

                          <td className="px-6 py-5 text-center">

                            <span className="font-extrabold text-slate-800">
                              {bestScore}
                            </span>

                          </td>


                          {/* AVERAGE */}

                          <td className="px-6 py-5 text-center">

                            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-600">
                              {averagePercentage.toFixed(2)}%
                            </span>

                          </td>


                          {/* HIGHEST */}

                          <td className="px-6 py-5 text-center">

                            <span className="rounded-full bg-green-50 px-3 py-1.5 text-sm font-bold text-green-600">
                              {bestPercentage.toFixed(2)}%
                            </span>

                          </td>


                          {/* QUIZ */}

                          <td className="px-6 py-5">

                            <div className="max-w-xs">

                              <p className="truncate font-semibold text-slate-700">
                                {student.quiz_title ||
                                  "—"}
                              </p>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* BOTTOM BUTTONS */}

        <div className="mt-7 flex justify-center gap-3">

          <button
            onClick={() => navigate("/admin")}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            ← Dashboard
          </button>

          <button
            onClick={fetchLeaderboard}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            ↻ Refresh Leaderboard
          </button>

        </div>

      </main>

    </div>
  );
}

export default AdminLeaderboard;