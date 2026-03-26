import { Link } from "react-router-dom";

import "../styles.css";

function TeacherGradesPage() {
  return (
    <div className="portal-page">
      <div className="container">
        <div className="menu">
          <h2>Hello, FirstName!</h2>
          <a href="#">Home</a>
          <Link to="/teacher/profile">Profile</Link>
          <a href="#">Message</a>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/teacher/courses">My Courses</Link>
          <Link to="/teacher/grades">Grades</Link>

          <ul className="submenu">
            <li>
              <a href="#">Add New Assessment</a>
            </li>
            <li>
              <a href="#">Modify Assessment</a>
            </li>
          </ul>

          <a href="#">Academic</a>
          <a href="#">Help</a>
          <Link to="/">Log out</Link>
        </div>

        <div className="header1 bg-light-blue">
          <h2>GRADES - Class 1</h2>
        </div>

        <div className="header2">
          <div>
            AVG
            <br />
            100%
          </div>
        </div>

        <div className="content">
          <div className="course bg-soft-blue">
            <div className="course-header bg-light-blue">
              <h3>Student Details</h3>
              <p>Average Score: 100%</p>
            </div>

            <table className="bg-table-blue spaced-bottom">
              <colgroup>
                <col style={{ width: "25%" }} />
                <col style={{ width: "25%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "15%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Score</th>
                  <th>GPA</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Name</td>
                  <td>1234567</td>
                  <td>-/10</td>
                  <td>3.00</td>
                </tr>
                <tr>
                  <td>Name</td>
                  <td>1234567</td>
                  <td>-/10</td>
                  <td>3.00</td>
                </tr>
                <tr>
                  <td>Name</td>
                  <td>1234567</td>
                  <td>-/10</td>
                  <td>3.00</td>
                </tr>
                <tr>
                  <td>Name</td>
                  <td>1234567</td>
                  <td>-/10</td>
                  <td>3.00</td>
                </tr>
                <tr>
                  <td>...</td>
                  <td>...</td>
                  <td>...</td>
                  <td>...</td>
                </tr>
              </tbody>
            </table>

            <div className="course-header bg-light-blue">
              <h4>Assignment 1</h4>
              <p>Average Score: 100%</p>
            </div>

            <table className="bg-table-blue spaced-bottom">
              <colgroup>
                <col style={{ width: "25%" }} />
                <col style={{ width: "25%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "15%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Score</th>
                  <th>GPA</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Name</td>
                  <td>1234567</td>
                  <td>-/10</td>
                  <td>3.00</td>
                </tr>
                <tr>
                  <td>Name</td>
                  <td>1234567</td>
                  <td>-/10</td>
                  <td>3.00</td>
                </tr>
                <tr>
                  <td>Name</td>
                  <td>1234567</td>
                  <td>-/10</td>
                  <td>3.00</td>
                </tr>
                <tr>
                  <td>Name</td>
                  <td>1234567</td>
                  <td>-/10</td>
                  <td>3.00</td>
                </tr>
                <tr>
                  <td>...</td>
                  <td>...</td>
                  <td>...</td>
                  <td>...</td>
                </tr>
              </tbody>
            </table>

            <h4>....[more assessments/evaluations would be here]</h4>
          </div>
        </div>

        <div className="footer">
          <footer>footer</footer>
        </div>
      </div>
    </div>
  );
}

// To make the file accessible to other files
export default TeacherGradesPage;