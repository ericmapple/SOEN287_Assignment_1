const express = require("express");
//t To let React connect with Express
const cors = require("cors");

const { readJSON, writeJSON, makeId } = require("./fileManager");
const { calculateAverage, calculateProgress, getUpcomingAssessments } = require("./calc");

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const HOST = "127.0.0.1";

// Let the React frontend talk to this backend
app.use(cors());

// Let Express read JSON body data
app.use(express.json());

// Also allow normal form-style body data
app.use(express.urlencoded({ extended: false }));


// Accessors
function getUsers() {
  return readJSON("users.json");
}

function saveUsers(users) {
  writeJSON("users.json", users);
}

function getCourses() {
  return readJSON("courses.json");
}

function saveCourses(courses) {
  writeJSON("courses.json", courses);
}

function getAssessments() {
  return readJSON("assessments.json");
}

function saveAssessments(assessments) {
  writeJSON("assessments.json", assessments);
}

function getTemplates() {
  return readJSON("templates.json");
}

function saveTemplates(templates) {
  writeJSON("templates.json", templates);
}

// Find the current user from the request
// keep it simple: the frontend sends the user id
function getCurrentUser(req) {
  const userId = req.header("x-user-id") || req.body.userId || req.query.userId;

  if (!userId) {
    return null;
  }

  const users = getUsers();

  for (let i = 0; i < users.length; i++) {
    if (users[i].id === userId) {
      return users[i];
    }
  }

  return null;
}

function sendUnauthorized(res, message) {
  return res.status(401).json({ message: message });
}

function sendForbidden(res, message) {
  return res.status(403).json({ message: message });
}

function sendBadRequest(res, message) {
  return res.status(400).json({ message: message });
}

// Remove password before sending user data back
function cleanUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

/*
  TEST ROUTE
*/

app.get("/", function (req, res) {
  res.send("Backend is running.");
});





/*
  AUTH
*/

app.post("/api/register", function (req, res) {
  let { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return sendBadRequest(res, "Name, email, password, and role are required.");
  }

  name = String(name).trim();
  email = String(email).trim().toLowerCase();
  password = String(password).trim();
  role = String(role).trim().toLowerCase();

  if (name === "" || email === "" || password === "") {
    return sendBadRequest(res, "Fields cannot be empty.");
  }

  if (role !== "student" && role !== "teacher") {
    return sendBadRequest(res, "Role must be student or teacher.");
  }

  const users = getUsers();

  // Make sure the same email is not used twice
  for (let i = 0; i < users.length; i++) {
    if (users[i].email === email) {
      return sendBadRequest(res, "This email already exists.");
    }
  }

  const newUser = {
    id: makeId("u"),
    name: name,
    email: email,
    password: password,
    role: role,
  };

  users.push(newUser);
  saveUsers(users);

  res.status(201).json({
    message: "Registration successful.",
    user: cleanUser(newUser),
  });
});

app.post("/api/login", function (req, res) {
  let { email, password } = req.body;

  if (!email || !password) {
    return sendBadRequest(res, "Email and password are required.");
  }

  email = String(email).trim().toLowerCase();
  password = String(password).trim();

  const users = getUsers();

  for (let i = 0; i < users.length; i++) {
    if (users[i].email === email && users[i].password === password) {
      return res.json({
        message: "Login successful.",
        user: cleanUser(users[i]),
      });
    }
  }

  return sendUnauthorized(res, "Invalid email or password.");
});

app.get("/api/me", function (req, res) {
  const user = getCurrentUser(req);

  if (!user) {
    return sendUnauthorized(res, "You are not logged in.");
  }

  res.json({
    user: cleanUser(user),
  });
});








/*
  STUDENT COURSES
*/

app.get("/api/student/courses", function (req, res) {
  const user = getCurrentUser(req);

  if (!user) {
    return sendUnauthorized(res, "Please log in first.");
  }

  if (user.role !== "student") {
    return sendForbidden(res, "Only students can access this route.");
  }

  const courses = getCourses();

  const studentCourses = courses.filter(function (course) {
    return course.ownerId === user.id && course.ownerRole === "student";
  });

  res.json(studentCourses);
});

