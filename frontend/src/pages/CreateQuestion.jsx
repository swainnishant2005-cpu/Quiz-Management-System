import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function CreateQuestion() {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const [formData, setFormData] = useState({
    question_text: "",
    explanation: "",
    marks: 1,
    difficulty: "Easy",
  });

  const [options, setOptions] = useState([
    { option_text: "", is_correct: true },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    const emptyOption = options.find(
      (option) => !option.option_text.trim()
    );

    if (emptyOption) {
      setError("Please fill in all four options.");
      return;
    }

    const correctOption = options.find(
      (option) => option.is_correct
    );

    if (!correctOption) {
      setError("Please select the correct answer.");
      return;
    }

    setLoading(true);

    try {
      /*
       * Step 1:
       * Create the question.
       */
      await api.post(
        `/quizzes/${quizId}/questions/`,
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
      navigate(
        `/admin/quizzes/${quizId}/questions`
      );

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
          messages || "Unable to create question."
        );
      } else {
        setError(
          "Unable to create question."
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
            onClick={() =>
              navigate("/admin/quizzes")
            }
          />

          <SidebarButton
            icon="❓"
            label="Questions"
            active
            onClick={() =>
              navigate(
                `/admin/quizzes/${quizId}/questions`
              )
            }
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
                Add Question
              </h2>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/admin/quizzes/${quizId}/questions`
                )
              }
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              ← Back to Questions
            </button>

          </div>

        </header>

        <main className="p-6 lg:p-8">

          <div className="mx-auto max-w-4xl">

            {/* Introduction */}
            <div className="mb-8">

              <h1 className="text-3xl font-bold text-slate-800">
                Create Question
              </h1>

              <p className="mt-2 text-slate-500">
                Add a question and four answer options to this quiz.
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
                      Write the question and configure its difficulty.
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
                    placeholder="Enter your question here..."
                    required
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* Marks + Difficulty */}
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

                <div className="mb-6">

                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl">
                      ✅
                    </div>

                    <div>

                      <h2 className="text-lg font-bold text-slate-800">
                        Answer Options
                      </h2>

                      <p className="text-sm text-slate-500">
                        Enter four options and select the correct answer.
                      </p>

                    </div>

                  </div>

                </div>

                <div className="space-y-4">

                  {options.map(
                    (option, index) => (

                      <div
                        key={index}
                        className={`rounded-xl border-2 p-4 transition ${option.is_correct
                            ? "border-green-400 bg-green-50"
                            : "border-slate-200 bg-slate-50"
                          }`}
                      >

                        <div className="flex items-center gap-4">

                          {/* Correct selector */}
                          <button
                            type="button"
                            onClick={() =>
                              selectCorrectOption(index)
                            }
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-bold transition ${option.is_correct
                                ? "border-green-500 bg-green-500 text-white"
                                : "border-slate-300 bg-white text-slate-500 hover:border-green-400"
                              }`}
                            title="Mark as correct answer"
                          >
                            {String.fromCharCode(
                              65 + index
                            )}
                          </button>

                          {/* Input */}
                          <input
                            type="text"
                            value={option.option_text}
                            onChange={(e) =>
                              handleOptionChange(
                                index,
                                e.target.value
                              )
                            }
                            placeholder={`Option ${String.fromCharCode(
                              65 + index
                            )}`}
                            required
                            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          />

                          {/* Correct label */}
                          {option.is_correct && (

                            <span className="hidden rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 sm:block">
                              Correct
                            </span>

                          )}

                        </div>

                      </div>

                    )
                  )}

                </div>

                <div className="mt-5 rounded-xl bg-blue-50 p-4">

                  <p className="text-sm text-blue-700">
                    💡 Click the letter of an option to mark it as the correct answer.
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
                      Optionally explain why the correct answer is right.
                    </p>

                  </div>

                </div>

                <textarea
                  name="explanation"
                  value={formData.explanation}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Explain the correct answer..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

              </section>

              {/* Actions */}
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/admin/quizzes/${quizId}/questions`
                    )
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
                    ? "Saving Question..."
                    : "Save Question"}
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
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}


export default CreateQuestion;