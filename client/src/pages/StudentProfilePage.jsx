import { useEffect, useState } from "react";

import { fetchStudentCourses } from "../api";
import PageLayout from "../components/PageLayout";
import { studentNavItems } from "../navigation";

function StudentProfilePage(props) {
  const { currentUser, onLogout } = props;
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  useEffect(
    function () {
      let ignore = false;

      async function loadProfileData() {
        try {
          const coursesData = await fetchStudentCourses(currentUser.id);

          if (!ignore) {
            setCourses(coursesData);
          }
        } catch (loadError) {
          if (!ignore) {
            setError(loadError.message);
          }
        }
      }

      loadProfileData();

      return function () {
        ignore = true;
      };
    },
    [currentUser.id]
  );

  return (
    <PageLayout
      currentUser={currentUser}
      title="Profile"
      subtitle="Student information"
      navItems={studentNavItems}
      onLogout={onLogout}
      pageClassName="portal-page"
      headerBadge={
        <div>
          <span className="badge-label">Course Load</span>
          <strong>{courses.length}</strong>
        </div>
      }
      menuExtra={
        <div>
          <h3>Account</h3>
          <p>Your name and email come from the backend user data.</p>
        </div>
      }
    >
      {error ? <p className="status-message error-message">{error}</p> : null}

      <div className="content-grid">
        <section className="card">
          <div className="card-header">
            <h2>Personal Information</h2>
          </div>

          <table className="info-table">
            <tbody>
              <tr>
                <td>Name</td>
                <td>{currentUser.name}</td>
              </tr>
              <tr>
                <td>Email</td>
                <td>{currentUser.email}</td>
              </tr>
              <tr>
                <td>User ID</td>
                <td>{currentUser.id}</td>
              </tr>
              <tr>
                <td>Role</td>
                <td>{currentUser.role}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="card">
          <div className="card-header">
            <h2>Current Courses</h2>
            <p>Loaded from the student course endpoint</p>
          </div>

          <div className="chips">
            {courses.length === 0 ? (
              <p className="empty-state">No courses saved yet.</p>
            ) : (
              courses.map(function (course) {
                return <span key={course.id}>{course.code}</span>;
              })
            )}
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

export default StudentProfilePage;
