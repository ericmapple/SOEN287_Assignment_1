import { Link } from "react-router-dom";

import "../styles.css";

function StudentGradesPage() {
  return (
    <div className="portal-page">
      <div className="container">
        <div className="menu">
          <h2>Hello, FirstName!</h2>
          <a href="#">Home</a>
          <Link to="/student/profile">Profile</Link>
          <a href="#">Message</a>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/student/courses">My Courses</Link>
          <Link to="/student/grades">Grades</Link>

          <ul className="submenu">
            <li>
              <a href="#">Add New Grade</a>
            </li>
            <li>
              <a href="#">Modify Grade</a>
            </li>
          </ul>

          <a href="#">Academic</a>
          <a href="#">Help</a>
          <Link to="/">Log out</Link>
        </div>

        <div className="header1">
          <h2>GRADES - FirstName LastName [StudentID]</h2>
        </div>

        <div className="header2">
          <div>
            GPA <br />
            2.84
          </div>
        </div>

        <div className="content">
          <div className="course bg-soft-blue">
            <div className="course-header bg-light-blue">
              <h3>Class 1</h3>
              <progress value="32" max="100" className="wide-progress"></progress>
            </div>

            <table className="bg-table-blue">
              <colgroup>
                <col style={{ width: "45%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "25%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Assessment/Evaluation</th>
                  <th>Class Average</th>
                  <th>Score</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Assignment 1</td>
                  <td>6.5/10</td>
                  <td>10/10</td>
                  <td>
                    <progress value="100" max="100"></progress>
                  </td>
                </tr>
                <tr>
                  <td>Assignment 2</td>
                  <td>-/10</td>
                  <td>-/10</td>
                  <td>
                    <progress value="80" max="100"></progress>
                  </td>
                </tr>
                <tr>
                  <td>Assignment 3</td>
                  <td>-/10</td>
                  <td>-/10</td>
                  <td>
                    <progress value="27" max="100"></progress>
                  </td>
                </tr>
                <tr>
                  <td>Group Project</td>
                  <td>-/25</td>
                  <td>-/25</td>
                  <td>
                    <progress value="46" max="100"></progress>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="course bg-soft-beige">
            <div className="course-header bg-khaki">
              <h3>Class 2</h3>
              <progress value="32" max="100" className="wide-progress"></progress>
            </div>

            <table className="bg-table-beige">
              <colgroup>
                <col style={{ width: "45%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "25%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Assessment/Evaluation</th>
                  <th>Class Average</th>
                  <th>Score</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Assignment 1</td>
                  <td>6.5/10</td>
                  <td>10/10</td>
                  <td>
                    <progress value="100" max="100"></progress>
                  </td>
                </tr>
                <tr>
                  <td>Assignment 2</td>
                  <td>-/10</td>
                  <td>-/10</td>
                  <td>
                    <progress value="80" max="100"></progress>
                  </td>
                </tr>
                <tr>
                  <td>Assignment 3</td>
                  <td>-/10</td>
                  <td>-/10</td>
                  <td>
                    <progress value="27" max="100"></progress>
                  </td>
                </tr>
                <tr>
                  <td>Group Project</td>
                  <td>-/25</td>
                  <td>-/25</td>
                  <td>
                    <progress value="46" max="100"></progress>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="course bg-soft-orange">
            <div className="course-header bg-orange">
              <h3>Class 3</h3>
              <progress value="32" max="100" className="wide-progress"></progress>
            </div>

            <table className="bg-table-orange">
              <colgroup>
                <col style={{ width: "45%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "25%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Assessment/Evaluation</th>
                  <th>Class Average</th>
                  <th>Score</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Assignment 1</td>
                  <td>6.5/10</td>
                  <td>10/10</td>
                  <td>
                    <progress value="100" max="100"></progress>
                  </td>
                </tr>
                <tr>
                  <td>Assignment 2</td>
                  <td>-/10</td>
                  <td>-/10</td>
                  <td>
                    <progress value="80" max="100"></progress>
                  </td>
                </tr>
                <tr>
                  <td>Assignment 3</td>
                  <td>-/10</td>
                  <td>-/10</td>
                  <td>
                    <progress value="27" max="100"></progress>
                  </td>
                </tr>
                <tr>
                  <td>Group Project</td>
                  <td>-/25</td>
                  <td>-/25</td>
                  <td>
                    <progress value="46" max="100"></progress>
                  </td>
                </tr>
              </tbody>
            </table>
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
export default StudentGradesPage;