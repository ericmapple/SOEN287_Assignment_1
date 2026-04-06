import { useEffect, useState } from "react";

import { fetchStudentAssessments, fetchStudentCourses, updateStudentAssessment } from "../api";
import PageLayout from "../components/PageLayout";
import { studentNavItems } from "../navigation";
import { formatDate } from "../utils";

function StudentAssessmentsPage(props) {
  const { currentUser, onLogout } = props;
  const [courses, setCourses] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [message, setMessage] = useState("");
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

  function getCourseName(courseId) {
    for (let i = 0; i < courses.length; i++) {
      if (courses[i].id === courseId) {
        return `${courses[i].code} - ${courses[i].name}`;
      }
    }

    return "Unknown course";
  }

  async function toggleStatus(assessment) {
    setMessage("");
    setError("");

    const nextStatus = assessment.status === "completed" ? "pending" : "completed";

    try {
      const data = await updateStudentAssessment(currentUser.id, assessment.id, {
        status: nextStatus,
      });

      setAssessments(function (currentAssessments) {
        return currentAssessments.map(function (currentAssessment) {
          if (currentAssessment.id === assessment.id) {
            return data.assessment;
          }

          return currentAssessment;
        });
      });

      setMessage("Assessment status updated.");
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  return (
    <PageLayout
      currentUser={currentUser}
      title="Assessments"
      subtitle="Student assessment tracker"
      navItems={studentNavItems}
      onLogout={onLogout}
      pageClassName="portal-page"
      headerBadge={
        <div>
          <span className="badge-label">Assigned Assessments</span>
          <strong>{assessments.length}</strong>
        </div>
      }
      menuExtra={
        <div>
          <h3>Teacher Managed</h3>
          <p>Assessments are published by professors. Students only track completion here.</p>
        </div>
      }
    >
      {message ? <p className="status-message success-message">{message}</p> : null}
      {error ? <p className="status-message error-message">{error}</p> : null}
      {loading ? <p className="status-message">Loading assessments...</p> : null}

      <section className="card">
        <div className="card-header">
          <h2>Assigned Assessments</h2>
          <p>View the work published by your teachers and track completion status.</p>
        </div>

        {!loading && assessments.length === 0 ? (
          <p className="empty-state">No assessments have been published yet.</p>
        ) : null}

        {assessments.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Assessment</th>
                <th>Category</th>
                <th>Weight</th>
                <th>Score</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Track</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map(function (assessment) {
                return (
                  <tr key={assessment.id}>
                    <td>{getCourseName(assessment.courseId)}</td>
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
                    <td>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={function () {
                          toggleStatus(assessment);
                        }}
                      >
                        {assessment.status === "completed" ? "Mark Pending" : "Mark Completed"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null}
      </section>
    </PageLayout>
  );
}

export default StudentAssessmentsPage;