app.post("/api/student/courses", function (req, res) {
  const user = getCurrentUser(req);

  if (!user) {
    return sendUnauthorized(res, "Please log in first.");
  }

  if (user.role !== "student") {
    return sendForbidden(res, "Only students can add student courses.");
  }

  let { code, name, instructor, term } = req.body;

  if (!code || !name || !instructor || !term) {
    return sendBadRequest(
      res,
      "Course code, name, instructor, and term are required."
    );
  }

  code = String(code).trim();
  name = String(name).trim();
  instructor = String(instructor).trim();
  term = String(term).trim();

  if (code === "" || name === "" || instructor === "" || term === "") {
    return sendBadRequest(res, "Course fields cannot be empty.");
  }

  const courses = getCourses();

  const newCourse = {
    id: makeId("c"),
    ownerId: user.id,
    ownerRole: "student",
    code: code,
    name: name,
    instructor: instructor,
    term: term,
    enabled: true,
  };

  courses.push(newCourse);
  saveCourses(courses);

  res.status(201).json({
    message: "Course added successfully.",
    course: newCourse,
  });
});

app.patch("/api/student/courses/:id", function (req, res) {
  const user = getCurrentUser(req);

  if (!user) {
    return sendUnauthorized(res, "Please log in first.");
  }

  if (user.role !== "student") {
    return sendForbidden(res, "Only students can edit student courses.");
  }

  const courses = getCourses();

  let course = null;

  for (let i = 0; i < courses.length; i++) {
    if (
      courses[i].id === req.params.id &&
      courses[i].ownerId === user.id &&
      courses[i].ownerRole === "student"
    ) {
      course = courses[i];
      break;
    }
  }

  if (!course) {
    return res.status(404).json({ message: "Course not found." });
  }

  if (req.body.code !== undefined) {
    if (String(req.body.code).trim() === "") {
      return sendBadRequest(res, "Course code cannot be empty.");
    }
    course.code = String(req.body.code).trim();
  }

  if (req.body.name !== undefined) {
    if (String(req.body.name).trim() === "") {
      return sendBadRequest(res, "Course name cannot be empty.");
    }
    course.name = String(req.body.name).trim();
  }

  if (req.body.instructor !== undefined) {
    if (String(req.body.instructor).trim() === "") {
      return sendBadRequest(res, "Instructor cannot be empty.");
    }
    course.instructor = String(req.body.instructor).trim();
  }

  if (req.body.term !== undefined) {
    if (String(req.body.term).trim() === "") {
      return sendBadRequest(res, "Term cannot be empty.");
    }
    course.term = String(req.body.term).trim();
  }

  saveCourses(courses);

  res.json({
    message: "Course updated successfully.",
    course: course,
  });
});

app.delete("/api/student/courses/:id", function (req, res) {
  const user = getCurrentUser(req);

  if (!user) {
    return sendUnauthorized(res, "Please log in first.");
  }

  if (user.role !== "student") {
    return sendForbidden(res, "Only students can delete student courses.");
  }

  const courses = getCourses();
  const assessments = getAssessments();

  const updatedCourses = courses.filter(function (course) {
    return !(
      course.id === req.params.id &&
      course.ownerId === user.id &&
      course.ownerRole === "student"
    );
  });

  if (updatedCourses.length === courses.length) {
    return res.status(404).json({ message: "Course not found." });
  }

  // Also delete that course's assessments
  const updatedAssessments = assessments.filter(function (assessment) {
    return !(assessment.courseId === req.params.id && assessment.ownerId === user.id);
  });

  saveCourses(updatedCourses);
  saveAssessments(updatedAssessments);

  res.json({
    message: "Course deleted successfully.",
  });
});







/*
  STUDENT ASSESSMENTS
*/

