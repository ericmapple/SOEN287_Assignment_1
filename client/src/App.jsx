import { Routes, Route, Link } from 'react-router-dom';

// import pages
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import StudentCoursesPage from "./pages/StudentCoursesPage";
import StudentGradesPage from "./pages/StudentGradesPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import TeacherCoursesPage from "./pages/TeacherCoursesPage";
import TeacherGradesPage from "./pages/TeacherGradesPage";
import TeacherProfilePage from "./pages/TeacherProfilePage";

function App(){
    <div>
        {/* Navigation */}
        <nav>
            <Link to="/">LoginPage</Link> |{" "}
            <Link to="/dashboard">DashboardPage</Link>
            <Link to="/student/courses">StudentCoursesPage</Link>
            <Link to="/student/grades">StudentGradesPage</Link>
            <Link to="/student/profile">StudentProfilePage</Link>
            <Link to="/teacher/courses">TeacherCoursesPage</Link>
            <Link to="/teacher/grades">TeacherGradesPage</Link>
            <Link to="/teacher/profile">TeacherProfilePage</Link>
        </nav>

       {/* Routing */}
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
}
export default App;