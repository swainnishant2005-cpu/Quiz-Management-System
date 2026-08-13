import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function TakeQuiz() {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);

  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const [timeLeft, setTimeLeft] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [showSubmitModal, setShowSubmitModal] =
    useState(false);

  /* =========================================
     START QUIZ
  ========================================= */

  useEffect(() => {
    startQuiz();
  }, [quizId]);

  /* =========================================
     TIMER
  ========================================= */

  useEffect(() => {
    if (timeLeft === null || submitting) {
      return;
    }

    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((current) => current - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitting]);

  /* =========================================
     START / RESUME QUIZ
  ========================================= */

  const startQuiz = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * Start or resume student's attempt.
       */
      const attemptResponse = await api.post(
        `/quizzes/${quizId}/start/`
      );

      const attemptData = attemptResponse.data;

      setAttempt(attemptData);

      /*
       * Load quiz details.
       */
      const quizResponse = await api.get(
        `/quizzes/${quizId}/`
      );

      setQuiz(quizResponse.data);

      /*
       * Load questions.
       */
      const questionsResponse = await api.get(
        `/quizzes/${quizId}/questions/`
      );

      const questionData = Array.isArray(
        questionsResponse.data
      )
        ? questionsResponse.data
        : questionsResponse.data.results || [];

      setQuestions(questionData);

      /*
       * Calculate remaining time using
       * server attempt start time.
       */
      if (attemptData.started_at) {
        const startedAt = new Date(
          attemptData.started_at
        ).getTime();

        const durationMinutes =
          Number(
            quizResponse.data.duration
          ) || 0;

        const expiry =
          startedAt +
          durationMinutes * 60 * 1000;

        const remaining = Math.max(
          0,
          Math.floor(
            (expiry - Date.now()) / 1000
          )
        );

        setTimeLeft(remaining);
      } else {
        const durationMinutes =
          Number(
            quizResponse.data.duration
          ) || 0;

        setTimeLeft(
          durationMinutes * 60
        );
      }

    } catch (error) {
      console.error(error);

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
        error.response?.data?.error ||
          error.response?.data?.detail ||
          "Unable to start the quiz."
      );

    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     SELECT ANSWER
  ========================================= */

  const selectAnswer = (
    questionId,
    optionId
  ) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: optionId,
    }));
  };

  /* =========================================
     NAVIGATION
  ========================================= */

  const goNext = () => {
    if (
      currentIndex <
      questions.length - 1
    ) {
      setCurrentIndex(
        (current) => current + 1
      );
    }
  };

  const goPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(
        (current) => current - 1
      );
    }
  };

  const goToQuestion = (index) => {
    setCurrentIndex(index);
  };

  /* =========================================
     SUBMIT QUIZ
  ========================================= */

  const submitQuiz = async () => {
    if (!attempt?.id) {
      setError(
        "Quiz attempt could not be found."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      /*
       * Backend expects:
       *
       * {
       *   "answers": [
       *     {
       *       "question_id": 1,
       *       "option_id": 5
       *     }
       *   ]
       * }
       */

      const submittedAnswers =
        Object.entries(answers).map(
          ([questionId, optionId]) => ({
            question_id:
              Number(questionId),

            option_id:
              Number(optionId),
          })
        );

      await api.post(
        `/attempts/${attempt.id}/submit/`,
        {
          answers: submittedAnswers,
        }
      );

      navigate(
        `/attempts/${attempt.id}/result`
      );

    } catch (error) {
      console.error(error);

      /*
       * If backend says time expired,
       * go to result page.
       */
      if (
        error.response?.data?.status ===
          "FAILED" ||
        error.response?.data?.error ===
          "Quiz time has expired."
      ) {
        navigate(
          `/attempts/${attempt.id}/result`
        );

        return;
      }

      setError(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          "Unable to submit quiz."
      );

    } finally {
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  /* =========================================
     AUTO SUBMIT
  ========================================= */

  const handleAutoSubmit = async () => {
    if (submitting) {
      return;
    }

    await submitQuiz();
  };

  /* =========================================
     FORMAT TIME
  ========================================= */

  const formatTime = (seconds) => {
    if (seconds === null) {
      return "--:--";
    }

    const minutes =
      Math.floor(seconds / 60);

    const remainingSeconds =
      seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  /* =========================================
     DATA
  ========================================= */

  const answeredCount =
    Object.keys(answers).length;

  const unansweredCount =
    questions.length -
    answeredCount;

  const currentQuestion =
    questions[currentIndex];

  const isLastQuestion =
    currentIndex ===
    questions.length - 1;

  const timerDanger =
    timeLeft !== null &&
    timeLeft <= 60;

  const questionProgress =
    questions.length
      ? ((currentIndex + 1) /
          questions.length) *
        100
      : 0;

  const answerProgress =
    questions.length
      ? (answeredCount /
          questions.length) *
        100
      : 0;

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">

        <div className="text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">

            <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-800">
            Preparing your quiz
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Please wait while we prepare your questions...
          </p>

        </div>

      </div>
    );
  }

  /* =========================================
     ERROR
  ========================================= */

  if (error && !currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">

        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
            ⚠️
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800">
            Unable to start quiz
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-600">
            {error}
          </p>

          <button
            onClick={() =>
              navigate("/quizzes")
            }
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            ← Back to Quizzes
          </button>

        </div>

      </div>
    );
  }

  /* =========================================
     NO QUESTIONS
  ========================================= */

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">

        <div className="text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200 text-3xl">
            📚
          </div>

          <p className="mt-5 text-slate-600">
            No questions are available.
          </p>

          <button
            onClick={() =>
              navigate("/quizzes")
            }
            className="mt-5 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
          >
            ← Back to Quizzes
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
          TOP BAR
      ===================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">

        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">

          {/* Left */}

          <div className="flex min-w-0 items-center gap-3">

            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl shadow-lg shadow-blue-500/20 sm:flex">
              🧠
            </div>

            <div className="min-w-0">

              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600 sm:text-xs">
                Quiz in Progress
              </p>

              <h1 className="truncate text-base font-bold text-slate-800 sm:text-lg">
                {quiz?.title}
              </h1>

            </div>

          </div>


          {/* Timer */}

          <div
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 sm:gap-3 sm:px-4 ${
              timerDanger
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-blue-100 bg-blue-50 text-blue-700"
            }`}
          >

            <span className="text-lg sm:text-xl">
              ⏱️
            </span>

            <div>

              <p className="hidden text-[10px] font-bold uppercase tracking-wider sm:block">
                Time Left
              </p>

              <p
                className={`font-mono text-base font-bold sm:text-lg ${
                  timerDanger
                    ? "animate-pulse"
                    : ""
                }`}
              >
                {formatTime(timeLeft)}
              </p>

            </div>

          </div>

        </div>

      </header>


      {/* =====================================
          MAIN
      ===================================== */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">

        {/* BACK TO QUIZZES */}

        <div className="mb-5">

          <button
            type="button"
            onClick={() =>
              navigate("/quizzes")
            }
            className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-x-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >

            <span className="text-lg transition-transform group-hover:-translate-x-1">
              ←
            </span>

            Back to Quizzes

          </button>

        </div>


        {/* =====================================
            QUIZ INFO
        ===================================== */}

        <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-5 text-white sm:px-6">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">
                  Question {currentIndex + 1} of{" "}
                  {questions.length}
                </p>

                <h2 className="mt-1 text-lg font-bold sm:text-xl">
                  Keep going — you've got this!
                </h2>

              </div>

              <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 backdrop-blur">

                <p className="text-xs text-blue-100">
                  Answered
                </p>

                <p className="text-lg font-bold">
                  {answeredCount} /{" "}
                  {questions.length}
                </p>

              </div>

            </div>

          </div>


          {/* Progress */}

          <div className="p-5 sm:p-6">

            <div className="flex items-center justify-between gap-3">

              <div>

                <p className="text-sm font-semibold text-slate-700">
                  Question Progress
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {answeredCount} answered •{" "}
                  {unansweredCount} remaining
                </p>

              </div>

              <span className="text-sm font-bold text-blue-600">
                {Math.round(
                  answerProgress
                )}%
              </span>

            </div>

            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600 transition-all duration-500"
                style={{
                  width: `${answerProgress}%`,
                }}
              />

            </div>

          </div>

        </section>


        {/* =====================================
            CONTENT
        ===================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">


          {/* ===================================
              QUESTION
          =================================== */}

          <section className="lg:col-span-3">

            {error && (

              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">

                <span>
                  ⚠️
                </span>

                <span>
                  {error}
                </span>

              </div>

            )}


            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              {/* Question Header */}

              <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-8">

                <div className="flex items-center justify-between gap-3">

                  <span className="rounded-full bg-blue-100 px-4 py-1.5 text-xs font-bold text-blue-700">
                    Question{" "}
                    {currentIndex + 1}
                  </span>

                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">

                    {currentQuestion.marks}{" "}

                    {Number(
                      currentQuestion.marks
                    ) === 1
                      ? "Mark"
                      : "Marks"}

                  </span>

                </div>

              </div>


              {/* Question Content */}

              <div className="p-5 sm:p-8">

                <div className="mb-8">

                  <h2 className="text-xl font-bold leading-8 text-slate-800 sm:text-2xl">
                    {currentQuestion.question_text}
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    Select one answer.
                  </p>

                </div>


                {/* OPTIONS */}

                <div className="space-y-3">

                  {(currentQuestion.options ||
                    []).map(
                    (option, index) => {

                      const selected =
                        answers[
                          currentQuestion.id
                        ] === option.id;

                      return (
                        <button
                          type="button"
                          key={option.id}
                          onClick={() =>
                            selectAnswer(
                              currentQuestion.id,
                              option.id
                            )
                          }
                          className={`quiz-option group flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left ${
                            selected
                              ? "border-blue-500 bg-blue-50 shadow-sm shadow-blue-500/10"
                              : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                          }`}
                        >

                          {/* Letter */}

                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 text-sm font-bold transition ${
                              selected
                                ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                : "border-slate-200 bg-slate-50 text-slate-600 group-hover:border-blue-400 group-hover:bg-blue-50 group-hover:text-blue-600"
                            }`}
                          >

                            {String.fromCharCode(
                              65 + index
                            )}

                          </div>


                          {/* Text */}

                          <span
                            className={`flex-1 text-sm font-medium leading-6 ${
                              selected
                                ? "text-blue-800"
                                : "text-slate-700"
                            }`}
                          >
                            {option.option_text}
                          </span>


                          {/* Check */}

                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
                              selected
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-transparent"
                            }`}
                          >
                            ✓
                          </div>

                        </button>
                      );
                    }
                  )}

                </div>


                {/* NAVIGATION */}

                <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

                  <button
                    type="button"
                    disabled={
                      currentIndex === 0
                    }
                    onClick={goPrevious}
                    className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Previous
                  </button>


                  <div className="order-first text-center sm:order-none">

                    <p className="text-xs font-medium text-slate-400">
                      Question
                    </p>

                    <p className="text-sm font-bold text-slate-700">
                      {currentIndex + 1} /{" "}
                      {questions.length}
                    </p>

                  </div>


                  {!isLastQuestion ? (

                    <button
                      type="button"
                      onClick={goNext}
                      className="group rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                    >

                      Next Question

                      <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                        →
                      </span>

                    </button>

                  ) : (

                    <button
                      type="button"
                      onClick={() =>
                        setShowSubmitModal(
                          true
                        )
                      }
                      className="rounded-xl bg-green-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition hover:-translate-y-0.5 hover:bg-green-700"
                    >
                      Submit Quiz ✓
                    </button>

                  )}

                </div>

              </div>

            </div>

          </section>


          {/* ===================================
              QUESTION NAVIGATOR
          =================================== */}

          <aside className="lg:col-span-1">

            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="font-bold text-slate-800">
                    Questions
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Navigate quickly
                  </p>

                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  ☷
                </div>

              </div>


              {/* Question numbers */}

              <div className="mt-5 grid grid-cols-5 gap-2">

                {questions.map(
                  (question, index) => {

                    const answered =
                      answers[
                        question.id
                      ] !== undefined;

                    const current =
                      index ===
                      currentIndex;

                    return (
                      <button
                        key={question.id}
                        type="button"
                        onClick={() =>
                          goToQuestion(
                            index
                          )
                        }
                        className={`flex h-10 w-full items-center justify-center rounded-lg text-xs font-bold transition ${
                          current
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 ring-4 ring-blue-100"
                            : answered
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  }
                )}

              </div>


              {/* Legend */}

              <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">

                <Legend
                  color="bg-blue-600"
                  label="Current"
                />

                <Legend
                  color="bg-green-500"
                  label="Answered"
                />

                <Legend
                  color="bg-slate-300"
                  label="Not answered"
                />

              </div>


              {/* Summary */}

              <div className="mt-6 rounded-xl bg-slate-50 p-4">

                <div className="flex items-center justify-between">

                  <span className="text-xs text-slate-500">
                    Answered
                  </span>

                  <span className="font-bold text-green-600">
                    {answeredCount}
                  </span>

                </div>

                <div className="mt-3 flex items-center justify-between">

                  <span className="text-xs text-slate-500">
                    Remaining
                  </span>

                  <span className="font-bold text-slate-700">
                    {unansweredCount}
                  </span>

                </div>

                <div className="mt-3 flex items-center justify-between">

                  <span className="text-xs text-slate-500">
                    Progress
                  </span>

                  <span className="font-bold text-blue-600">
                    {Math.round(
                      answerProgress
                    )}%
                  </span>

                </div>

              </div>

            </div>

          </aside>

        </div>

      </main>


      {/* =====================================
          SUBMIT MODAL
      ===================================== */}

      {showSubmitModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-5 backdrop-blur-sm">

          <div className="submit-modal w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              📤
            </div>

            <h2 className="mt-5 text-center text-xl font-bold text-slate-800">
              Submit Quiz?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-slate-500">
              You have answered{" "}
              <strong className="text-slate-800">
                {answeredCount}
              </strong>{" "}
              out of{" "}
              <strong className="text-slate-800">
                {questions.length}
              </strong>{" "}
              questions.
            </p>


            {unansweredCount > 0 && (

              <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-center text-sm font-medium text-yellow-700">

                ⚠️ You still have{" "}
                <strong>
                  {unansweredCount}
                </strong>{" "}
                unanswered question
                {unansweredCount === 1
                  ? ""
                  : "s"}.

              </div>

            )}


            {unansweredCount === 0 && (

              <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-center text-sm font-medium text-green-700">

                ✓ All questions have been answered.

              </div>

            )}


            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

              <button
                type="button"
                onClick={() =>
                  setShowSubmitModal(
                    false
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Continue Quiz
              </button>


              <button
                type="button"
                disabled={submitting}
                onClick={submitQuiz}
                className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Quiz"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


/* =========================================
   LEGEND
========================================= */

function Legend({
  color,
  label,
}) {
  return (
    <div className="flex items-center gap-2">

      <span
        className={`h-3 w-3 rounded-full ${color}`}
      />

      <span className="text-xs text-slate-500">
        {label}
      </span>

    </div>
  );
}


export default TakeQuiz;