app.get("/api/student/assessments", function (req, res) {
  const user = getCurrentUser(req);

  if (!user) {
    return sendUnauthorized(res, "Please log in first.");
  }

  if (user.role !== "student") {
    return sendForbidden(res, "Only students can access assessments.");
  }

  const courseId = req.query.courseId;
  const assessments = getAssessments();

  let studentAssessments = assessments.filter(function (assessment) {
    return assessment.ownerId === user.id;
  });

  if (courseId) {
    studentAssessments = studentAssessments.filter(function (assessment) {
      return assessment.courseId === courseId;
    });
  }

  res.json(studentAssessments);
});

app.post("/api/student/assessments", function (req, res) {
  const user = getCurrentUser(req);

  if (!user) {
    return sendUnauthorized(res, "Please log in first.");
  }

  if (user.role !== "student") {
    return sendForbidden(res, "Only students can add assessments.");
  }

  let {
    courseId,
    title,
    category,
    weight,
    earnedMarks,
    totalMarks,
    dueDate,
    status,
  } = req.body;

  if (!courseId || !title || !category || !weight || !totalMarks || !dueDate) {
    return sendBadRequest(
      res,
      "courseId, title, category, weight, totalMarks, and dueDate are required."
    );
  }

  const courses = getCourses();
  let courseExists = false;

  // Make sure the course belongs to this student
  for (let i = 0; i < courses.length; i++) {
    if (
      courses[i].id === courseId &&
      courses[i].ownerId === user.id &&
      courses[i].ownerRole === "student"
    ) {
      courseExists = true;
      break;
    }
  }

  if (!courseExists) {
    return res.status(404).json({ message: "Course not found." });
  }

  title = String(title).trim();
  category = String(category).trim();
  dueDate = String(dueDate).trim();
  status = status ? String(status).trim().toLowerCase() : "pending";

  const weightNumber = Number(weight);
  const totalMarksNumber = Number(totalMarks);
  const earnedMarksNumber = earnedMarks === "" || earnedMarks === undefined || earnedMarks === null
      ? null
      : Number(earnedMarks);

  if (title === "" || category === "" || dueDate === "") {
    return sendBadRequest(res, "Text fields cannot be empty.");
  }

  if (Number.isNaN(weightNumber) || weightNumber < 0) {
    return sendBadRequest(res, "Weight must be a valid non-negative number.");
  }

  if (Number.isNaN(totalMarksNumber) || totalMarksNumber <= 0) {
    return sendBadRequest(res, "Total marks must be greater than 0.");
  }

  if (
    earnedMarksNumber !== null &&
    (Number.isNaN(earnedMarksNumber) ||
      earnedMarksNumber < 0 ||
      earnedMarksNumber > totalMarksNumber)
  ) {
    return sendBadRequest(
      res,
      "Earned marks must be between 0 and total marks."
    );
  }

  if (status !== "pending" && status !== "completed") {
    return sendBadRequest(res, "Status must be pending or completed.");
  }

  const assessments = getAssessments();

  const newAssessment = {
    id: makeId("a"),
    ownerId: user.id,
    courseId: courseId,
    title: title,
    category: category,
    weight: weightNumber,
    earnedMarks: earnedMarksNumber,
    totalMarks: totalMarksNumber,
    dueDate: dueDate,
    status: status,
  };

  assessments.push(newAssessment);
  saveAssessments(assessments);

  res.status(201).json({
    message: "Assessment added successfully.",
    assessment: newAssessment,
  });
});

