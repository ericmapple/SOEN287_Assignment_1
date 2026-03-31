import { Link } from "react-router-dom";

import "../styles.css";

function TeacherCoursesPage() {
  return (
    <div className="course-page">
      <div className="container">
        <div className="menu">
          <h2>Hello, FirstName!</h2>
          <a href="#">Home</a>
          <Link to="/teacher/profile">Profile</Link>
          <a href="#">Message</a>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/teacher/courses">My Courses</Link>

          <ul className="submenu">
            <li>
              <a href="#">[Course]</a>
            </li>
            <li>
              <a href="#">[Course]</a>
            </li>
          </ul>

          <Link to="/teacher/grades">Grades</Link>
          <a href="#">Academic</a>
          <a href="#">Help</a>
          <Link to="/">Log out</Link>
        </div>

        <div className="header1 bg-light-blue">
          <h2>[COURSE NAME]-[SECTION] (Instructor)</h2>
        </div>

        <div className="content">
          <div className="link-row">
            <a href="#">Course</a> | <a href="#">Grades</a> |{" "}
            <a href="#">Participants</a> || <a href="#">Edit | Delete</a> (links
            tba later)
          </div>

          <div className="course bg-soft-blue">
            <p>
              Hello students, welcome to [course]. <br />
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Expedita
              nobis placeat in ad esse voluptates reprehenderit ex obcaecati
              sint tempora recusandae nostrum fugiat, fugit minima quidem,
              nesciunt minus nisi aspernatur quaerat quos, enim magnam
              dignissimos aut.
            </p>

            <div className="course-header bg-light-blue">
              <h2>Announcements</h2>
              <a href="#">Edit | Delete</a>
            </div>

            <div>
              <p>Latest:</p>
              <h4>Exam date change [dd/mm/yyyy]</h4>
              <p>
                Moved from May 1st to April 23rd! Please remember to bring your
                cheat sheet.
              </p>
            </div>

            <a href="#">Older announcements</a>

            <p></p>

            <div className="course-header bg-light-blue">
              <h2>Assessments</h2>
              <a href="#">Edit | Delete</a>
            </div>

            <div>
              <h4>Assignment 1 (30 points)</h4>
              <p>Due date: dd/mm/yyyy</p>
              <p>Submitted in class.</p>
              <p>
                (assessment info). Lorem ipsum, dolor sit amet consectetur
                adipisicing elit. Expedita nobis placeat in ad esse voluptates
                reprehenderit ex obcaecati sint tempora recusandae nostrum
                fugiat, fugit minima quidem, nesciunt minus nisi aspernatur
                quaerat quos.
              </p>
              <h4>
                Rubric: Efficiency /5 Design /10 Presentation /10 Functionality
                /5 Total /30
              </h4>
            </div>

            <a href="#">{">>"} Other assessments</a>{" "}
            <span className="text-alert">
              !! One assessment past due [dd/mm/yyyy hh/min]:{" "}
              <a href="#">"Introductions"</a> !!
            </span>

            <p></p>

            <div className="course-header bg-light-blue">
              <h2>Week 1</h2>
              <a href="#">Edit | Delete</a>
            </div>

            <div>
              <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
              <p>See file below for course outline.</p>
              <p>[file]</p>
            </div>
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
export default TeacherCoursesPage;