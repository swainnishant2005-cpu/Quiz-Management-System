import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../services/api";

function StudentLayout({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await api.get("/auth/me/");
        setUser(response.data);
      } catch (error) {
        console.error("Unable to load user:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login");
        }
      }
    };

    loadUser();
  }, [navigate]);

  const logout = async () => {
    const refreshToken =
      localStorage.getItem("refresh_token");

    try {
      if (refreshToken) {
        await api.post("/auth/logout/", {
          refresh: refreshToken,
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    navigate("/login");
  };

  const getInitials = () => {
    if (!user) return "S";

    const first =
      user.first_name?.charAt(0) || "";

    const last =
      user.last_name?.charAt(0) || "";

    if (first || last) {
      return `${first}${last}`.toUpperCase();
    }

    return (
      user.username?.charAt(0) || "S"
    ).toUpperCase();
  };

  const getName = () => {
    const name =
      `${user?.first_name || ""} ${
        user?.last_name || ""
      }`.trim();

    return name || user?.username || "Student";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* SIDEBAR */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">

        {/* Logo */}

        <div className="flex h-20 items-center border-b border-slate-100 px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl shadow-md">
              🧠
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-800">
                QuizMaster
              </h1>

              <p className="text-xs text-slate-400">
                Student Portal
              </p>
            </div>

          </div>

        </div>

        {/* Navigation */}

        <nav className="flex-1 px-4 py-6">

          <p className="mb-4 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            Main
          </p>

          <div className="space-y-1">

            <StudentNav
              to="/dashboard"
              icon="⌂"
              label="Dashboard"
            />

            <StudentNav
              to="/student/quizzes"
              icon="▤"
              label="Browse Quizzes"
            />

            <StudentNav
              to="/history"
              icon="◷"
              label="Attempt History"
            />

            <StudentNav
              to="/leaderboard"
              icon="🏆"
              label="Leaderboard"
            />

            <StudentNav
              to="/profile"
              icon="♙"
              label="Profile"
            />

          </div>

          <div className="my-6 border-t border-slate-100" />

          <p className="mb-4 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            General
          </p>

          <div className="space-y-1">

            <StudentNav
              to="/student/quizzes"
              icon="▣"
              label="Categories"
            />

          </div>

        </nav>

        {/* Logout */}

        <div className="border-t border-slate-100 p-4">

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50"
          >

            <span className="text-lg">
              ⇥
            </span>

            Logout

          </button>

        </div>

      </aside>

      {/* MAIN AREA */}

      <div className="lg:pl-64">

        {/* TOP BAR */}

        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">

          {/* Search */}

          <div className="hidden w-full max-w-md md:block">

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">

              <span className="text-lg text-slate-400">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search quizzes..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />

              <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-400 shadow-sm">
                Ctrl + K
              </span>

            </div>

          </div>

          {/* Right side */}

          <div className="ml-auto flex items-center gap-5">

            {/* Notification */}

            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-xl text-slate-500 hover:bg-slate-100">
              🔔

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600" />
            </button>

            {/* Student */}

            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-slate-50"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
                {getInitials()}
              </div>

              <div className="hidden text-left sm:block">

                <p className="text-sm font-bold text-slate-800">
                  {getName()}
                </p>

                <p className="text-xs text-slate-400">
                  Student
                </p>

              </div>

              <span className="hidden text-slate-400 sm:block">
               ⌄
              </span>

            </button>

          </div>

        </header>

        {/* CONTENT */}

        <main className="min-h-[calc(100vh-80px)] px-5 py-8 sm:px-8 lg:px-10">

          <div className="mx-auto max-w-7xl">
            {children}
          </div>

        </main>

        {/* FOOTER */}

        <footer className="border-t border-slate-200 bg-white py-5 text-center text-sm text-slate-400">
          © 2026 QuizMaster. All rights reserved.
        </footer>

      </div>

    </div>
  );
}


/* NAV ITEM */

function StudentNav({
  to,
  icon,
  label,
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
          isActive
            ? "bg-blue-50 text-blue-600"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`
      }
    >

      <span className="flex w-6 justify-center text-lg">
        {icon}
      </span>

      {label}

    </NavLink>
  );
}

export default StudentLayout;