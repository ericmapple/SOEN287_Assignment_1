import { Link } from "react-router-dom";

import "../styles.css";

function TeacherProfilePage() {
  return (
    <div className="portal-page">
      <div className="container">
        <div className="menu">
          <h2>Hello, ProfName!</h2>
          <a href="#">Home</a>
          <Link to="/teacher/profile">Profile</Link>
          <a href="#">Messages</a>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/teacher/courses">My Courses</Link>
          <Link to="/teacher/grades">Grades (Teacher)</Link>
          <a href="#">Help</a>
          <Link to="/">Log out</Link>
        </div>

        <div className="header1">
          <h2>Prof. FirstName LastName (TeacherID)</h2>
        </div>

        <div className="header2">
          <div>
            <strong>Photo</strong>
            <br />
            <small>(optional)</small>
          </div>
        </div>

        <div className="content">
          <div className="section">
            <h3>Teacher Information</h3>
            <table>
              <tbody>
                <tr>
                  <td className="label">Full name</td>
                  <td>Prof. FirstName LastName</td>
                </tr>
                <tr>
                  <td className="label">Teacher ID</td>
                  <td>T0000</td>
                </tr>
                <tr>
                  <td className="label">Email</td>
                  <td>prof.lastname@email.com</td>
                </tr>
                <tr>
                  <td className="label">Office</td>
                  <td>Room X-000</td>
                </tr>
                <tr>
                  <td className="label">Office hours</td>
                  <td>Mon 2–4pm, Thu 10–11am (example)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="section">
            <h3>About</h3>
            <p>
              2–4 lines: teaching interests, research topics, what students
              should know, etc.
            </p>
          </div>

          <div className="section">
            <h3>Courses Taught</h3>
            <ul className="course-list">
              <li>
                <strong>COMP 249</strong> — Object-Oriented Programming II
              </li>
              <li>
                <strong>COMP 2XX</strong> — Another course
              </li>
              <li>
                <strong>COMP 3XX</strong> — Another course
              </li>
            </ul>
          </div>

          <div className="section">
            <h3>Quick Actions</h3>
            <ul>
              <li>
                <Link to="/teacher/grades">Manage grades</Link>
              </li>
              <li>
                <a href="#">Send a message to students</a>
              </li>
              <li>
                <Link to="/dashboard">Go to dashboard</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer">
          <footer>COMP Project • Teacher Page</footer>
        </div>
      </div>
    </div>
  );
}

// To make the file accessible to other files
export default TeacherProfilePage;