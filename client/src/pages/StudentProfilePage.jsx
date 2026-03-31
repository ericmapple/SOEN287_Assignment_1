import { Link } from "react-router-dom";

import "../styles.css";

function StudentProfilePage() {
  return (
    <div className="portal-page">
      <div className="container">
        <div className="menu">
          <h2>Hello, FirstName!</h2>
          <a href="#">Home</a>
          <Link to="/student/profile">Profile</Link>
          <a href="#">Messages</a>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/student/courses">My Courses</Link>
          <Link to="/student/grades">Grades</Link>
          <a href="#">Academic</a>
          <a href="#">Help</a>
          <Link to="/">Log out</Link>
        </div>

        <div className="header1">
          <h2>FirstName LastName (StudentID)</h2>
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
            <h3>Personal Information</h3>
            <table>
              <tbody>
                <tr>
                  <td className="label">Full name</td>
                  <td>FirstName LastName</td>
                </tr>
                <tr>
                  <td className="label">Student ID</td>
                  <td>00000000</td>
                </tr>
                <tr>
                  <td className="label">Email</td>
                  <td>firstname.lastname@email.com</td>
                </tr>
                <tr>
                  <td className="label">Program</td>
                  <td>Program name</td>
                </tr>
                <tr>
                  <td className="label">Year</td>
                  <td>Year 1</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="section">
            <h3>About Me</h3>
            <p>
              Write 2–4 lines about the student (interests, goals, etc.). Keep
              it short and simple.
            </p>
          </div>

          <div className="section">
            <h3>Current Courses</h3>
            <div className="chips">
              <span>COMP 249</span>
              <span>COMP 2XX</span>
              <span>MATH 2XX</span>
              <span>Other course</span>
            </div>
          </div>

          <div className="section">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <Link to="/student/grades">View my grades</Link>
              </li>
              <li>
                <Link to="/dashboard">Go to dashboard</Link>
              </li>
              <li>
                <a href="#">Contact a teacher</a>
              </li>
            </ul>
          </div>

          <div className="section">
            <h3>My Trip Charts (optional)</h3>
            <p>
              If your project uses the generated charts, place the PNGs in the
              same folder as this HTML file.
            </p>

            <div className="chart-row">
              <img
                src="trip_cost_bar_chart.png"
                alt="Trip costs bar chart"
              />
              <img
                src="trip_duration_line_chart.png"
                alt="Trip duration line chart"
              />
            </div>

            <br />

            <img
              src="trips_per_destination_pie.png"
              alt="Trips per destination pie chart"
            />
          </div>
        </div>

        <div className="footer">
          <footer>COMP Project • Student Page</footer>
        </div>
      </div>
    </div>
  );
}


// To make the file accessible to other files
export default StudentProfilePage;