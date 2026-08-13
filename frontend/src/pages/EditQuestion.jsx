import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function EditQuestion() {
  const navigate = useNavigate();
  const { questionId, quizId } = useParams();

  const [formData, setFormData] = useState({
    question_text: "",
    explanation: "",
    marks: 1,
    difficulty: "Easy",
  });

  const [options, setOptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuestion();
  }, [questionId]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/questions/${questionId}/`
      );

      const question = response.data;

      setFormData({
        question_text: question.question_text || "",
        explanation: question.explanation || "",
        marks: question.marks || 1,
        difficulty: question.difficulty || "Easy",
      });

      setOptions(
        (question.options || []).map((option) => ({
          id: option.id,
          option_text: option.option_text || "",
          is_correct: option.is_correct || false,
        }))
      );

    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "Unable to load question."
      );

    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleOptionChange = (index, value) => {
    setOptions((current) =>
      current.map((option, i) =>
        i === index
          ? {
              ...option,
              option_text: value,
            }
          : option
      )
    );
  };

  const selectCorrectOption = (index) => {
    setOptions((current) =>
      current.map((option, i) => ({
        ...option,
        is_correct: i === index,
      }))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.question_text.trim()) {
      setError("Question text is required.");
      return;
    }

    if (options.length === 0) {
      setError("This question has no options.");
      return;
    }

    const emptyOption = options.find(
      (option) => !option.option_text.trim()
    );

    if (emptyOption) {
      setError("Please fill in all options.");
      return;
    }

    const correctOption = options.find(
      (option) => option.is_correct
    );

    if (!correctOption) {
      setError("Please select the correct answer.");
      return;
    }

    setSaving(true);

    try {
      /*
       * Update the question and options together.
       */
      await api.patch(
        `/questions/${questionId}/`,
        {
          question_text: formData.question_text,
          explanation: formData.explanation,
          marks: Number(formData.marks),
          difficulty: formData.difficulty,
          options: options.map((option) => ({
            option_text: option.option_text,
            is_correct: option.is_correct,
          })),
        }
      );

      /*
       * Return to the question list.
       */
      if (quizId) {
        navigate(
          `/admin/quizzes/${quizId}/questions`
        );
      } else {
        navigate(-1);
      }

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
          messages || "Unable to update question."
        );
      } else {
        setError(
          "Unable to update question."
        );
      }

    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading question...
          </p>

        </div>

      </div>
    );
  }

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
            onClick={() =>
              navigate("/admin/quizzes")
            }
          />

          <SidebarButton
            icon="❓"
            label="Questions"
            active
            onClick={() => {
              if (quizId) {
                navigate(
                  `/admin/quizzes/${quizId}/questions`
                );
              }
            }}
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

        </nav>

      </aside>

      {/* Main */}
      <div className="lg:pl-64">

        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">

          <div className="flex min-h-20 items-center justify-between gap-4 px-6 py-4 lg:px-8">

            <div>

              <p className="text-sm text-slate-500">
                Administration / Questions
              </p>

              <h2 className="text-xl font-bold text-slate-800">
                Edit Question
              </h2>

            </div>

            <button
              type="button"
              onClick={() => {
                if (quizId) {
                  navigate(
                    `/admin/quizzes/${quizId}/questions`
                  );
                } else {
                  navigate(-1);
                }
              }}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              ← Back
            </button>

          </div>

        </header>

        <main className="p-6 lg:p-8">

          <div className="mx-auto max-w-4xl">

            {/* Heading */}
            <div className="mb-8">

              <h1 className="text-3xl font-bold text-slate-800">
                Edit Question
              </h1>

              <p className="mt-2 text-slate-500">
                Update the question, answer options and explanation.
              </p>

            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                <strong className="mr-1">
                  Error:
                </strong>

                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Question Details */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-6 flex items-center gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
                    ❓
                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-slate-800">
                      Question Details
                    </h2>

                    <p className="text-sm text-slate-500">
                      Modify the question information.
                    </p>

                  </div>

                </div>

                {/* Question */}
                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Question
                  </label>

                  <textarea
                    name="question_text"
                    value={formData.question_text}
                    onChange={handleChange}
                    rows="5"
                    required
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* Marks / Difficulty */}
                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Marks
                    </label>

                    <input
                      type="number"
                      name="marks"
                      value={formData.marks}
                      onChange={handleChange}
                      min="1"
                      required
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

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

              </section>

              {/* Options */}
              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-6 flex items-center gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl">
                    ✅
                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-slate-800">
                      Answer Options
                    </h2>

                    <p className="text-sm text-slate-500">
                      Update the choices and select the correct answer.
                    </p>

                  </div>

                </div>

                <div className="space-y-4">

                  {options.map((option, index) => (

                    <div
                      key={option.id || index}
                      className={`rounded-xl border-2 p-4 transition ${
                        option.is_correct
                          ? "border-green-400 bg-green-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >

                      <div className="flex items-center gap-4">

                        <button
                          type="button"
                          onClick={() =>
                            selectCorrectOption(index)
                          }
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-bold transition ${
                            option.is_correct
                              ? "border-green-500 bg-green-500 text-white"
                              : "border-slate-300 bg-white text-slate-500 hover:border-green-400"
                          }`}
                        >
                          {String.fromCharCode(
                            65 + index
                          )}
                        </button>

                        <input
                          type="text"
                          value={option.option_text}
                          onChange={(e) =>
                            handleOptionChange(
                              index,
                              e.target.value
                            )
                          }
                          required
                          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />

                        {option.is_correct && (
                          <span className="hidden rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 sm:block">
                            Correct
                          </span>
                        )}

                      </div>

                    </div>

                  ))}

                </div>

                <div className="mt-5 rounded-xl bg-blue-50 p-4">

                  <p className="text-sm text-blue-700">
                    💡 Click an option letter to make that option the correct answer.
                  </p>

                </div>

              </section>

              {/* Explanation */}
              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-5 flex items-center gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 text-xl">
                    💡
                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-slate-800">
                      Explanation
                    </h2>

                    <p className="text-sm text-slate-500">
                      Explain the correct answer.
                    </p>

                  </div>

                </div>

                <textarea
                  name="explanation"
                  value={formData.explanation}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Explain why the correct answer is right..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

              </section>

              {/* Buttons */}
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    if (quizId) {
                      navigate(
                        `/admin/quizzes/${quizId}/questions`
                      );
                    } else {
                      navigate(-1);
                    }
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving Changes..."
                    : "Save Changes"}
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


export default EditQuestion;