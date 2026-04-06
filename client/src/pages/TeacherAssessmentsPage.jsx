import { useEffect, useState } from "react";

import {
  deleteTeacherPublishedAssessment,
  fetchTeacherAssessments,
  fetchTeacherCourses,
  publishTeacherAssessment,
  updateTeacherPublishedAssessment,
} from "../api";
import PageLayout from "../components/PageLayout";
import { teacherNavItems } from "../navigation";
import { formatDate } from "../utils";

function TeacherAssessmentsPage(props) {
  const { currentUser, onLogout } = props;
  const [courses, setCourses] = useState([]);
  const [publishedCourses, setPublishedCourses] = useState([]);
  const [form, setForm] = useState({
    teacherCourseId: "",
    title: "",
    category: "",
    weight: "",
    totalMarks: "",
    dueDate: "",
    status: "pending",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingAssessmentId, setEditingAssessmentId] = useState(null);

  useEffect(
    function () {
      let ignore = false;

      async function loadData() {
        setLoading(true);
        setError("");

        try {
          const [coursesData, teacherAssessmentsData] = await Promise.all([
            fetchTeacherCourses(currentUser.id),
            fetchTeacherAssessments(currentUser.id),
          ]);

          if (!ignore) {
            setCourses(coursesData);
            setPublishedCourses(teacherAssessmentsData.courses);
            setForm(function (currentForm) {
              return {
                ...currentForm,
                teacherCourseId: currentForm.teacherCourseId || coursesData[0]?.id || "",
              };
            });
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

  function handleChange(event) {
    const { name, value } = event.target;

    setForm(function (currentForm) {
      return {
        ...currentForm,
        [name]: value,
      };
    });
  }

  function resetForm() {
    setForm(function (currentForm) {
      return {
        ...currentForm,
        title: "",
        category: "",
        weight: "",
        totalMarks: "",
        dueDate: "",
        status: "pending",
      };
    });
  }

  async function loadPublishedAssessments() {
    const teacherAssessmentsData = await fetchTeacherAssessments(currentUser.id);
    setPublishedCourses(teacherAssessmentsData.courses);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      if (editingAssessmentId) {
        await updateTeacherPublishedAssessment(currentUser.id, editingAssessmentId, {
          title: form.title,
          category: form.category,
          weight: form.weight,
          totalMarks: form.totalMarks,
          dueDate: form.dueDate,
          status: form.status,
        });
        setMessage("Assessment updated successfully.");
      } else {
        const data = await publishTeacherAssessment(currentUser.id, form);
        setMessage(
          `Assessment published. Created ${data.createdCount} and skipped ${data.skippedCount}.`
        );
      }

      await loadPublishedAssessments();
      setEditingAssessmentId(null);
      resetForm();
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  function startEditAssessment(assessment) {
    setEditingAssessmentId(assessment.id);
    setForm({
      teacherCourseId: assessment.teacherCourseId,
      title: assessment.title,
      category: assessment.category,
      weight: String(assessment.weight ?? ""),
      totalMarks: String(assessment.totalMarks ?? ""),
      dueDate: assessment.dueDate || "",
      status: assessment.completedCount === assessment.assignedStudents ? "completed" : "pending",
    });
    setMessage("");
    setError("");
  }

  function cancelEditAssessment() {
    setEditingAssessmentId(null);
    resetForm();
  }

  async function handleDeleteAssessment(assessmentId) {
    const shouldDelete = window.confirm(
      "Delete this published assessment for all students in the course?"
    );

    if (!shouldDelete) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await deleteTeacherPublishedAssessment(currentUser.id, assessmentId);
      await loadPublishedAssessments();
      if (editingAssessmentId === assessmentId) {
        cancelEditAssessment();
      }
      setMessage("Assessment deleted successfully.");
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <PageLayout
      currentUser={currentUser}
      title="Assessments"
      subtitle="Teacher assessment manager"
      navItems={teacherNavItems}
      onLogout={onLogout}
      pageClassName="course-page"
      headerBadge={
        <div>
          <span className="badge-label">Teacher Courses</span>
          <strong>{courses.length}</strong>
        </div>
      }
      menuExtra={
        <div>
          <h3>Teacher Owned</h3>
          <p>Teachers create, edit, publish, and delete assessment structures here.</p>
        </div>
      }
    >
      {message ? <p className="status-message success-message">{message}</p> : null}
      {error ? <p className="status-message error-message">{error}</p> : null}
      {loading ? <p className="status-message">Loading courses...</p> : null}

      <div className="content-grid">
        <section className="card">
          <div className="card-header">
            <h2>{editingAssessmentId ? "Edit Published Assessment" : "Publish Assessment"}</h2>
            <p>
              {editingAssessmentId
                ? "Update the assessment structure for all linked student entries."
                : "Create an assessment and publish it to the selected course."}
            </p>
          </div>

          {courses.length === 0 ? (
            <p className="empty-state">Create a teacher course first.</p>
          ) : (
            <form className="form-card" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label htmlFor="teacherCourseId">Course</label>
                <select
                  id="teacherCourseId"
                  name="teacherCourseId"
                  value={form.teacherCourseId}
                  onChange={handleChange}
                  required
                  disabled={editingAssessmentId !== null}
                >
                  {courses.map(function (course) {
                    return (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.title} ({course.term})
                      </option>
                    );
                  })}
                </select>

                <label htmlFor="title">Assessment Title</label>
                <input id="title" name="title" value={form.title} onChange={handleChange} required />

                <label htmlFor="category">Category</label>
                <input
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                />

                <label htmlFor="weight">Weight (%)</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={form.weight}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />

                <label htmlFor="totalMarks">Total Marks</label>
                <input
                  type="number"
                  id="totalMarks"
                  name="totalMarks"
                  value={form.totalMarks}
                  onChange={handleChange}
                  min="1"
                  step="0.01"
                  required
                />

                <label htmlFor="dueDate">Due Date</label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                  required
                />

                <label htmlFor="status">Status</label>
                <select id="status" name="status" value={form.status} onChange={handleChange}>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="pill-group">
                <button type="submit" className="primary-button">
                  {editingAssessmentId ? "Update Assessment" : "Publish Assessment"}
                </button>
                {editingAssessmentId ? (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={cancelEditAssessment}
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </form>
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <h2>Published Assessments</h2>
            <p>All professor-created assessments grouped by course.</p>
          </div>

          {publishedCourses.every(function (course) {
            return course.assessments.length === 0;
          }) ? (
            <p className="empty-state">No assessments published yet.</p>
          ) : (
            <div className="course-summary-list">
              {publishedCourses.map(function (course) {
                return (
                  <article key={course.id} className="course-summary-card">
                    <div className="course-summary-head">
                      <div>
                        <h3>{course.code}</h3>
                        <p>
                          {course.title} • {course.term}
                        </p>
                      </div>
                    </div>

                    {course.assessments.length === 0 ? (
                      <p className="empty-state">No assessments for this course yet.</p>
                    ) : (
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Assessment</th>
                            <th>Category</th>
                            <th>Weight</th>
                            <th>Total Marks</th>
                            <th>Due Date</th>
                            <th>Assigned</th>
                            <th>Graded</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {course.assessments.map(function (assessment) {
                            return (
                              <tr key={assessment.id}>
                                <td>{assessment.title}</td>
                                <td>{assessment.category}</td>
                                <td>{assessment.weight}%</td>
                                <td>{assessment.totalMarks}</td>
                                <td>{formatDate(assessment.dueDate)}</td>
                                <td>{assessment.assignedStudents}</td>
                                <td>{assessment.gradedCount}</td>
                                <td>
                                  <div className="pill-group">
                                    <button
                                      type="button"
                                      className="secondary-button"
                                      onClick={function () {
                                        startEditAssessment(assessment);
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      className="secondary-button"
                                      onClick={function () {
                                        handleDeleteAssessment(assessment.id);
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
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
          )}
        </section>
      </div>
    </PageLayout>
  );
}

export default TeacherAssessmentsPage;
