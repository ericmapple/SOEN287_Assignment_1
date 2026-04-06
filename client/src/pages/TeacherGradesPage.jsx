import { useEffect, useState } from "react";

import { fetchTeacherGradebook } from "../api";
import PageLayout from "../components/PageLayout";
import { teacherNavItems } from "../navigation";
import { formatPercent } from "../utils";

function TeacherGradesPage(props) {
  const { currentUser, onLogout } = props;
  const [gradebook, setGradebook] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(
    function () {
      let ignore = false;

      async function loadGradebook() {
        setLoading(true);
        setError("");

        try {
          const data = await fetchTeacherGradebook(currentUser.id);

          if (!ignore) {
            setGradebook(data.courses);
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

      loadGradebook();

      return function () {
        ignore = true;
      };
    },
    [currentUser.id]
  );

  return (
    <PageLayout
      currentUser={currentUser}
      title="Grades"
      subtitle="Teacher gradebook"
      navItems={teacherNavItems}
      onLogout={onLogout}
      pageClassName="portal-page"
      headerBadge={
        <div>
          <span className="badge-label">Tracked Courses</span>
          <strong>{gradebook.length}</strong>
        </div>
      }
      menuExtra={
        <div>
          <h3>Gradebook</h3>
          <p>This page now pulls course and student summaries from the backend.</p>
        </div>
      }
    >
      {error ? <p className="status-message error-message">{error}</p> : null}
      {loading ? <p className="status-message">Loading gradebook...</p> : null}

      {!loading && gradebook.length === 0 ? (
        <p className="empty-state">No grade data available yet.</p>
      ) : null}

      <div className="course-summary-list">
        {gradebook.map(function (course) {
          return (
            <section key={course.id} className="card">
              <div className="card-header">
                <div>
                  <h2>{course.code}</h2>
                  <p>
                    {course.title} • {course.term}
                  </p>
                </div>

                <div className="pill-group">
                  <span className="pill">Students: {course.totalStudents}</span>
                  <span className="pill">Average: {formatPercent(course.average)}</span>
                  <span className="pill">Progress: {formatPercent(course.progress)}</span>
                </div>
              </div>

              <h3 className="section-title">Student Summary</h3>

              {course.students.length === 0 ? (
                <p className="empty-state">No student sections matched this course code yet.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Student ID</th>
                      <th>Average</th>
                      <th>Progress</th>
                      <th>Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.students.map(function (student) {
                      return (
                        <tr key={`${course.id}-${student.studentId}`}>
                          <td>{student.studentName}</td>
                          <td>{student.studentId}</td>
                          <td>{formatPercent(student.average)}</td>
                          <td>{formatPercent(student.progress)}</td>
                          <td>
                            {student.completedAssessments} / {student.totalAssessments}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              <h3 className="section-title">Assessment Summary</h3>

              {course.assessments.length === 0 ? (
                <p className="empty-state">No assessments linked to this course yet.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Assessment</th>
                      <th>Average Score</th>
                      <th>Submissions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.assessments.map(function (assessment) {
                      return (
                        <tr key={`${course.id}-${assessment.title}`}>
                          <td>{assessment.title}</td>
                          <td>{formatPercent(assessment.averageScore)}</td>
                          <td>
                            {assessment.submissions} / {assessment.totalStudents}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </section>
          );
        })}
      </div>
    </PageLayout>
  );
}

export default TeacherGradesPage;