app.patch("/api/student/assessments/:id", function (req, res) {
  const user = getCurrentUser(req);

  if (!user) {
    return sendUnauthorized(res, "Please log in first.");
  }

  if (user.role !== "student") {
    return sendForbidden(res, "Only students can edit assessments.");
  }

  const assessments = getAssessments();

  let assessment = null;

  for (let i = 0; i < assessments.length; i++) {
    if (
      assessments[i].id === req.params.id &&
      assessments[i].ownerId === user.id
    ) {
      assessment = assessments[i];
      break;
    }
  }

  if (!assessment) {
    return res.status(404).json({ message: "Assessment not found." });
  }

  if (req.body.title !== undefined) {
    if (String(req.body.title).trim() === "") {
      return sendBadRequest(res, "Title cannot be empty.");
    }
    assessment.title = String(req.body.title).trim();
  }

  if (req.body.category !== undefined) {
    if (String(req.body.category).trim() === "") {
      return sendBadRequest(res, "Category cannot be empty.");
    }
    assessment.category = String(req.body.category).trim();
  }

  if (req.body.weight !== undefined) {
    const weightNumber = Number(req.body.weight);
    if (Number.isNaN(weightNumber) || weightNumber < 0) {
      return sendBadRequest(res, "Weight must be a valid non-negative number.");
    }
    assessment.weight = weightNumber;
  }

  if (req.body.totalMarks !== undefined) {
    const totalMarksNumber = Number(req.body.totalMarks);
    if (Number.isNaN(totalMarksNumber) || totalMarksNumber <= 0) {
      return sendBadRequest(res, "Total marks must be greater than 0.");
    }
    assessment.totalMarks = totalMarksNumber;
  }

  if (req.body.earnedMarks !== undefined) {
    if (req.body.earnedMarks === "" || req.body.earnedMarks === null) {
      assessment.earnedMarks = null;
    } else {
      const earnedMarksNumber = Number(req.body.earnedMarks);
      if (Number.isNaN(earnedMarksNumber) || earnedMarksNumber < 0) {
        return sendBadRequest(res, "Earned marks must be a valid non-negative number.");
      }
      assessment.earnedMarks = earnedMarksNumber;
    }
  }

  if (
    assessment.earnedMarks !== null &&
    assessment.earnedMarks > assessment.totalMarks
  ) {
    return sendBadRequest(res, "Earned marks cannot be greater than total marks.");
  }

  if (req.body.dueDate !== undefined) {
    if (String(req.body.dueDate).trim() === "") {
      return sendBadRequest(res, "Due date cannot be empty.");
    }
    assessment.dueDate = String(req.body.dueDate).trim();
  }

  if (req.body.status !== undefined) {
    const newStatus = String(req.body.status).trim().toLowerCase();
    if (newStatus !== "pending" && newStatus !== "completed") {
      return sendBadRequest(res, "Status must be pending or completed.");
    }
    assessment.status = newStatus;
  }

  saveAssessments(assessments);

  res.json({
    message: "Assessment updated successfully.",
    assessment: assessment,
  });
});

app.delete("/api/student/assessments/:id", function (req, res) {
  const user = getCurrentUser(req);

  if (!user) {
    return sendUnauthorized(res, "Please log in first.");
  }

  if (user.role !== "student") {
    return sendForbidden(res, "Only students can delete assessments.");
  }

  const assessments = getAssessments();

  const updatedAssessments = assessments.filter(function (assessment) {
    return !(assessment.id === req.params.id && assessment.ownerId === user.id);
  });

  if (updatedAssessments.length === assessments.length) {
    return res.status(404).json({ message: "Assessment not found." });
  }

  saveAssessments(updatedAssessments);

  res.json({
    message: "Assessment deleted successfully.",
  });
});









/*
  STUDENT DASHBOARD
  Server does the calculations here
*/

app.get("/api/student/dashboard", function (req, res) {
  const user = getCurrentUser(req);

  if (!user) {
    return sendUnauthorized(res, "Please log in first.");
  }

  if (user.role !== "student") {
    return sendForbidden(res, "Only students can access the student dashboard.");
  }

  const courses = getCourses().filter(function (course) {
    return course.ownerId === user.id && course.ownerRole === "student";
  });

  const assessments = getAssessments().filter(function (assessment) {
    return assessment.ownerId === user.id;
  });

  const courseSummaries = [];

  for (let i = 0; i < courses.length; i++) {
    const currentCourse = courses[i];

    const courseAssessments = assessments.filter(function (assessment) {
      return assessment.courseId === currentCourse.id;
    });

    courseSummaries.push({
      id: currentCourse.id,
      code: currentCourse.code,
      name: currentCourse.name,
      instructor: currentCourse.instructor,
      term: currentCourse.term,
      currentAverage: calculateAverage(courseAssessments),
      progress: calculateProgress(courseAssessments),
    });
  }

  const upcomingAssessments = getUpcomingAssessments(assessments);

  res.json({
    student: cleanUser(user),
    courses: courseSummaries,
    upcomingAssessments: upcomingAssessments,
  });
});

