import { useEffect, useState } from "react";

import {
  createStudentCourse,
  deleteStudentCourse,
  fetchStudentAssessments,
  fetchStudentCourses,
} from "../api";
import PageLayout from "../components/PageLayout";
import { studentNavItems } from "../navigation";

function StudentCoursesPage(props) {
  const { currentUser, onLogout } = props;
  const [courses, setCourses] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [form, setForm] = useState({
    code: "",
    name: "",
    instructor: "",
    term: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(
    function () {
      let ignore = false;

      async function loadCoursesPage() {
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

      loadCoursesPage();

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
      const data = await createStudentCourse(currentUser.id, form);
      setCourses(function (currentCourses) {
        return [...currentCourses, data.course];
      });
      setForm({
        code: "",
        name: "",
        instructor: "",
        term: "",
      });
      setMessage("Course added successfully.");
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function handleDelete(courseId) {
    const shouldDelete = window.confirm("Delete this course and its assessments?");

    if (!shouldDelete) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await deleteStudentCourse(currentUser.id, courseId);
      setCourses(function (currentCourses) {
        return currentCourses.filter(function (course) {
          return course.id !== courseId;
        });
      });
      setAssessments(function (currentAssessments) {
        return currentAssessments.filter(function (assessment) {
          return assessment.courseId !== courseId;
        });
      });
      setMessage("Course deleted successfully.");
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  function getAssessmentCount(courseId) {
    let count = 0;

    for (let i = 0; i < assessments.length; i++) {
      if (assessments[i].courseId === courseId) {
        count++;
      }
    }

    return count;
  }

  return (
    <PageLayout
      currentUser={currentUser}
      title="My Courses"
      subtitle="Student courses"
      navItems={studentNavItems}
      onLogout={onLogout}
      pageClassName="course-page"
      headerBadge={
        <div>
          <span className="badge-label">Total Courses</span>
          <strong>{courses.length}</strong>
        </div>
      }
      menuExtra={
        <div>
          <h3>Manage Courses</h3>
          <p>Add your own course list and keep it saved in the backend.</p>
        </div>
      }
    >
      {message ? <p className="status-message success-message">{message}</p> : null}
      {error ? <p className="status-message error-message">{error}</p> : null}

      <div className="content-grid">
        <section className="card">
          <div className="card-header">
            <h2>Add a Course</h2>
            <p>This writes directly to the backend JSON data.</p>
          </div>

          <form className="form-card" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label htmlFor="code">Course Code</label>
              <input id="code" name="code" value={form.code} onChange={handleChange} required />

              <label htmlFor="name">Course Name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required />

              <label htmlFor="instructor">Instructor</label>
              <input
                id="instructor"
                name="instructor"
                value={form.instructor}
                onChange={handleChange}
                required
              />

              <label htmlFor="term">Term</label>
              <input id="term" name="term" value={form.term} onChange={handleChange} required />
            </div>

            <button type="submit" className="primary-button">
              Save Course
            </button>
          </form>
        </section>

        <section className="card">
          <div className="card-header">
            <h2>Saved Courses</h2>
            <p>React is now reading these from the backend instead of placeholders.</p>
          </div>

          {loading ? <p className="status-message">Loading courses...</p> : null}

          {!loading && courses.length === 0 ? (
            <p className="empty-state">No courses yet.</p>
          ) : null}

          <div className="course-summary-list">
            {courses.map(function (course) {
              return (
                <article key={course.id} className="course-summary-card">
                  <div className="course-summary-head">
                    <div>
                      <h3>{course.code}</h3>
                      <p>{course.name}</p>
                    </div>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={function () {
                        handleDelete(course.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>

                  <p>Instructor: {course.instructor}</p>
                  <p>Term: {course.term}</p>
                  <p>Assessments: {getAssessmentCount(course.id)}</p>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

export default StudentCoursesPage;
