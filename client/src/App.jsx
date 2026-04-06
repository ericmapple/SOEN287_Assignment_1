import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { fetchCurrentUser } from "./api";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import StudentCoursesPage from "./pages/StudentCoursesPage";
import StudentGradesPage from "./pages/StudentGradesPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import TeacherCoursesPage from "./pages/TeacherCoursesPage";
import TeacherGradesPage from "./pages/TeacherGradesPage";
import TeacherProfilePage from "./pages/TeacherProfilePage";

function getStoredUser() {
  const savedUser = localStorage.getItem("cmsUser");

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch {
    localStorage.removeItem("cmsUser");
    return null;
  }
}

function ProtectedRoute(props) {
  const { currentUser, allowedRoles, children } = props;

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const [currentUser, setCurrentUser] = useState(getStoredUser);

  function handleLogin(user) {
    setCurrentUser(user);
    localStorage.setItem("cmsUser", JSON.stringify(user));
  }

  function handleLogout() {
    setCurrentUser(null);
    localStorage.removeItem("cmsUser");
  }

  useEffect(function () {
    if (!currentUser?.id) {
      return undefined;
    }

    let ignore = false;

    async function validateStoredUser() {
      try {
        const data = await fetchCurrentUser(currentUser.id);

        if (!ignore) {
          setCurrentUser(data.user);
          localStorage.setItem("cmsUser", JSON.stringify(data.user));
        }
      } catch {
        if (!ignore) {
          handleLogout();
        }
      }
    }

    validateStoredUser();

    return function () {
      ignore = true;
    };
  }, [currentUser?.id]);

  return (
    <Routes>
      <Route
        path="/"
        element={<LoginPage currentUser={currentUser} onLogin={handleLogin} />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute currentUser={currentUser}>
            <DashboardPage currentUser={currentUser} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/courses"
        element={
          <ProtectedRoute currentUser={currentUser} allowedRoles={["student"]}>
            <StudentCoursesPage currentUser={currentUser} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/grades"
        element={
          <ProtectedRoute currentUser={currentUser} allowedRoles={["student"]}>
            <StudentGradesPage currentUser={currentUser} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/profile"
        element={
          <ProtectedRoute currentUser={currentUser} allowedRoles={["student"]}>
            <StudentProfilePage currentUser={currentUser} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/courses"
        element={
          <ProtectedRoute currentUser={currentUser} allowedRoles={["teacher"]}>
            <TeacherCoursesPage currentUser={currentUser} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/grades"
        element={
          <ProtectedRoute currentUser={currentUser} allowedRoles={["teacher"]}>
            <TeacherGradesPage currentUser={currentUser} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/profile"
        element={
          <ProtectedRoute currentUser={currentUser} allowedRoles={["teacher"]}>
            <TeacherProfilePage currentUser={currentUser} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to={currentUser ? "/dashboard" : "/"} replace />}
      />
    </Routes>
  );
}

export default App;