/*
  TEACHER COURSES
*/

app.get("/api/teacher/courses", function (req, res) {
  const user = getCurrentUser(req);

  if (!user) {
    return sendUnauthorized(res, "Please log in first.");
  }

  if (user.role !== "teacher") {
    return sendForbidden(res, "Only teachers can access this route.");
  }

  const courses = getCourses();

  const teacherCourses = courses.filter(function (course) {
    return course.ownerId === user.id && course.ownerRole === "teacher";
  });

  res.json(teacherCourses);
});

app.post("/api/teacher/courses", function (req, res) {
  const user = getCurrentUser(req);

  if (!user) {
    return sendUnauthorized(res, "Please log in first.");
  }

  if (user.role !== "teacher") {
    return sendForbidden(res, "Only teachers can add teacher courses.");
  }

  let { code, title, term } = req.body;

  if (!code || !title || !term) {
    return sendBadRequest(res, "Code, title, and term are required.");
  }

  code = String(code).trim();
  title = String(title).trim();
  term = String(term).trim();

  if (code === "" || title === "" || term === "") {
    return sendBadRequest(res, "Course fields cannot be empty.");
  }

  const courses = getCourses();

  const newCourse = {
    id: makeId("tc"),
    ownerId: user.id,
    ownerRole: "teacher",
    code: code,
    title: title,
    term: term,
    enabled: true,
  };

  courses.push(newCourse);
  saveCourses(courses);

  res.status(201).json({
    message: "Teacher course created successfully.",
    course: newCourse,
  });
});

app.patch("/api/teacher/courses/:id", function (req, res) {
  const user = getCurrentUser(req);

  if (!user) {
    return sendUnauthorized(res, "Please log in first.");
  }

  if (user.role !== "teacher") {
    return sendForbidden(res, "Only teachers can edit teacher courses.");
  }

  const courses = getCourses();

  let course = null;

  for (let i = 0; i < courses.length; i++) {
    if (
      courses[i].id === req.params.id &&
      courses[i].ownerId === user.id &&
      courses[i].ownerRole === "teacher"
    ) {
      course = courses[i];
      break;
    }
  }

  if (!course) {
    return res.status(404).json({ message: "Teacher course not found." });
  }

  if (req.body.code !== undefined) {
    if (String(req.body.code).trim() === "") {
      return sendBadRequest(res, "Code cannot be empty.");
    }
    course.code = String(req.body.code).trim();
  }

  if (req.body.title !== undefined) {
    if (String(req.body.title).trim() === "") {
      return sendBadRequest(res, "Title cannot be empty.");
    }
    course.title = String(req.body.title).trim();
  }

  if (req.body.term !== undefined) {
    if (String(req.body.term).trim() === "") {
      return sendBadRequest(res, "Term cannot be empty.");
    }
    course.term = String(req.body.term).trim();
  }

  saveCourses(courses);

  res.json({
    message: "Teacher course updated successfully.",
    course: course,
  });
});

app.patch("/api/teacher/courses/:id/toggle", function (req, res) {
  const user = getCurrentUser(req);

  if (!user) {
    return sendUnauthorized(res, "Please log in first.");
  }

  if (user.role !== "teacher") {
    return sendForbidden(res, "Only teachers can toggle courses.");
  }

  const courses = getCourses();

  let course = null;

  for (let i = 0; i < courses.length; i++) {
    if (
      courses[i].id === req.params.id &&
      courses[i].ownerId === user.id &&
      courses[i].ownerRole === "teacher"
    ) {
      course = courses[i];
      break;
    }
  }

  if (!course) {
    return res.status(404).json({ message: "Teacher course not found." });
  }

  course.enabled = !course.enabled;
  saveCourses(courses);

  res.json({
    message: "Course status changed successfully.",
    course: course,
  });
});






/*
  TEACHER TEMPLATES
*/

