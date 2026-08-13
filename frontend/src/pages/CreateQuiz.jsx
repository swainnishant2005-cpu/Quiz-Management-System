import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CreateQuiz() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "Easy",
    duration: 15,
    passing_percentage: 60,
    max_attempts: 1,
    status: "Draft",
    thumbnail: null,
  });

  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories/");

      const categoryData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setCategories(categoryData);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
        "Unable to load categories."
      );
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0] || null;

    setFormData((current) => ({
      ...current,
      thumbnail: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.title.trim()) {
      setError("Quiz title is required.");
      return;
    }

    if (!formData.category) {
      setError("Please select a category.");
      return;
    }

    if (Number(formData.duration) <= 0) {
      setError("Duration must be greater than 0.");
      return;
    }

    if (
      Number(formData.passing_percentage) < 0 ||
      Number(formData.passing_percentage) > 100
    ) {
      setError("Passing percentage must be between 0 and 100.");
      return;
    }

    if (Number(formData.max_attempts) <= 0) {
      setError("Maximum attempts must be at least 1.");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("difficulty", formData.difficulty);
      data.append("duration", formData.duration);
      data.append(
        "passing_percentage",
        formData.passing_percentage
      );
      data.append("max_attempts", formData.max_attempts);
      data.append("status", formData.status);

      if (formData.thumbnail) {
        data.append("thumbnail", formData.thumbnail);
      }

      await api.post("/quizzes/", data);

      setSuccess("Quiz created successfully!");

      setTimeout(() => {
        navigate("/admin/quizzes");
      }, 800);

    } catch (error) {
      console.error(error);

      const backendError =
        error.response?.data;

      if (typeof backendError === "object") {
        const messages = Object.entries(backendError)
          .map(([field, message]) => {
            const text = Array.isArray(message)
              ? message.join(", ")
              : message;

            return `${field}: ${text}`;
          })
          .join(" | ");

        setError(
          messages || "Unable to create quiz."
        );
      } else {
        setError(
          "Unable to create quiz."
        );
      }

    } finally {
      setLoading(false);
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

        </nav>

      </aside>

      {/* Main */}
      <div className="lg:pl-64">

        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">

          <div className="flex min-h-20 items-center justify-between gap-4 px-6 py-4 lg:px-8">

            <div>
              <p className="text-sm text-slate-500">
                Administration / Quizzes
              </p>

              <h2 className="text-xl font-bold text-slate-800">
                Create Quiz
              </h2>
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/quizzes")}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              ← Back to Quizzes
            </button>

          </div>

        </header>

        <main className="p-6 lg:p-8">

          <div className="mx-auto max-w-5xl">

            {/* Intro */}
            <div className="mb-8">

              <h1 className="text-3xl font-bold text-slate-800">
                Create a New Quiz
              </h1>

              <p className="mt-2 text-slate-500">
                Configure your quiz details before adding questions.
              </p>

            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                <strong className="mr-1">
                  Error:
                </strong>
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Basic Information */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-6 flex items-center gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
                    📝
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Basic Information
                    </h2>

                    <p className="text-sm text-slate-500">
                      Enter the basic details of your quiz.
                    </p>
                  </div>

                </div>

                <div className="space-y-5">

                  {/* Title */}
                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Quiz Title
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Python Fundamentals"
                      required
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                  </div>

                  {/* Description */}
                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Description
                    </label>

                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Describe what students will learn or test in this quiz..."
                      className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                  </div>

                  {/* Category / Difficulty */}
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Category
                      </label>

                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        disabled={categoryLoading}
                        required
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                      >

                        <option value="">
                          {categoryLoading
                            ? "Loading categories..."
                            : "Select category"}
                        </option>

                        {categories.map((category) => (
                          <option
                            key={category.id}
                            value={category.id}
                          >
                            {category.name ||
                              category.category_name}
                          </option>
                        ))}

                      </select>

                    </div>

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Difficulty
                      </label>

                      <select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      >

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

                  </div>

                </div>

              </section>

              {/* Quiz Settings */}
              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-6 flex items-center gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-xl">
                    ⚙️
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Quiz Settings
                    </h2>

                    <p className="text-sm text-slate-500">
                      Configure timing, scoring and availability.
                    </p>
                  </div>

                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                  {/* Duration */}
                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Duration
                    </label>

                    <div className="relative">

                      <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        min="1"
                        required
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-16 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                        min
                      </span>

                    </div>

                  </div>

                  {/* Passing */}
                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Passing Percentage
                    </label>

                    <div className="relative">

                      <input
                        type="number"
                        name="passing_percentage"
                        value={formData.passing_percentage}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        required
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                        %
                      </span>

                    </div>

                  </div>

                  {/* Max attempts */}
                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Maximum Attempts
                    </label>

                    <input
                      type="number"
                      name="max_attempts"
                      value={formData.max_attempts}
                      onChange={handleChange}
                      min="1"
                      required
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                  </div>

                </div>

                {/* Status */}
                <div className="mt-5">

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Quiz Status
                  </label>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                    <StatusOption
                      value="Draft"
                      title="Draft"
                      description="Save without publishing"
                      selected={formData.status === "Draft"}
                      onClick={() =>
                        setFormData((current) => ({
                          ...current,
                          status: "Draft",
                        }))
                      }
                    />

                    <StatusOption
                      value="Published"
                      title="Published"
                      description="Available to students"
                      selected={formData.status === "Published"}
                      onClick={() =>
                        setFormData((current) => ({
                          ...current,
                          status: "Published",
                        }))
                      }
                    />

                    <StatusOption
                      value="Unpublished"
                      title="Unpublished"
                      description="Hidden from students"
                      selected={formData.status === "Unpublished"}
                      onClick={() =>
                        setFormData((current) => ({
                          ...current,
                          status: "Unpublished",
                        }))
                      }
                    />

                  </div>

                </div>

              </section>

              {/* Thumbnail */}
              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-6 flex items-center gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-100 text-xl">
                    🖼️
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Quiz Thumbnail
                    </h2>

                    <p className="text-sm text-slate-500">
                      Add an optional image for your quiz.
                    </p>
                  </div>

                </div>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50">

                  <div className="text-4xl">
                    📤
                  </div>

                  <p className="mt-3 font-semibold text-slate-700">
                    {formData.thumbnail
                      ? formData.thumbnail.name
                      : "Click to upload a thumbnail"}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    PNG, JPG or JPEG
                  </p>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />

                </label>

              </section>

              {/* Actions */}
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    navigate("/admin/quizzes")
                  }
                  disabled={loading}
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Creating Quiz..."
                    : "Create Quiz"}
                </button>

              </div>

            </form>

          </div>

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
      type="button"
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


function StatusOption({
  title,
  description,
  selected,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border-2 p-4 text-left transition ${
        selected
          ? "border-blue-500 bg-blue-50"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-center gap-3">

        <div
          className={`h-4 w-4 rounded-full border-2 ${
            selected
              ? "border-blue-600 bg-blue-600"
              : "border-slate-300"
          }`}
        />

        <span className="font-semibold text-slate-800">
          {title}
        </span>

      </div>

      <p className="mt-2 pl-7 text-xs text-slate-500">
        {description}
      </p>

    </button>
  );
}


export default CreateQuiz;