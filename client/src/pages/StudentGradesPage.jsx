import { useEffect, useState } from "react";

import { fetchStudentAssessments, fetchStudentCourses } from "../api";
import PageLayout from "../components/PageLayout";
import { studentNavItems } from "../navigation";
import { calculateAverage, calculateProgress, formatDate, formatPercent } from "../utils";

function StudentGradesPage(props) {
  const { currentUser, onLogout } = props;
  const [courses, setCourses] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(
    function () {
      let ignore = false;

      async function loadData() {
        setLoading(true);
        setError("");

        try {
          const [coursesData, assessmentsData] = await Promise.all([
            fetchStudentCourses(currentUser.id),
            fetchStudentAssessments(currentUser.id),
          ]);

          if (!ignore) {
            setCourses(coursesData);
            setAssessments(assessmentsData);
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

      loadData();

      return function () {
        ignore = true;
      };
    },
    [currentUser.id]
  );

  function getAssessmentsForCourse(courseId) {
    return assessments.filter(function (assessment) {
      return assessment.courseId === courseId;
    });
  }

  return (
    <PageLayout
      currentUser={currentUser}
      title="Grades"
      subtitle="Student grade analytics"
      navItems={studentNavItems}
      onLogout={onLogout}
      pageClassName="portal-page"
      headerBadge={
        <div>
          <span className="badge-label">Tracked Courses</span>
          <strong>{courses.length}</strong>
        </div>
      }
      menuExtra={
        <div>
          <h3>Structure Update</h3>
          <p>Assessment editing is now on the Assessments page.</p>
        </div>
      }
    >
      {error ? <p className="status-message error-message">{error}</p> : null}
      {loading ? <p className="status-message">Loading grades...</p> : null}

      <section className="card">
        <div className="card-header">
          <h2>Course Breakdown</h2>
          <p>Read-only grade view grouped by course.</p>
        </div>

        {!loading && courses.length === 0 ? (
          <p className="empty-state">No courses available yet.</p>
        ) : null}

        <div className="course-summary-list">
          {courses.map(function (course) {
            const courseAssessments = getAssessmentsForCourse(course.id);

            return (
              <article key={course.id} className="course-summary-card">
                <div className="course-summary-head">
                  <div>
                    <h3>{course.code}</h3>
                    <p>{course.name}</p>
                  </div>

                  <div className="pill-group">
                    <span className="pill">
                      Average: {formatPercent(calculateAverage(courseAssessments))}
                    </span>
                    <span className="pill">
                      Progress: {formatPercent(calculateProgress(courseAssessments))}
                    </span>
                  </div>
                </div>

                {courseAssessments.length === 0 ? (
                  <p className="empty-state">No assessments yet for this course.</p>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Assessment</th>
                        <th>Category</th>
                        <th>Weight</th>
                        <th>Score</th>
                        <th>Due Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseAssessments.map(function (assessment) {
                        return (
                          <tr key={assessment.id}>
                            <td>{assessment.title}</td>
                            <td>{assessment.category}</td>
                            <td>{assessment.weight}%</td>
                            <td>
                              {assessment.earnedMarks === null
                                ? `- / ${assessment.totalMarks}`
                                : `${assessment.earnedMarks} / ${assessment.totalMarks}`}
                            </td>
                            <td>{formatDate(assessment.dueDate)}</td>
                            <td>{assessment.status}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </PageLayout>
  );
}

export default StudentGradesPage;