app.get("/api/teacher/templates", function (req, res) {
  const user = getCurrentUser(req);

  if (!user) {
    return sendUnauthorized(res, "Please log in first.");
  }

  if (user.role !== "teacher") {
    return sendForbidden(res, "Only teachers can access templates.");
  }

  const templates = getTemplates().filter(function (template) {
    return template.ownerId === user.id;
  });

  res.json(templates);
});

app.post("/api/teacher/templates", function (req, res) {
  const user = getCurrentUser(req);

  if (!user) {
    return sendUnauthorized(res, "Please log in first.");
  }

  if (user.role !== "teacher") {
    return sendForbidden(res, "Only teachers can create templates.");
  }

  let { name, courseCode, categories } = req.body;

  if (!name || !courseCode || !Array.isArray(categories)) {
    return sendBadRequest(res, "name, courseCode, and categories are required.");
  }

  name = String(name).trim();
  courseCode = String(courseCode).trim();

  if (name === "" || courseCode === "") {
    return sendBadRequest(res, "Template name and course code cannot be empty.");
  }

  if (categories.length === 0) {
    return sendBadRequest(res, "At least one category is required.");
  }

  let totalWeight = 0;

  for (let i = 0; i < categories.length; i++) {
    if (
      categories[i].name === undefined ||
      categories[i].weight === undefined
    ) {
      return sendBadRequest(res, "Each category needs a name and a weight.");
    }

    categories[i].name = String(categories[i].name).trim();
    categories[i].weight = Number(categories[i].weight);

    if (categories[i].name === "") {
      return sendBadRequest(res, "Category name cannot be empty.");
    }

    if (Number.isNaN(categories[i].weight) || categories[i].weight < 0) {
      return sendBadRequest(res, "Category weight must be a valid number.");
    }

    totalWeight += categories[i].weight;
  }

  if (totalWeight !== 100) {
    return sendBadRequest(res, "Total category weights must equal 100.");
  }

  const templates = getTemplates();

  const newTemplate = {
    id: makeId("t"),
    ownerId: user.id,
    name: name,
    courseCode: courseCode,
    categories: categories,
  };

  templates.push(newTemplate);
  saveTemplates(templates);

  res.status(201).json({
    message: "Template created successfully.",
    template: newTemplate,
  });
});






/*
  TEACHER GRADEBOOK
*/

app.get("/api/teacher/gradebook", function (req, res) {
  const user = getCurrentUser(req);

  if (!user) {
    return sendUnauthorized(res, "Please log in first.");
  }

  if (user.role !== "teacher") {
    return sendForbidden(res, "Only teachers can access the gradebook.");
  }

  const users = getUsers();
  const teacherCourses = getCourses().filter(function (course) {
    return course.ownerId === user.id && course.ownerRole === "teacher";
  });
  const studentCourses = getCourses().filter(function (course) {
    return course.ownerRole === "student";
  });
  const assessments = getAssessments();

  const gradebookCourses = teacherCourses.map(function (teacherCourse) {
    const matchingStudentCourses = studentCourses.filter(function (studentCourse) {
      return studentCourse.code === teacherCourse.code;
    });

    const studentSummaries = matchingStudentCourses.map(function (studentCourse) {
      const relatedUser = users.find(function (currentUser) {
        return currentUser.id === studentCourse.ownerId;
      });
      const studentAssessments = assessments.filter(function (assessment) {
        return assessment.courseId === studentCourse.id;
      });

      return {
        studentId: relatedUser ? relatedUser.id : studentCourse.ownerId,
        studentName: relatedUser ? relatedUser.name : "Unknown Student",
        average: calculateAverage(studentAssessments),
        progress: calculateProgress(studentAssessments),
        completedAssessments: studentAssessments.filter(function (assessment) {
          return assessment.status === "completed";
        }).length,
        totalAssessments: studentAssessments.length,
      };
    });

    const relatedStudentCourseIds = matchingStudentCourses.map(function (course) {
      return course.id;
    });
    const relatedAssessments = assessments.filter(function (assessment) {
      return relatedStudentCourseIds.includes(assessment.courseId);
    });
    const assessmentMap = {};

    for (let i = 0; i < relatedAssessments.length; i++) {
      const assessment = relatedAssessments[i];

      if (!assessmentMap[assessment.title]) {
        assessmentMap[assessment.title] = {
          title: assessment.title,
          submissions: 0,
          totalScore: 0,
          scoredCount: 0,
        };
      }

      if (
        typeof assessment.earnedMarks === "number" &&
        typeof assessment.totalMarks === "number" &&
        assessment.totalMarks > 0
      ) {
        assessmentMap[assessment.title].submissions += 1;
        assessmentMap[assessment.title].totalScore +=
          (assessment.earnedMarks / assessment.totalMarks) * 100;
        assessmentMap[assessment.title].scoredCount += 1;
      }
    }

    const assessmentSummaries = Object.values(assessmentMap).map(function (summary) {
      return {
        title: summary.title,
        averageScore:
          summary.scoredCount === 0
            ? 0
            : Number((summary.totalScore / summary.scoredCount).toFixed(2)),
        submissions: summary.submissions,
        totalStudents: matchingStudentCourses.length,
      };
    });

    const totalAverage =
      studentSummaries.length === 0
        ? 0
        : Number(
            (
              studentSummaries.reduce(function (sum, summary) {
                return sum + summary.average;
              }, 0) / studentSummaries.length
            ).toFixed(2)
          );

    const totalProgress =
      studentSummaries.length === 0
        ? 0
        : Number(
            (
              studentSummaries.reduce(function (sum, summary) {
                return sum + summary.progress;
              }, 0) / studentSummaries.length
            ).toFixed(2)
          );

    return {
      id: teacherCourse.id,
      code: teacherCourse.code,
      title: teacherCourse.title,
      term: teacherCourse.term,
      enabled: teacherCourse.enabled,
      totalStudents: matchingStudentCourses.length,
      average: totalAverage,
      progress: totalProgress,
      students: studentSummaries,
      assessments: assessmentSummaries,
    };
  });

  res.json({
    teacher: cleanUser(user),
    courses: gradebookCourses,
  });
});

