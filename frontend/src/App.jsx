import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

/* =========================================
   AUTH
========================================= */

import Login from "./pages/login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";


/* =========================================
   STUDENT
========================================= */

import Dashboard from "./pages/StudentDashboard";
import StudentQuizzes from "./pages/StudentQuizzes";
import QuizDetails from "./pages/QuizDetails";
import TakeQuiz from "./pages/TakeQuiz";
import QuizResult from "./pages/QuizResult";
import AnswerReview from "./pages/AnswerReview";
import AttemptHistory from "./pages/AttemptHistory";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";


/* =========================================
   ADMIN
========================================= */

import AdminDashboard from "./pages/AdminDashboard";
import AdminQuizzes from "./pages/AdminQuizzes";
import CreateQuiz from "./pages/CreateQuiz";
import EditQuiz from "./pages/EditQuiz";
import AdminQuestions from "./pages/AdminQuestions";
import CreateQuestion from "./pages/CreateQuestion";
import EditQuestion from "./pages/EditQuestion";
import AdminQuestionList from "./pages/AdminQuestionList";
import AdminAttempts from "./pages/AdminAttempts";
import AdminStudents from "./pages/AdminStudents";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminLeaderboard from "./pages/AdminLeaderboard";


/* =========================================
   LAYOUT
========================================= */

import StudentLayout from "./layouts/StudentLayout";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =====================================
            AUTHENTICATION
        ===================================== */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />


        {/* =====================================
            STUDENT DASHBOARD
        ===================================== */}

        <Route
          path="/dashboard"
          element={
            <StudentLayout>
              <Dashboard />
            </StudentLayout>
          }
        />


        {/* =====================================
            STUDENT QUIZZES
        ===================================== */}

        <Route
          path="/student/quizzes"
          element={
            <StudentLayout>
              <StudentQuizzes />
            </StudentLayout>
          }
        />

        <Route
          path="/quizzes/:quizId"
          element={
            <StudentLayout>
              <QuizDetails />
            </StudentLayout>
          }
        />

        <Route
          path="/quizzes/:quizId/start"
          element={
            <StudentLayout>
              <TakeQuiz />
            </StudentLayout>
          }
        />


        {/* =====================================
            QUIZ RESULT
        ===================================== */}

        <Route
          path="/attempts/:attemptId/result"
          element={
            <StudentLayout>
              <QuizResult />
            </StudentLayout>
          }
        />

        <Route
          path="/attempts/:attemptId/review"
          element={
            <StudentLayout>
              <AnswerReview />
            </StudentLayout>
          }
        />


        {/* =====================================
            STUDENT HISTORY
        ===================================== */}

        <Route
          path="/history"
          element={
            <StudentLayout>
              <AttemptHistory />
            </StudentLayout>
          }
        />


        {/* =====================================
            STUDENT LEADERBOARD
        ===================================== */}

        <Route
          path="/leaderboard"
          element={
            <StudentLayout>
              <Leaderboard />
            </StudentLayout>
          }
        />


        {/* =====================================
            STUDENT PROFILE
        ===================================== */}

        <Route
          path="/profile"
          element={
            <StudentLayout>
              <Profile />
            </StudentLayout>
          }
        />


        {/* =====================================
            ADMIN DASHBOARD
        ===================================== */}

        <Route
          path="/admin"
          element={
            <AdminDashboard />
          }
        />


        {/* =====================================
            ADMIN QUIZZES
        ===================================== */}

        <Route
          path="/admin/quizzes"
          element={
            <AdminQuizzes />
          }
        />

        <Route
          path="/admin/quizzes/create"
          element={
            <CreateQuiz />
          }
        />

        <Route
          path="/admin/quizzes/:quizId/edit"
          element={
            <EditQuiz />
          }
        />


        {/* =====================================
            ADMIN QUESTIONS
        ===================================== */}

        <Route
          path="/admin/quizzes/:quizId/questions"
          element={
            <AdminQuestions />
          }
        />

        <Route
          path="/admin/quizzes/:quizId/questions/create"
          element={
            <CreateQuestion />
          }
        />

        <Route
          path="/admin/questions/:questionId/edit"
          element={
            <EditQuestion />
          }
        />
        <Route
          path="/admin/questions"
          element={
            <AdminQuestionList />
          }
        />
        <Route
          path="/admin/attempts"
          element={<AdminAttempts />}
        />
        <Route
          path="/admin/students"
          element={<AdminStudents />}
        />
        <Route
          path="/admin/analytics"
          element={<AdminAnalytics />}
        />
        <Route
          path="/admin/leaderboard"
          element={<AdminLeaderboard />}
        />
      </Routes>

    </BrowserRouter>
  );
}

export default App;