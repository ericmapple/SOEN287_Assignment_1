import { useEffect, useState } from "react";

import {
  fetchStudentDashboard,
  fetchTeacherCourses,
  fetchTeacherStats,
  fetchTeacherTemplates,
} from "../api";
import PageLayout from "../components/PageLayout";
import { studentNavItems, teacherNavItems } from "../navigation";
import { formatDate, formatPercent } from "../utils";

function DashboardPage(props) {
  const { currentUser, onLogout } = props;
  const [studentDashboard, setStudentDashboard] = useState(null);
  const [teacherDashboard, setTeacherDashboard] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(
    function () {
      let ignore = false;

      async function loadDashboard() {
        setLoading(true);
        setError("");

        try {
          if (currentUser.role === "student") {
            const data = await fetchStudentDashboard(currentUser.id);

            if (!ignore) {
              setStudentDashboard(data);
            }
          } else {
            const [stats, courses, templates] = await Promise.all([
              fetchTeacherStats(currentUser.id),
              fetchTeacherCourses(currentUser.id),
              fetchTeacherTemplates(currentUser.id),
            ]);

            if (!ignore) {
              setTeacherDashboard({
                stats,
                courses,
                templates,
              });
            }
          }
        } catch (loadError) {
          if (!ignore) {
            setError(loadError.message);
          }
        } finally {
          if (!ignore) {
            setLoading(false);
          }
        }
      }

      loadDashboard();

      return function () {
        ignore = true;
      };
    },
    [currentUser.id, currentUser.role]
  );

  if (currentUser.role === "student") {
    const courses = studentDashboard?.courses || [];
    const upcomingAssessments = studentDashboard?.upcomingAssessments || [];

    return (
      <PageLayout
        currentUser={currentUser}
        title="Dashboard"
        subtitle="Student overview"
        navItems={studentNavItems}
        onLogout={onLogout}
        pageClassName="dashboard-page"
        headerBadge={
          <div>
            <span className="badge-label">Current Courses</span>
            <strong>{courses.length}</strong>
          </div>
        }
        menuExtra={
          <div>
            <h3>Quick Summary</h3>
            <p>{upcomingAssessments.length} upcoming assessments</p>
          </div>
        }
      >
        {error ? <p className="status-message error-message">{error}</p> : null}

        {loading ? <p className="status-message">Loading dashboard...</p> : null}

        {!loading && !error ? (
          <div className="dashboard-grid">
            <section className="card">
              <div className="card-header">
                <h2>My Courses</h2>
                <p>Live data from the backend</p>
              </div>

              <div className="class-cards">
                {courses.length === 0 ? (
                  <p className="empty-state">No courses yet. Add one from the courses page.</p>
                ) : (
                  courses.map(function (course) {
                    return (
                      <article key={course.id} className="class-card">
                        <h3>{course.code}</h3>
                        <p>{course.name}</p>
                        <p>{course.instructor}</p>
                        <p>Average: {formatPercent(course.currentAverage)}</p>
                        <p>Progress: {formatPercent(course.progress)}</p>
                      </article>
                    );
                  })
                )}
              </div>
            </section>

            <section className="card">
              <div className="card-header">
                <h2>Upcoming Assessments</h2>
                <p>Sorted by due date</p>
              </div>

              <div className="timeline">
                {upcomingAssessments.length === 0 ? (
                  <p className="empty-state">No upcoming assessments right now.</p>
                ) : (
                  upcomingAssessments.map(function (assessment) {
                    return (
                      <div key={assessment.id} className="timeline-event">
                        <span className="time">{formatDate(assessment.dueDate)}</span>
                        <div>
                          <strong>{assessment.title}</strong>
                          <p>
                            {assessment.category} • Weight {assessment.weight}% • {assessment.status}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        ) : null}
      </PageLayout>
    );
  }

  const teacherCourses = teacherDashboard?.courses || [];
  const teacherTemplates = teacherDashboard?.templates || [];
  const stats = teacherDashboard?.stats;

  return (
    <PageLayout
      currentUser={currentUser}
      title="Dashboard"
      subtitle="Teacher overview"
      navItems={teacherNavItems}
      onLogout={onLogout}
      pageClassName="dashboard-page"
      headerBadge={
        <div>
          <span className="badge-label">Teacher Courses</span>
          <strong>{teacherCourses.length}</strong>
        </div>
      }
      menuExtra={
        <div>
          <h3>Templates</h3>
          <p>{teacherTemplates.length} grading templates available</p>
        </div>
      }
    >
      {error ? <p className="status-message error-message">{error}</p> : null}

      {loading ? <p className="status-message">Loading dashboard...</p> : null}

      {!loading && !error ? (
        <div className="dashboard-grid">
          <section className="card">
            <div className="card-header">
              <h2>Teaching Stats</h2>
              <p>Calculated on the server</p>
            </div>

            <div className="stats-grid">
              <article className="status-card">
                <span>Courses</span>
                <strong>{stats?.totalTeacherCourses || 0}</strong>
              </article>
              <article className="status-card">
                <span>Student Sections</span>
                <strong>{stats?.totalRelatedStudentCourses || 0}</strong>
              </article>
              <article className="status-card">
                <span>Assessments</span>
                <strong>{stats?.totalRelatedAssessments || 0}</strong>
              </article>
              <article className="status-card">
                <span>Completion</span>
                <strong>{formatPercent(stats?.completionPercentage || 0)}</strong>
              </article>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <h2>My Courses</h2>
              <p>Active and inactive sections</p>
            </div>

            <div className="course-summary-list">
              {teacherCourses.length === 0 ? (
                <p className="empty-state">No teacher courses yet.</p>
              ) : (
                teacherCourses.map(function (course) {
                  return (
                    <article key={course.id} className="course-summary-card">
                      <h3>{course.code}</h3>
                      <p>{course.title}</p>
                      <p>{course.term}</p>
                      <p>Status: {course.enabled ? "Enabled" : "Disabled"}</p>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>
      ) : null}
    </PageLayout>
  );
}

export default DashboardPage;
