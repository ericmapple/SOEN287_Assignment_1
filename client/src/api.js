const ENV_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").trim();
const API_BASE_URL = ENV_API_BASE_URL || "http://localhost:5000";

const FALLBACK_API_BASE_URLS = [
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  "http://localhost:5050",
  "http://127.0.0.1:5050",
];

function normalizeBaseUrl(url) {
  return String(url || "").replace(/\/+$/, "");
}

function getCandidateBaseUrls() {
  const urls = [];

  if (ENV_API_BASE_URL) {
    urls.push(normalizeBaseUrl(ENV_API_BASE_URL));
  }

  for (let i = 0; i < FALLBACK_API_BASE_URLS.length; i++) {
    const fallbackUrl = normalizeBaseUrl(FALLBACK_API_BASE_URLS[i]);

    if (!urls.includes(fallbackUrl)) {
      urls.push(fallbackUrl);
    }
  }

  return urls;
}

async function apiRequest(path, options = {}) {
  const { method = "GET", body, headers = {}, userId } = options;
  const requestHeaders = { ...headers };
  const candidateBaseUrls = getCandidateBaseUrls();
  let response = null;

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (userId) {
    requestHeaders["x-user-id"] = userId;
  }

  for (let i = 0; i < candidateBaseUrls.length; i++) {
    const baseUrl = candidateBaseUrls[i];

    try {
      response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: requestHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      break;
    } catch {
      response = null;
    }
  }

  if (!response) {
    throw new Error(
      "Could not connect to the backend. Start the server and make sure it is reachable on localhost/127.0.0.1 port 5000 or 5050."
    );
  }

  const contentType = response.headers.get("content-type") || "";
  let data = {};

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { message: text } : {};
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

function loginUser(email, password) {
  return apiRequest("/api/login", {
    method: "POST",
    body: { email, password },
  });
}

function fetchCurrentUser(userId) {
  return apiRequest("/api/me", { userId });
}

function fetchStudentDashboard(userId) {
  return apiRequest("/api/student/dashboard", { userId });
}

function fetchStudentCourses(userId) {
  return apiRequest("/api/student/courses", { userId });
}

function createStudentCourse(userId, courseData) {
  return apiRequest("/api/student/courses", {
    method: "POST",
    userId,
    body: courseData,
  });
}

function deleteStudentCourse(userId, courseId) {
  return apiRequest(`/api/student/courses/${courseId}`, {
    method: "DELETE",
    userId,
  });
}

function fetchStudentAssessments(userId) {
  return apiRequest("/api/student/assessments", { userId });
}

function createStudentAssessment(userId, assessmentData) {
  return apiRequest("/api/student/assessments", {
    method: "POST",
    userId,
    body: assessmentData,
  });
}

function fetchTeacherCourses(userId) {
  return apiRequest("/api/teacher/courses", { userId });
}

function createTeacherCourse(userId, courseData) {
  return apiRequest("/api/teacher/courses", {
    method: "POST",
    userId,
    body: courseData,
  });
}

function toggleTeacherCourse(userId, courseId) {
  return apiRequest(`/api/teacher/courses/${courseId}/toggle`, {
    method: "PATCH",
    userId,
  });
}

function fetchTeacherTemplates(userId) {
  return apiRequest("/api/teacher/templates", { userId });
}

function fetchTeacherStats(userId) {
  return apiRequest("/api/teacher/stats", { userId });
}

function fetchTeacherGradebook(userId) {
  return apiRequest("/api/teacher/gradebook", { userId });
}

export {
  API_BASE_URL,
  apiRequest,
  loginUser,
  fetchCurrentUser,
  fetchStudentDashboard,
  fetchStudentCourses,
  createStudentCourse,
  deleteStudentCourse,
  fetchStudentAssessments,
  createStudentAssessment,
  fetchTeacherCourses,
  createTeacherCourse,
  toggleTeacherCourse,
  fetchTeacherTemplates,
  fetchTeacherStats,
  fetchTeacherGradebook,
};
