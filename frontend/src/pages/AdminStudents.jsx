import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminStudents() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/auth/admin/students/"
      );

      const data = response.data;

      setStudents(
        Array.isArray(data)
          ? data
          : data.students || []
      );
    } catch (err) {
      console.error(
        "Students error:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem(
          "access_token"
        );
        localStorage.removeItem(
          "refresh_token"
        );

        navigate("/login");
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "Admin access is required to view students."
        );
        return;
      }

      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          "Unable to load students."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    const value = search
      .toLowerCase()
      .trim();

    if (!value) {
      return students;
    }

    return students.filter((student) => {
      const username =
        student.username?.toLowerCase() || "";

      const email =
        student.email?.toLowerCase() || "";

      const firstName =
        student.first_name?.toLowerCase() || "";

      const lastName =
        student.last_name?.toLowerCase() || "";

      const fullName =
        student.full_name?.toLowerCase() || "";

      return (
        username.includes(value) ||
        email.includes(value) ||
        firstName.includes(value) ||
        lastName.includes(value) ||
        fullName.includes(value)
      );
    });
  }, [students, search]);

  const activeStudents = students.filter(
    (student) => student.is_active
  ).length;

  const inactiveStudents =
    students.length - activeStudents;

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* HEADER */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">

        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl text-white shadow-lg">
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


      {/* MAIN */}

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">

        {/* HERO */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-7 text-white shadow-2xl sm:p-9">

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />

          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-white/10" />

          <div className="relative z-10">

            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur">
              User Management
            </span>

            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              Students
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              View and manage all registered students
              in the quiz management system.
            </p>

          </div>

        </section>


        {/* STATISTICS */}

        <section className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <StatCard
            icon="👨‍🎓"
            title="Total Students"
            value={students.length}
            className="blue"
          />

          <StatCard
            icon="✓"
            title="Active Students"
            value={activeStudents}
            className="green"
          />

          <StatCard
            icon="○"
            title="Inactive Students"
            value={inactiveStudents}
            className="orange"
          />

        </section>


        {/* SEARCH */}

        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h3 className="text-lg font-bold text-slate-800">
                Student Management
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Search registered students.
              </p>

            </div>

            <div className="relative w-full sm:w-80">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search students..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

            </div>

          </div>

        </section>


        {/* ERROR */}

        {error && (

          <section className="mt-6 rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-2xl">
              ⚠️
            </div>

            <h3 className="mt-4 font-bold text-slate-800">
              Unable to load students
            </h3>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={fetchStudents}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Try Again
            </button>

          </section>
        )}


        {/* LOADING */}

        {loading && !error && (

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-14 text-center shadow-sm">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

            <p className="mt-4 text-sm font-semibold text-slate-600">
              Loading students...
            </p>

          </section>
        )}


        {/* TABLE */}

        {!loading &&
          !error &&
          filteredStudents.length > 0 && (

            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[850px]">

                  <thead>

                    <tr className="border-b border-slate-200 bg-slate-50">

                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Student
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Username
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Email
                      </th>

                      <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Registered
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredStudents.map(
                      (student) => {

                        const name =
                          student.full_name ||
                          `${student.first_name || ""} ${
                            student.last_name || ""
                          }`.trim() ||
                          student.username;

                        const initial =
                          name
                            ?.charAt(0)
                            .toUpperCase() ||
                          "S";

                        return (

                          <tr
                            key={student.id}
                            className="border-b border-slate-100 transition hover:bg-blue-50/40"
                          >

                            {/* STUDENT */}

                            <td className="px-6 py-5">

                              <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 font-bold text-blue-600">
                                  {initial}
                                </div>

                                <div>

                                  <p className="font-semibold text-slate-800">
                                    {name}
                                  </p>

                                  <p className="text-xs text-slate-400">
                                    Student ID #{student.id}
                                  </p>

                                </div>

                              </div>

                            </td>


                            {/* USERNAME */}

                            <td className="px-6 py-5">

                              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                @{student.username}
                              </span>

                            </td>


                            {/* EMAIL */}

                            <td className="px-6 py-5">

                              <span className="text-sm text-slate-600">
                                {student.email || "—"}
                              </span>

                            </td>


                            {/* STATUS */}

                            <td className="px-6 py-5 text-center">

                              {student.is_active ? (

                                <span className="rounded-full bg-green-100 px-3 py-1.5 text-[10px] font-bold text-green-700">
                                  ACTIVE
                                </span>

                              ) : (

                                <span className="rounded-full bg-red-100 px-3 py-1.5 text-[10px] font-bold text-red-700">
                                  INACTIVE
                                </span>

                              )}

                            </td>


                            {/* DATE */}

                            <td className="px-6 py-5">

                              <span className="text-sm font-medium text-slate-600">
                                {formatDate(
                                  student.created_at
                                )}
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


        {/* EMPTY */}

        {!loading &&
          !error &&
          filteredStudents.length === 0 && (

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-14 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                👨‍🎓
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-800">
                No students found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {search
                  ? "Try a different search term."
                  : "No students have registered yet."}
              </p>

            </section>
          )}

      </main>

    </div>
  );
}


/* =========================================
   STAT CARD
========================================= */

function StatCard({
  icon,
  title,
  value,
  className,
}) {

  const styles = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${
          styles[className]
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


export default AdminStudents;