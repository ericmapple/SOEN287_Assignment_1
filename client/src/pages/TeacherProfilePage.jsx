import { useEffect, useState } from "react";

import { fetchTeacherCourses, fetchTeacherStats, fetchTeacherTemplates } from "../api";
import PageLayout from "../components/PageLayout";
import { teacherNavItems } from "../navigation";
import { formatPercent } from "../utils";

function TeacherProfilePage(props) {
  const { currentUser, onLogout } = props;
  const [courses, setCourses] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(
    function () {
      let ignore = false;

      async function loadProfileData() {
        try {
          const [coursesData, templatesData, statsData] = await Promise.all([
            fetchTeacherCourses(currentUser.id),
            fetchTeacherTemplates(currentUser.id),
            fetchTeacherStats(currentUser.id),
          ]);

          if (!ignore) {
            setCourses(coursesData);
            setTemplates(templatesData);
            setStats(statsData);
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
      subtitle="Teacher information"
      navItems={teacherNavItems}
      onLogout={onLogout}
      pageClassName="portal-page"
      headerBadge={
        <div>
          <span className="badge-label">Templates</span>
          <strong>{templates.length}</strong>
        </div>
      }
      menuExtra={
        <div>
          <h3>Teaching Summary</h3>
          <p>Connected to the same data used by the teacher dashboard and gradebook.</p>
        </div>
      }
    >
      {error ? <p className="status-message error-message">{error}</p> : null}

      <div className="content-grid">
        <section className="card">
          <div className="card-header">
            <h2>Account Information</h2>
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
            <h2>Teaching Metrics</h2>
          </div>

          <div className="stats-grid">
            <article className="status-card">
              <span>Courses</span>
              <strong>{courses.length}</strong>
            </article>
            <article className="status-card">
              <span>Student Sections</span>
              <strong>{stats?.totalRelatedStudentCourses || 0}</strong>
            </article>
            <article className="status-card">
              <span>Completion</span>
              <strong>{formatPercent(stats?.completionPercentage || 0)}</strong>
            </article>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

export default TeacherProfilePage;
