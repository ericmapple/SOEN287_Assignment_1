<<<<<<< HEAD
import { useEffect, useState } from "react";

import {
  createStudentAssessment,
  fetchStudentAssessments,
  fetchStudentCourses,
} from "../api";
import PageLayout from "../components/PageLayout";
import { studentNavItems } from "../navigation";
import { calculateAverage, calculateProgress, formatDate, formatPercent } from "../utils";

function StudentGradesPage(props) {
  const { currentUser, onLogout } = props;
  const [courses, setCourses] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [form, setForm] = useState({
    courseId: "",
    title: "",
    category: "",
    weight: "",
    earnedMarks: "",
    totalMarks: "",
    dueDate: "",
    status: "pending",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(
    function () {
      let ignore = false;

      async function loadGradesPage() {
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
            setForm(function (currentForm) {
              return {
                ...currentForm,
                courseId: currentForm.courseId || coursesData[0]?.id || "",
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

      loadGradesPage();

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

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const data = await createStudentAssessment(currentUser.id, form);
      setAssessments(function (currentAssessments) {
        return [...currentAssessments, data.assessment];
      });
      setForm(function (currentForm) {
        return {
          ...currentForm,
          title: "",
          category: "",
          weight: "",
          earnedMarks: "",
          totalMarks: "",
          dueDate: "",
          status: "pending",
        };
      });
      setMessage("Assessment added successfully.");
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  function getAssessmentsForCourse(courseId) {
    return assessments.filter(function (assessment) {
      return assessment.courseId === courseId;
    });
  }

  return (
    <PageLayout
      currentUser={currentUser}
      title="Grades"
      subtitle="Student assessments"
      navItems={studentNavItems}
      onLogout={onLogout}
      pageClassName="portal-page"
      headerBadge={
        <div>
          <span className="badge-label">Assessments</span>
          <strong>{assessments.length}</strong>
        </div>
      }
      menuExtra={
        <div>
          <h3>Quick Tip</h3>
          <p>Add assessments here and the dashboard updates automatically.</p>
        </div>
      }
    >
      {message ? <p className="status-message success-message">{message}</p> : null}
      {error ? <p className="status-message error-message">{error}</p> : null}

      <div className="content-grid">
        <section className="card">
          <div className="card-header">
            <h2>Add an Assessment</h2>
            <p>This page is linked to the backend now.</p>
          </div>

          {courses.length === 0 ? (
            <p className="empty-state">Add a course first before adding assessments.</p>
          ) : (
            <form className="form-card" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label htmlFor="courseId">Course</label>
                <select
                  id="courseId"
                  name="courseId"
                  value={form.courseId}
                  onChange={handleChange}
                  required
                >
                  {courses.map(function (course) {
                    return (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </option>
                    );
                  })}
                </select>

                <label htmlFor="title">Title</label>
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

                <label htmlFor="earnedMarks">Earned Marks</label>
                <input
                  type="number"
                  id="earnedMarks"
                  name="earnedMarks"
                  value={form.earnedMarks}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
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

              <button type="submit" className="primary-button">
                Save Assessment
              </button>
            </form>
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <h2>Course Breakdown</h2>
            <p>Grouped by course using saved assessment data</p>
          </div>

          {loading ? <p className="status-message">Loading grades...</p> : null}

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
                      <span className="pill">Average: {formatPercent(calculateAverage(courseAssessments))}</span>
                      <span className="pill">Progress: {formatPercent(calculateProgress(courseAssessments))}</span>
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
      </div>
    </PageLayout>
  );
}

export default StudentGradesPage;
=======
import { useEffect, useState } from "react";

import {
  createStudentAssessment,
  fetchStudentAssessments,
  fetchStudentCourses,
} from "../api";
import PageLayout from "../components/PageLayout";
import { studentNavItems } from "../navigation";
import { calculateAverage, calculateProgress, formatDate, formatPercent } from "../utils";

function StudentGradesPage(props) {
  const { currentUser, onLogout } = props;
  const [courses, setCourses] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [form, setForm] = useState({
    courseId: "",
    title: "",
    category: "",
    weight: "",
    earnedMarks: "",
    totalMarks: "",
    dueDate: "",
    status: "pending",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(
    function () {
      let ignore = false;

      async function loadGradesPage() {
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
            setForm(function (currentForm) {
              return {
                ...currentForm,
                courseId: currentForm.courseId || coursesData[0]?.id || "",
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

      loadGradesPage();

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

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const data = await createStudentAssessment(currentUser.id, form);
      setAssessments(function (currentAssessments) {
        return [...currentAssessments, data.assessment];
      });
      setForm(function (currentForm) {
        return {
          ...currentForm,
          title: "",
          category: "",
          weight: "",
          earnedMarks: "",
          totalMarks: "",
          dueDate: "",
          status: "pending",
        };
      });
      setMessage("Assessment added successfully.");
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  function getAssessmentsForCourse(courseId) {
    return assessments.filter(function (assessment) {
      return assessment.courseId === courseId;
    });
  }

  return (
    <PageLayout
      currentUser={currentUser}
      title="Grades"
      subtitle="Student assessments"
      navItems={studentNavItems}
      onLogout={onLogout}
      pageClassName="portal-page"
      headerBadge={
        <div>
          <span className="badge-label">Assessments</span>
          <strong>{assessments.length}</strong>
        </div>
      }
      menuExtra={
        <div>
          <h3>Quick Tip</h3>
          <p>Add assessments here and the dashboard updates automatically.</p>
        </div>
      }
    >
      {message ? <p className="status-message success-message">{message}</p> : null}
      {error ? <p className="status-message error-message">{error}</p> : null}

      <div className="content-grid">
        <section className="card">
          <div className="card-header">
            <h2>Add an Assessment</h2>
            <p>This page is linked to the backend now.</p>
          </div>

          {courses.length === 0 ? (
            <p className="empty-state">Add a course first before adding assessments.</p>
          ) : (
            <form className="form-card" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label htmlFor="courseId">Course</label>
                <select
                  id="courseId"
                  name="courseId"
                  value={form.courseId}
                  onChange={handleChange}
                  required
                >
                  {courses.map(function (course) {
                    return (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </option>
                    );
                  })}
                </select>

                <label htmlFor="title">Title</label>
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

                <label htmlFor="earnedMarks">Earned Marks</label>
                <input
                  type="number"
                  id="earnedMarks"
                  name="earnedMarks"
                  value={form.earnedMarks}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
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

              <button type="submit" className="primary-button">
                Save Assessment
              </button>
            </form>
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <h2>Course Breakdown</h2>
            <p>Grouped by course using saved assessment data</p>
          </div>

          {loading ? <p className="status-message">Loading grades...</p> : null}

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
                      <span className="pill">Average: {formatPercent(calculateAverage(courseAssessments))}</span>
                      <span className="pill">Progress: {formatPercent(calculateProgress(courseAssessments))}</span>
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
      </div>
    </PageLayout>
  );
}

export default StudentGradesPage;
>>>>>>> e3c7b589d2a22c0df3299c9cdc61784d2e27149e
