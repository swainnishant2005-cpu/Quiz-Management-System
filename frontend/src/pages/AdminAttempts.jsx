import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminAttempts() {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [selectedAttempt, setSelectedAttempt] =
    useState(null);

  const [detailLoading, setDetailLoading] =
    useState(false);

  /* =========================================
     FETCH ATTEMPTS
  ========================================= */

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/admin/attempts/"
      );

      setAttempts(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );

    } catch (error) {
      console.error(
        "Admin attempts error:",
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

      if (error.response?.status === 403) {
        setError(
          "Admin access is required to view attempts."
        );
        return;
      }

      setError(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          "Unable to load attempts."
      );

    } finally {
      setLoading(false);
    }
  };


  /* =========================================
     VIEW ATTEMPT DETAIL
  ========================================= */

  const viewAttempt = async (attemptId) => {

    try {
      setDetailLoading(true);

      const response = await api.get(
        `/admin/attempts/${attemptId}/`
      );

      setSelectedAttempt(
        response.data
      );

    } catch (error) {
      console.error(
        "Attempt detail error:",
        error
      );

      alert(
        error.response?.data?.error ||
          "Unable to load attempt details."
      );

    } finally {
      setDetailLoading(false);
    }
  };


  /* =========================================
     FILTER
  ========================================= */

  const filteredAttempts = useMemo(() => {

    const value =
      search.toLowerCase().trim();

    return attempts.filter(
      (attempt) => {

        const student =
          (
            attempt.student_username ||
            ""
          ).toLowerCase();

        const quiz =
          (
            attempt.quiz_title ||
            ""
          ).toLowerCase();

        const matchesSearch =
          !value ||
          student.includes(value) ||
          quiz.includes(value);

        const matchesStatus =
          statusFilter === "ALL" ||
          attempt.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );

  }, [
    attempts,
    search,
    statusFilter,
  ]);


  /* =========================================
     STATISTICS
  ========================================= */

  const totalAttempts =
    attempts.length;

  const passedAttempts =
    attempts.filter(
      (attempt) =>
        attempt.status === "PASSED"
    ).length;

  const failedAttempts =
    attempts.filter(
      (attempt) =>
        attempt.status === "FAILED"
    ).length;

  const averagePercentage =
    totalAttempts > 0
      ? attempts.reduce(
          (total, attempt) =>
            total +
            Number(
              attempt.percentage || 0
            ),
          0
        ) / totalAttempts
      : 0;


  /* =========================================
     FORMAT DATE
  ========================================= */

  const formatDate = (date) => {

    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
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
            Loading attempts
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Fetching student quiz attempts...
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

        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
            ⚠️
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800">
            Unable to load attempts
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-600">
            {error}
          </p>

          <button
            onClick={fetchAttempts}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Try Again
          </button>

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
            onClick={() =>
              navigate("/admin")
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            ← Dashboard
          </button>

        </div>

      </header>


      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">

        {/* HERO */}

        <section className="admin-attempts-hero relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-7 text-white shadow-2xl sm:p-9">

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />

          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-white/10" />

          <div className="relative z-10">

            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur">
              Performance Management
            </span>

            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              Quiz Attempts
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Monitor student quiz attempts,
              scores, performance, and results.
            </p>

          </div>

        </section>


        {/* =====================================
            STATISTICS
        ===================================== */}

        <section className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <AttemptStat
            title="Total Attempts"
            value={totalAttempts}
            icon="📝"
            type="blue"
          />

          <AttemptStat
            title="Passed"
            value={passedAttempts}
            icon="✓"
            type="green"
          />

          <AttemptStat
            title="Failed"
            value={failedAttempts}
            icon="✕"
            type="red"
          />

          <AttemptStat
            title="Average Score"
            value={`${averagePercentage.toFixed(
              1
            )}%`}
            icon="📊"
            type="orange"
          />

        </section>


        {/* =====================================
            SEARCH / FILTER
        ===================================== */}

        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h3 className="text-lg font-bold text-slate-800">
                All Attempts
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Search and filter student attempts.
              </p>

            </div>


            <div className="flex flex-col gap-3 sm:flex-row">

              <div className="relative">

                <span className="absolute left-4 top-1/2 -translate-y-1/2">
                  🔍
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search student or quiz..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:w-72"
                />

              </div>


              <div className="flex gap-2">

                <FilterButton
                  active={
                    statusFilter === "ALL"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "ALL"
                    )
                  }
                  label="All"
                />

                <FilterButton
                  active={
                    statusFilter ===
                    "PASSED"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "PASSED"
                    )
                  }
                  label="Passed"
                />

                <FilterButton
                  active={
                    statusFilter ===
                    "FAILED"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "FAILED"
                    )
                  }
                  label="Failed"
                />

              </div>

            </div>

          </div>

        </section>


        {/* =====================================
            TABLE
        ===================================== */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {filteredAttempts.length === 0 ? (

            <div className="p-14 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                🔎
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-800">
                No attempts found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or filter.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1050px]">

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50">

                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Student
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Quiz
                    </th>

                    <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Score
                    </th>

                    <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Percentage
                    </th>

                    <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Correct
                    </th>

                    <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Completed
                    </th>

                    <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredAttempts.map(
                    (attempt) => {

                      const passed =
                        attempt.status ===
                        "PASSED";

                      return (

                        <tr
                          key={
                            attempt.attempt_id
                          }
                          className="attempt-row border-b border-slate-100 transition hover:bg-blue-50/40"
                        >

                          {/* STUDENT */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                                {(
                                  attempt.student_username ||
                                  "S"
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>

                                <p className="font-semibold text-slate-800">
                                  {attempt.student_username ||
                                    "Unknown"}
                                </p>

                                <p className="text-xs text-slate-400">
                                  ID #
                                  {
                                    attempt.student_id
                                  }
                                </p>

                              </div>

                            </div>

                          </td>


                          {/* QUIZ */}

                          <td className="max-w-[230px] px-6 py-5">

                            <p className="truncate font-semibold text-slate-700">
                              {attempt.quiz_title ||
                                "Unknown Quiz"}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Quiz #
                              {
                                attempt.quiz_id
                              }
                            </p>

                          </td>


                          {/* SCORE */}

                          <td className="px-6 py-5 text-center">

                            <span className="font-bold text-slate-800">
                              {attempt.score ??
                                0}
                            </span>

                          </td>


                          {/* PERCENTAGE */}

                          <td className="px-6 py-5 text-center">

                            <span
                              className={`font-extrabold ${
                                passed
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {Number(
                                attempt.percentage ||
                                  0
                              ).toFixed(
                                1
                              )}
                              %
                            </span>

                          </td>


                          {/* CORRECT */}

                          <td className="px-6 py-5 text-center">

                            <span className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                              {
                                attempt.correct_answers
                              }
                            </span>

                          </td>


                          {/* STATUS */}

                          <td className="px-6 py-5 text-center">

                            <span
                              className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
                                passed
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {passed
                                ? "PASSED"
                                : "FAILED"}
                            </span>

                          </td>


                          {/* DATE */}

                          <td className="px-6 py-5">

                            <p className="text-xs font-medium text-slate-600">
                              {formatDate(
                                attempt.completed_at
                              )}
                            </p>

                          </td>


                          {/* ACTION */}

                          <td className="px-6 py-5 text-center">

                            <button
                              onClick={() =>
                                viewAttempt(
                                  attempt.attempt_id
                                )
                              }
                              className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                            >
                              View
                            </button>

                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>


      {/* =====================================
          DETAIL MODAL
      ===================================== */}

      {selectedAttempt && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">

          <div className="attempt-detail-modal max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  Attempt Details
                </p>

                <h3 className="mt-1 text-xl font-bold text-slate-800">
                  {selectedAttempt.quiz_title}
                </h3>

              </div>

              <button
                onClick={() =>
                  setSelectedAttempt(
                    null
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>

            </div>


            {/* MODAL CONTENT */}

            <div className="p-6">

              {detailLoading ? (

                <div className="py-10 text-center">

                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

                  <p className="mt-3 text-sm text-slate-500">
                    Loading details...
                  </p>

                </div>

              ) : (

                <>

                  {/* STUDENT */}

                  <div className="rounded-2xl bg-slate-50 p-5">

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Student
                    </p>

                    <p className="mt-2 font-bold text-slate-800">
                      {
                        selectedAttempt.student_username
                      }
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {
                        selectedAttempt.student_email
                      }
                    </p>

                  </div>


                  {/* SCORE GRID */}

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">

                    <DetailStat
                      label="Score"
                      value={
                        selectedAttempt.score ??
                        0
                      }
                    />

                    <DetailStat
                      label="Percentage"
                      value={`${Number(
                        selectedAttempt.percentage ||
                          0
                      ).toFixed(
                        1
                      )}%`}
                    />

                    <DetailStat
                      label="Correct"
                      value={
                        selectedAttempt.correct_answers ??
                        0
                      }
                    />

                    <DetailStat
                      label="Incorrect"
                      value={
                        selectedAttempt.incorrect_answers ??
                        0
                      }
                    />

                  </div>


                  {/* EXTRA DETAILS */}

                  <div className="mt-5 rounded-2xl border border-slate-200 p-5">

                    <div className="grid gap-4 sm:grid-cols-2">

                      <InfoRow
                        label="Status"
                        value={
                          selectedAttempt.status
                        }
                      />

                      <InfoRow
                        label="Unanswered"
                        value={
                          selectedAttempt.unanswered ??
                          0
                        }
                      />

                      <InfoRow
                        label="Time Taken"
                        value={`${selectedAttempt.time_taken ?? 0} seconds`}
                      />

                      <InfoRow
                        label="Completed"
                        value={formatDate(
                          selectedAttempt.completed_at
                        )}
                      />

                    </div>

                  </div>

                </>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


/* =========================================
   STAT CARD
========================================= */

function AttemptStat({
  title,
  value,
  icon,
  type,
}) {

  const styles = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="attempt-stat rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

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
      className={`rounded-lg px-4 py-2.5 text-xs font-bold transition ${
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
   DETAIL STAT
========================================= */

function DetailStat({
  label,
  value,
}) {

  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-extrabold text-slate-800">
        {value}
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
}) {

  return (
    <div>

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-700">
        {value}
      </p>

    </div>
  );
}


export default AdminAttempts;