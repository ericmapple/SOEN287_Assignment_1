import { useEffect, useState } from "react";

import { createTeacherTemplate, fetchTeacherCourses, fetchTeacherTemplates } from "../api";
import PageLayout from "../components/PageLayout";
import { teacherNavItems } from "../navigation";

function TeacherTemplatesPage(props) {
  const { currentUser, onLogout } = props;
  const [templates, setTemplates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    name: "",
    courseCode: "",
    categories: [
      { name: "Assignment", weight: "" },
      { name: "Exam", weight: "" },
    ],
  });
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
          const [templatesData, coursesData] = await Promise.all([
            fetchTeacherTemplates(currentUser.id),
            fetchTeacherCourses(currentUser.id),
          ]);

          if (!ignore) {
            setTemplates(templatesData);
            setCourses(coursesData);
            setForm(function (currentForm) {
              return {
                ...currentForm,
                courseCode: currentForm.courseCode || coursesData[0]?.code || "",
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

  function handleBasicChange(event) {
    const { name, value } = event.target;

    setForm(function (currentForm) {
      return {
        ...currentForm,
        [name]: value,
      };
    });
  }

  function handleCategoryChange(index, field, value) {
    setForm(function (currentForm) {
      const nextCategories = currentForm.categories.map(function (category, currentIndex) {
        if (currentIndex !== index) {
          return category;
        }

        return {
          ...category,
          [field]: value,
        };
      });

      return {
        ...currentForm,
        categories: nextCategories,
      };
    });
  }

  function addCategoryRow() {
    setForm(function (currentForm) {
      return {
        ...currentForm,
        categories: [...currentForm.categories, { name: "", weight: "" }],
      };
    });
  }

  function removeCategoryRow(index) {
    setForm(function (currentForm) {
      return {
        ...currentForm,
        categories: currentForm.categories.filter(function (_, currentIndex) {
          return currentIndex !== index;
        }),
      };
    });
  }

  function getTotalWeight() {
    return form.categories.reduce(function (sum, category) {
      const parsedWeight = Number(category.weight);
      if (Number.isNaN(parsedWeight)) {
        return sum;
      }
      return sum + parsedWeight;
    }, 0);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const payload = {
        name: form.name,
        courseCode: form.courseCode,
        categories: form.categories.map(function (category) {
          return {
            name: category.name,
            weight: category.weight,
          };
        }),
      };

      const data = await createTeacherTemplate(currentUser.id, payload);
      setTemplates(function (currentTemplates) {
        return [...currentTemplates, data.template];
      });
      setForm(function (currentForm) {
        return {
          ...currentForm,
          name: "",
          categories: [
            { name: "Assignment", weight: "" },
            { name: "Exam", weight: "" },
          ],
        };
      });
      setMessage("Template created successfully.");
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <PageLayout
      currentUser={currentUser}
      title="Templates"
      subtitle="Teacher grading templates"
      navItems={teacherNavItems}
      onLogout={onLogout}
      pageClassName="course-page"
      headerBadge={
        <div>
          <span className="badge-label">Saved Templates</span>
          <strong>{templates.length}</strong>
        </div>
      }
      menuExtra={
        <div>
          <h3>Reusable Setup</h3>
          <p>Create category/weight templates that sum to 100%.</p>
        </div>
      }
    >
      {message ? <p className="status-message success-message">{message}</p> : null}
      {error ? <p className="status-message error-message">{error}</p> : null}
      {loading ? <p className="status-message">Loading templates...</p> : null}

      <div className="content-grid">
        <section className="card">
          <div className="card-header">
            <h2>Create Template</h2>
            <p>Use this page only for template setup.</p>
          </div>

          {courses.length === 0 ? (
            <p className="empty-state">Create a teacher course first.</p>
          ) : (
            <form className="form-card" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label htmlFor="name">Template Name</label>
                <input id="name" name="name" value={form.name} onChange={handleBasicChange} required />

                <label htmlFor="courseCode">Course Code</label>
                <select
                  id="courseCode"
                  name="courseCode"
                  value={form.courseCode}
                  onChange={handleBasicChange}
                  required
                >
                  {courses.map(function (course) {
                    return (
                      <option key={course.id} value={course.code}>
                        {course.code}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="course-summary-list">
                {form.categories.map(function (category, index) {
                  return (
                    <article key={`category-${index}`} className="course-summary-card">
                      <div className="form-grid">
                        <label htmlFor={`category-name-${index}`}>Category Name</label>
                        <input
                          id={`category-name-${index}`}
                          value={category.name}
                          onChange={function (event) {
                            handleCategoryChange(index, "name", event.target.value);
                          }}
                          required
                        />

                        <label htmlFor={`category-weight-${index}`}>Weight (%)</label>
                        <input
                          type="number"
                          id={`category-weight-${index}`}
                          value={category.weight}
                          min="0"
                          step="0.01"
                          onChange={function (event) {
                            handleCategoryChange(index, "weight", event.target.value);
                          }}
                          required
                        />
                      </div>

                      {form.categories.length > 1 ? (
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={function () {
                            removeCategoryRow(index);
                          }}
                        >
                          Remove Category
                        </button>
                      ) : null}
                    </article>
                  );
                })}
              </div>

              <div className="pill-group">
                <span className="pill">Current Total: {getTotalWeight()}%</span>
                <button type="button" className="secondary-button" onClick={addCategoryRow}>
                  Add Category
                </button>
                <button type="submit" className="primary-button">
                  Save Template
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <h2>Saved Templates</h2>
            <p>Templates loaded from backend storage.</p>
          </div>

          {templates.length === 0 ? (
            <p className="empty-state">No templates created yet.</p>
          ) : (
            <div className="course-summary-list">
              {templates.map(function (template) {
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
              })}
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  );
}

export default TeacherTemplatesPage;
