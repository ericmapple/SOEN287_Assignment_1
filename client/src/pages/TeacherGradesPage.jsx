import { useCallback, useEffect, useState } from "react";

import { fetchTeacherGradebook, updateTeacherAssessmentGrade } from "../api";
import PageLayout from "../components/PageLayout";
import { teacherNavItems } from "../navigation";
import { formatPercent } from "../utils";

function buildGradeEdits(courses) {
  const edits = {};

  for (let i = 0; i < courses.length; i++) {
    const entries = courses[i].entries || [];

    for (let j = 0; j < entries.length; j++) {
      const entry = entries[j];
      edits[entry.id] = {
        earnedMarks:
          entry.earnedMarks === null || entry.earnedMarks === undefined
            ? ""
            : String(entry.earnedMarks),
        status: entry.status || "pending",
      };
    }
  }

  return edits;
}

function TeacherGradesPage(props) {
  const { currentUser, onLogout } = props;
  const [gradebook, setGradebook] = useState([]);
  const [gradeEdits, setGradeEdits] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingAssessmentId, setSavingAssessmentId] = useState(null);

  const loadGradebookData = useCallback(async function () {
    setLoading(true);
    setError("");

    try {
      const data = await fetchTeacherGradebook(currentUser.id);
      setGradebook(data.courses);
      setGradeEdits(buildGradeEdits(data.courses));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser.id]);

  useEffect(
    function () {
      loadGradebookData();
    },
    [loadGradebookData]
  );

  function updateGradeEdit(assessmentId, field, value) {
    setGradeEdits(function (currentEdits) {
      const currentAssessmentEdit = currentEdits[assessmentId] || {
        earnedMarks: "",
        status: "pending",
      };

      return {
        ...currentEdits,
        [assessmentId]: {
          ...currentAssessmentEdit,
          [field]: value,
        },
      };
    });
  }

  async function saveAssessmentGrade(assessmentId) {
    setMessage("");
    setError("");
    setSavingAssessmentId(assessmentId);

    try {
      const currentEdit = gradeEdits[assessmentId] || {
        earnedMarks: "",
        status: "pending",
      };

      await updateTeacherAssessmentGrade(currentUser.id, assessmentId, {
        earnedMarks: currentEdit.earnedMarks,
        status: currentEdit.status,
      });
      await loadGradebookData();
      setMessage("Grade updated successfully.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSavingAssessmentId(null);
    }
  }

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
          <p>Add or modify grades directly in this page.</p>
        </div>
      }
    >
      {message ? <p className="status-message success-message">{message}</p> : null}
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

              <h3 className="section-title">Add / Modify Grades</h3>

              {!course.entries || course.entries.length === 0 ? (
                <p className="empty-state">No grade entries for this course yet.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Assessment</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Save</th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.entries.map(function (entry) {
                      const currentEdit = gradeEdits[entry.id] || {
                        earnedMarks:
                          entry.earnedMarks === null || entry.earnedMarks === undefined
                            ? ""
                            : String(entry.earnedMarks),
                        status: entry.status || "pending",
                      };

                      return (
                        <tr key={entry.id}>
                          <td>{entry.studentName}</td>
                          <td>{entry.title}</td>
                          <td>
                            <div className="grade-edit-row">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={currentEdit.earnedMarks}
                                onChange={function (event) {
                                  updateGradeEdit(entry.id, "earnedMarks", event.target.value);
                                }}
                              />
                              <span>/ {entry.totalMarks}</span>
                            </div>
                          </td>
                          <td>
                            <select
                              value={currentEdit.status}
                              onChange={function (event) {
                                updateGradeEdit(entry.id, "status", event.target.value);
                              }}
                            >
                              <option value="pending">Pending</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={function () {
                                saveAssessmentGrade(entry.id);
                              }}
                              disabled={savingAssessmentId === entry.id}
                            >
                              {savingAssessmentId === entry.id ? "Saving..." : "Save"}
                            </button>
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
