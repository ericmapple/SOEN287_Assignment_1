import { useEffect, useState } from "react";

import {
  createTeacherCourse,
  fetchTeacherCourses,
  fetchTeacherTemplates,
  toggleTeacherCourse,
} from "../api";
import PageLayout from "../components/PageLayout";
import { teacherNavItems } from "../navigation";

function TeacherCoursesPage(props) {
  const { currentUser, onLogout } = props;
  const [courses, setCourses] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({
    code: "",
    title: "",
    term: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(
    function () {
      let ignore = false;

      async function loadTeacherCourses() {
        setLoading(true);
        setError("");

        try {
          const [coursesData, templatesData] = await Promise.all([
            fetchTeacherCourses(currentUser.id),
            fetchTeacherTemplates(currentUser.id),
          ]);

          if (!ignore) {
            setCourses(coursesData);
            setTemplates(templatesData);
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

      loadTeacherCourses();

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
      const data = await createTeacherCourse(currentUser.id, form);
      setCourses(function (currentCourses) {
        return [...currentCourses, data.course];
      });
      setForm({
        code: "",
        title: "",
        term: "",
      });
      setMessage("Teacher course created successfully.");
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function handleToggle(courseId) {
    setMessage("");
    setError("");

    try {
      const data = await toggleTeacherCourse(currentUser.id, courseId);

      setCourses(function (currentCourses) {
        return currentCourses.map(function (course) {
          if (course.id === courseId) {
            return data.course;
          }

          return course;
        });
      });
    } catch (toggleError) {
      setError(toggleError.message);
    }
  }

  return (
    <PageLayout
      currentUser={currentUser}
      title="Teacher Courses"
      subtitle="Course management"
      navItems={teacherNavItems}
      onLogout={onLogout}
      pageClassName="course-page"
      headerBadge={
        <div>
          <span className="badge-label">Course Templates</span>
          <strong>{templates.length}</strong>
        </div>
      }
      menuExtra={
        <div>
          <h3>Templates</h3>
          <p>Templates stay available while you add or disable courses.</p>
        </div>
      }
    >
      {message ? <p className="status-message success-message">{message}</p> : null}
      {error ? <p className="status-message error-message">{error}</p> : null}

      <div className="content-grid">
        <section className="card">
          <div className="card-header">
            <h2>Create a Course</h2>
            <p>This uses the teacher course API routes.</p>
          </div>

          <form className="form-card" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label htmlFor="code">Course Code</label>
              <input id="code" name="code" value={form.code} onChange={handleChange} required />

              <label htmlFor="title">Course Title</label>
              <input id="title" name="title" value={form.title} onChange={handleChange} required />

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
            <h2>My Courses</h2>
            <p>Toggle them on or off without leaving the page.</p>
          </div>

          {loading ? <p className="status-message">Loading courses...</p> : null}

          {!loading && courses.length === 0 ? (
            <p className="empty-state">No teacher courses yet.</p>
          ) : null}

          <div className="course-summary-list">
            {courses.map(function (course) {
              return (
                <article key={course.id} className="course-summary-card">
                  <div className="course-summary-head">
                    <div>
                      <h3>{course.code}</h3>
                      <p>{course.title}</p>
                    </div>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={function () {
                        handleToggle(course.id);
                      }}
                    >
                      {course.enabled ? "Disable" : "Enable"}
                    </button>
                  </div>

                  <p>Term: {course.term}</p>
                  <p>Status: {course.enabled ? "Enabled" : "Disabled"}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h2>Saved Templates</h2>
            <p>Teacher template data from the backend</p>
          </div>

          <div className="course-summary-list">
            {templates.length === 0 ? (
              <p className="empty-state">No templates created yet.</p>
            ) : (
              templates.map(function (template) {
                return (
                  <article key={template.id} className="course-summary-card">
                    <h3>{template.name}</h3>
                    <p>{template.courseCode}</p>
                    <div className="chips">
                      {template.categories.map(function (category) {
                        return (
                          <span key={`${template.id}-${category.name}`}>
                            {category.name} {category.weight}%
                          </span>
                        );
                      })}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

export default TeacherCoursesPage;