/*
  TEACHER STATS
*/

app.get("/api/teacher/stats", function (req, res) {
  const user = getCurrentUser(req);

  if (!user) {
    return sendUnauthorized(res, "Please log in first.");
  }

  if (user.role !== "teacher") {
    return sendForbidden(res, "Only teachers can access stats.");
  }

  const teacherCourses = getCourses().filter(function (course) {
    return course.ownerId === user.id && course.ownerRole === "teacher";
  });

  const studentCourses = getCourses().filter(function (course) {
    return course.ownerRole === "student";
  });

  const assessments = getAssessments();

  const teacherCourseCodes = teacherCourses.map(function (course) {
    return course.code;
  });

  const relatedStudentCourses = studentCourses.filter(function (course) {
    return teacherCourseCodes.includes(course.code);
  });

  const relatedStudentCourseIds = relatedStudentCourses.map(function (course) {
    return course.id;
  });

  const relatedAssessments = assessments.filter(function (assessment) {
    return relatedStudentCourseIds.includes(assessment.courseId);
  });

  let completedCount = 0;

  for (let i = 0; i < relatedAssessments.length; i++) {
    if (relatedAssessments[i].status === "completed") {
      completedCount++;
    }
  }

  const completionPercentage =
    relatedAssessments.length === 0
      ? 0
      : Number(((completedCount / relatedAssessments.length) * 100).toFixed(2));

  res.json({
    totalTeacherCourses: teacherCourses.length,
    totalRelatedStudentCourses: relatedStudentCourses.length,
    totalRelatedAssessments: relatedAssessments.length,
    completionPercentage: completionPercentage,
  });
});

const server = app.listen(PORT, HOST, function () {
  console.log("Server running on http://" + HOST + ":" + PORT);
});

server.on("error", function (error) {
  console.error("Server failed to start:", error.message);
  process.exit(1);
});




// // ====== USER SESSION ======

// app.use(session({ secret: 'mySecret', resave: false, saveUninitialized: true }));

// app.get("/setSession", (request, response) => { 
//   request.session.user = "John";
//   response.send("Session set");
// });

// app.get("/getSession", (request, response) => {
//   const user = request.session.user;
//   response.send(user);
// });
