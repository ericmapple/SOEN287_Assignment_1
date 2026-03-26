import { Routes, Route, Link } from "react-router-dom";

import "./styles.css";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import StudentCoursesPage from "./pages/StudentCoursesPage";
import StudentGradesPage from "./pages/StudentGradesPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import TeacherCoursesPage from "./pages/TeacherCoursesPage";
import TeacherGradesPage from "./pages/TeacherGradesPage";
import TeacherProfilePage from "./pages/TeacherProfilePage";

function App() {
  return (

    <div>
      <nav>
        <Link to="/">Login</Link> |{" "}
        <Link to="/dashboard">Dashboard</Link> |{" "}
        <Link to="/student/courses">Student Courses</Link> |{" "}
        <Link to="/student/grades">Student Grades</Link> |{" "}
        <Link to="/student/profile">Student Profile</Link> |{" "}
        <Link to="/teacher/courses">Teacher Courses</Link> |{" "}
        <Link to="/teacher/grades">Teacher Grades</Link> |{" "}
        <Link to="/teacher/profile">Teacher Profile</Link>
      </nav>

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/student/courses" element={<StudentCoursesPage />} />
        <Route path="/student/grades" element={<StudentGradesPage />} />
        <Route path="/student/profile" element={<StudentProfilePage />} />
        <Route path="/teacher/courses" element={<TeacherCoursesPage />} />
        <Route path="/teacher/grades" element={<TeacherGradesPage />} />
        <Route path="/teacher/profile" element={<TeacherProfilePage />} />
      </Routes>
    </div>
  );
}

export default App;