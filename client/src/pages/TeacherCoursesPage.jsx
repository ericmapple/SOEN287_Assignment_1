import { useEffect, useState } from "react";

import {
  createTeacherCourse,
  fetchTeacherCourses,
  toggleTeacherCourse,
  updateTeacherCourse,
} from "../api";
import PageLayout from "../components/PageLayout";
import { teacherNavItems } from "../navigation";

function TeacherCoursesPage(props) {
  const { currentUser, onLogout } = props;
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    code: "",
    title: "",
    term: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editForm, setEditForm] = useState({
    code: "",
    title: "",
    term: "",
  });

  useEffect(
    function () {
      let ignore = false;

      async function loadTeacherCourses() {
        setLoading(true);
        setError("");

        try {
          const coursesData = await fetchTeacherCourses(currentUser.id);

          if (!ignore) {
            setCourses(coursesData);
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

  function startEdit(course) {
    setEditingCourseId(course.id);
    setEditForm({
      code: course.code,
      title: course.title,
      term: course.term,
    });
    setMessage("");
    setError("");
  }

  function cancelEdit() {
    setEditingCourseId(null);
    setEditForm({
      code: "",
      title: "",
      term: "",
    });
  }

  function handleEditChange(event) {
    const { name, value } = event.target;
    setEditForm(function (currentForm) {
      return {
        ...currentForm,
        [name]: value,
      };
    });
  }

  async function handleEditSubmit(event, courseId) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const data = await updateTeacherCourse(currentUser.id, courseId, editForm);

      setCourses(function (currentCourses) {
        return currentCourses.map(function (course) {
          if (course.id === courseId) {
            return data.course;
          }

          return course;
        });
      });

      setMessage("Teacher course updated successfully.");
      cancelEdit();
    } catch (editError) {
      setError(editError.message);
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
      subtitle="Teacher course manager"
      navItems={teacherNavItems}
      onLogout={onLogout}
      pageClassName="course-page"
      headerBadge={
        <div>
          <span className="badge-label">My Courses</span>
          <strong>{courses.length}</strong>
        </div>
      }
      menuExtra={
        <div>
          <h3>Separated Flow</h3>
          <p>This page is now only for creating and managing course sections.</p>
        </div>
      }
    >
      {message ? <p className="status-message success-message">{message}</p> : null}
      {error ? <p className="status-message error-message">{error}</p> : null}

      <div className="content-grid">
        <section className="card">
          <div className="card-header">
            <h2>Create a Course</h2>
            <p>Save one teacher course section at a time.</p>
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
            <p>Edit and enable/disable your existing courses.</p>
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

                    <div className="pill-group">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={function () {
                          startEdit(course);
                        }}
                      >
                        Edit
                      </button>
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
                  </div>

                  <p>Term: {course.term}</p>
                  <p>Status: {course.enabled ? "Enabled" : "Disabled"}</p>

                  {editingCourseId === course.id ? (
                    <form
                      className="form-card"
                      onSubmit={function (event) {
                        handleEditSubmit(event, course.id);
                      }}
                    >
                      <div className="form-grid">
                        <label htmlFor={`edit-code-${course.id}`}>Course Code</label>
                        <input
                          id={`edit-code-${course.id}`}
                          name="code"
                          value={editForm.code}
                          onChange={handleEditChange}
                          required
                        />

                        <label htmlFor={`edit-title-${course.id}`}>Course Title</label>
                        <input
                          id={`edit-title-${course.id}`}
                          name="title"
                          value={editForm.title}
                          onChange={handleEditChange}
                          required
                        />

                        <label htmlFor={`edit-term-${course.id}`}>Term</label>
                        <input
                          id={`edit-term-${course.id}`}
                          name="term"
                          value={editForm.term}
                          onChange={handleEditChange}
                          required
                        />
                      </div>

                      <div className="pill-group">
                        <button type="submit" className="primary-button">
                          Save Changes
                        </button>
                        <button type="button" className="secondary-button" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

export default TeacherCoursesPage;
