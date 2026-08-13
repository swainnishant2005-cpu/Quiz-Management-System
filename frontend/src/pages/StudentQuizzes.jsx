import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function StudentQuizzes() {
    const navigate = useNavigate();

    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [difficultyFilter, setDifficultyFilter] =
        useState("All");

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

            // Only published quizzes are visible to students.
            const published = data.filter(
                (quiz) => quiz.status === "Published"
            );

            setQuizzes(published);

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

    const getCategoryName = (quiz) => {
        if (typeof quiz.category === "object") {
            return (
                quiz.category?.name ||
                quiz.category?.category_name ||
                "General"
            );
        }

        return quiz.category_name || "General";
    };

    const getQuestionCount = (quiz) => {
        if (typeof quiz.question_count === "number") {
            return quiz.question_count;
        }

        if (typeof quiz.questions_count === "number") {
            return quiz.questions_count;
        }

        return quiz.questions?.length || 0;
    };

    const categories = useMemo(() => {
        const uniqueCategories = [
            ...new Set(
                quizzes.map((quiz) =>
                    getCategoryName(quiz)
                )
            ),
        ];

        return ["All", ...uniqueCategories];
    }, [quizzes]);

    const filteredQuizzes = useMemo(() => {
        return quizzes.filter((quiz) => {
            const category = getCategoryName(quiz);

            const title =
                quiz.title?.toLowerCase() || "";

            const description =
                quiz.description?.toLowerCase() || "";

            const searchValue =
                search.toLowerCase().trim();

            const matchesSearch =
                !searchValue ||
                title.includes(searchValue) ||
                description.includes(searchValue) ||
                category
                    .toLowerCase()
                    .includes(searchValue);

            const matchesCategory =
                categoryFilter === "All" ||
                category === categoryFilter;

            const matchesDifficulty =
                difficultyFilter === "All" ||
                quiz.difficulty === difficultyFilter;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesDifficulty
            );
        });
    }, [
        quizzes,
        search,
        categoryFilter,
        difficultyFilter,
    ]);

    const clearFilters = () => {
        setSearch("");
        setCategoryFilter("All");
        setDifficultyFilter("All");
    };

    return (
        <div className="student-page-enter">

            {/* PAGE HEADER */}

            <section className="mb-8">

                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

                    <div>

                        <div className="mb-3 flex items-center gap-2">

                            <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600">
                                Quiz Library
                            </span>

                            <span className="text-xs text-slate-400">
                                {quizzes.length} available
                            </span>

                        </div>
                        {/* Back Button */}

                        <div className="mb-5">
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-x-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            >
                                <span className="text-lg transition-transform group-hover:-translate-x-1">
                                    ←
                                </span>

                                Back to Dashboard
                            </button>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            Browse Quizzes
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                            Challenge yourself, test your knowledge,
                            and improve your skills with interactive
                            quizzes.
                        </p>

                    </div>

                    <button
                        onClick={fetchQuizzes}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        <span className={loading ? "animate-spin" : ""}>
                            ↻
                        </span>

                        Refresh
                    </button>

                </div>

            </section>


            {/* FEATURE BANNER */}

            <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 text-white shadow-xl shadow-blue-500/10 sm:p-8">

                <div className="relative z-10 max-w-2xl">

                    <div className="mb-3 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                        🎯 Keep learning
                    </div>

                    <h2 className="text-2xl font-bold sm:text-3xl">
                        Find your next challenge.
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-blue-100">
                        Choose a topic, select your difficulty,
                        and start a quiz whenever you're ready.
                    </p>

                </div>

                <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10" />

                <div className="absolute -bottom-24 right-20 h-60 w-60 rounded-full bg-white/5" />

                <div className="absolute right-10 top-1/2 hidden -translate-y-1/2 text-7xl opacity-90 lg:block">
                    🧠
                </div>

            </section>


            {/* FILTER BAR */}

            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

                <div className="flex flex-col gap-4 xl:flex-row xl:items-center">

                    {/* Search */}

                    <div className="relative flex-1">

                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                            ⌕
                        </span>

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search quizzes..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        />

                    </div>


                    {/* Category */}

                    <div className="w-full xl:w-48">

                        <select
                            value={categoryFilter}
                            onChange={(e) =>
                                setCategoryFilter(e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        >

                            {categories.map((category) => (
                                <option
                                    key={category}
                                    value={category}
                                >
                                    {category === "All"
                                        ? "All Categories"
                                        : category}
                                </option>
                            ))}

                        </select>

                    </div>


                    {/* Difficulty */}

                    <div className="w-full xl:w-44">

                        <select
                            value={difficultyFilter}
                            onChange={(e) =>
                                setDifficultyFilter(
                                    e.target.value
                                )
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        >

                            <option value="All">
                                All Difficulties
                            </option>

                            <option value="Easy">
                                Easy
                            </option>

                            <option value="Medium">
                                Medium
                            </option>

                            <option value="Hard">
                                Hard
                            </option>

                        </select>

                    </div>


                    {/* Clear */}

                    {(search ||
                        categoryFilter !== "All" ||
                        difficultyFilter !== "All") && (

                            <button
                                onClick={clearFilters}
                                className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                            >
                                Clear
                            </button>

                        )}

                </div>

            </section>


            {/* ERROR */}

            {error && (

                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">

                    <span className="text-lg">
                        ⚠️
                    </span>

                    <div>

                        <p className="text-sm font-bold text-red-700">
                            Unable to load quizzes
                        </p>

                        <p className="mt-1 text-sm text-red-600">
                            {error}
                        </p>

                    </div>

                </div>

            )}


            {/* LOADING */}

            {loading ? (

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

                    {[1, 2, 3, 4, 5, 6].map(
                        (item) => (

                            <QuizSkeleton key={item} />

                        )
                    )}

                </div>

            ) : filteredQuizzes.length === 0 ? (

                /* EMPTY */

                <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-4xl">
                        {quizzes.length === 0
                            ? "📚"
                            : "🔎"}
                    </div>

                    <h3 className="mt-5 text-xl font-bold text-slate-800">

                        {quizzes.length === 0
                            ? "No quizzes available"
                            : "No matching quizzes"}

                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">

                        {quizzes.length === 0
                            ? "There are currently no published quizzes. Please check again later."
                            : "Try changing your search or filters to find another quiz."}

                    </p>

                    {quizzes.length > 0 && (

                        <button
                            onClick={clearFilters}
                            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                            Clear Filters
                        </button>

                    )}

                </div>

            ) : (

                /* QUIZ GRID */

                <>

                    <div className="mb-5 flex items-center justify-between">

                        <p className="text-sm text-slate-500">

                            Showing{" "}

                            <span className="font-bold text-slate-800">
                                {filteredQuizzes.length}
                            </span>{" "}

                            {filteredQuizzes.length === 1
                                ? "quiz"
                                : "quizzes"}

                        </p>

                    </div>


                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

                        {filteredQuizzes.map((quiz) => (

                            <QuizCard
                                key={quiz.id}
                                quiz={quiz}
                                category={getCategoryName(quiz)}
                                questionCount={getQuestionCount(quiz)}
                                onStart={() =>
                                    navigate(
                                        `/quizzes/${quiz.id}`
                                    )
                                }
                            />

                        ))}

                    </div>

                </>

            )}

        </div>
    );
}


/* =========================================
   QUIZ CARD
========================================= */

function QuizCard({
    quiz,
    category,
    questionCount,
    onStart,
}) {
    const difficultyStyles = {
        Easy: "bg-emerald-50 text-emerald-700 ring-emerald-100",
        Medium: "bg-amber-50 text-amber-700 ring-amber-100",
        Hard: "bg-red-50 text-red-700 ring-red-100",
    };

    return (
        <article className="quiz-card group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* Thumbnail */}

            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700">

                {quiz.thumbnail ? (

                    <img
                        src={quiz.thumbnail}
                        alt={quiz.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />

                ) : (

                    <>

                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-indigo-600/80 to-violet-700/90" />

                        <div className="relative flex h-full items-center justify-center">

                            <div className="quiz-brain-icon flex h-24 w-24 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-5xl shadow-2xl backdrop-blur-sm">
                                🧠
                            </div>

                        </div>

                    </>

                )}


                {/* Decorative circles */}

                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />

                <div className="absolute -bottom-10 -left-5 h-24 w-24 rounded-full bg-white/10" />


                {/* Category */}

                <div className="absolute left-4 top-4">

                    <span className="rounded-full border border-white/20 bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-lg backdrop-blur">
                        {category}
                    </span>

                </div>

            </div>


            {/* Content */}

            <div className="p-6">

                <div className="flex items-start justify-between gap-3">

                    <h3 className="line-clamp-2 text-lg font-bold leading-6 text-slate-800 transition group-hover:text-blue-600">
                        {quiz.title}
                    </h3>

                    <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ring-1 ${difficultyStyles[
                            quiz.difficulty
                            ] ||
                            "bg-slate-50 text-slate-600 ring-slate-100"
                            }`}
                    >
                        {quiz.difficulty || "General"}
                    </span>

                </div>


                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                    {quiz.description ||
                        "Test your knowledge with this interactive quiz."}
                </p>


                {/* Stats */}

                <div className="mt-5 grid grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50 py-3">

                    <Stat
                        icon="❓"
                        value={questionCount}
                        label="Questions"
                    />

                    <Stat
                        icon="⏱"
                        value={
                            quiz.duration
                                ? `${quiz.duration}m`
                                : "--"
                        }
                        label="Duration"
                    />

                    <Stat
                        icon="🎯"
                        value={
                            quiz.passing_percentage != null
                                ? `${quiz.passing_percentage}%`
                                : "--"
                        }
                        label="Pass"
                    />

                </div>


                {/* Start */}

                <button
                    onClick={onStart}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/30 active:translate-y-0"
                >

                    Start Quiz

                    <span className="text-lg transition-transform duration-200 group-hover:translate-x-1">
                        →
                    </span>

                </button>

            </div>

        </article>
    );
}


/* =========================================
   STAT
========================================= */

function Stat({
    icon,
    value,
    label,
}) {
    return (
        <div className="text-center">

            <div className="text-sm">
                {icon}
            </div>

            <p className="mt-1 text-sm font-bold text-slate-800">
                {value}
            </p>

            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                {label}
            </p>

        </div>
    );
}


/* =========================================
   SKELETON
========================================= */

function QuizSkeleton() {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="h-48 animate-pulse bg-slate-200" />

            <div className="space-y-4 p-6">

                <div className="flex gap-3">

                    <div className="h-5 flex-1 animate-pulse rounded bg-slate-200" />

                    <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200" />

                </div>

                <div className="h-4 animate-pulse rounded bg-slate-100" />

                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />

                <div className="h-16 animate-pulse rounded-xl bg-slate-100" />

                <div className="h-12 animate-pulse rounded-xl bg-slate-200" />

            </div>

        </div>
    );
}


export default StudentQuizzes;