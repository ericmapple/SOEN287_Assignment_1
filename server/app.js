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

function getStudentCourseById(courseId, courses) {
  for (let i = 0; i < courses.length; i++) {
    if (courses[i].id === courseId && courses[i].ownerRole === "student") {
      return courses[i];
    }
  }

  return null;
}

function getMatchingStudentCoursesForTeacherCourse(teacherCourse, courses) {
  return courses.filter(function (course) {
    return (
      course.ownerRole === "student" &&
      course.code === teacherCourse.code &&
      course.term === teacherCourse.term
    );
  });
}

function getPublishedAssessmentGroupForTeacher(user, assessment, courses, assessments) {
  const assessmentCourse = getStudentCourseById(assessment.courseId, courses);

  if (!assessmentCourse) {
    return null;
  }

  const teacherCourse = courses.find(function (course) {
    return (
      course.ownerId === user.id &&
      course.ownerRole === "teacher" &&
      course.code === assessmentCourse.code &&
      course.term === assessmentCourse.term
    );
  });

  if (!teacherCourse) {
    return null;
  }

  const matchingStudentCourses = getMatchingStudentCoursesForTeacherCourse(teacherCourse, courses);
  const matchingStudentCourseIds = matchingStudentCourses.map(function (course) {
    return course.id;
  });

  const matchingAssessments = assessments.filter(function (currentAssessment) {
    return (
      matchingStudentCourseIds.includes(currentAssessment.courseId) &&
      currentAssessment.title === assessment.title &&
      currentAssessment.category === assessment.category &&
      currentAssessment.weight === assessment.weight &&
      currentAssessment.totalMarks === assessment.totalMarks &&
      currentAssessment.dueDate === assessment.dueDate
    );
  });

  return {
    teacherCourse: teacherCourse,
    matchingStudentCourses: matchingStudentCourses,
    matchingAssessments: matchingAssessments,
  };
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

  return sendForbidden(
    res,
    "Students cannot create assessments. Assessments must be published by a teacher."
  );
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

  const allowedFields = ["status"];
  const bodyKeys = Object.keys(req.body);

  for (let i = 0; i < bodyKeys.length; i++) {
    if (!allowedFields.includes(bodyKeys[i])) {
      return sendForbidden(
        res,
        "Students can only update their own assessment completion status."
      );
    }
  }

  if (req.body.status === undefined) {
    return sendBadRequest(res, "Status is required.");
  }

  const newStatus = String(req.body.status).trim().toLowerCase();

  if (newStatus !== "pending" && newStatus !== "completed") {
    return sendBadRequest(res, "Status must be pending or completed.");
  }

  assessment.status = newStatus;

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

  return sendForbidden(
    res,
    "Students cannot delete assessments. Assessments are managed by the teacher."
  );
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

app.post("/api/teacher/assessments/publish", function (req, res) {
  const user = getCurrentUser(req);

  if (!user) {
    return sendUnauthorized(res, "Please log in first.");
  }

  if (user.role !== "teacher") {
    return sendForbidden(res, "Only teachers can publish assessments.");
  }

  let {
    teacherCourseId,
    title,
    category,
    weight,
    totalMarks,
    dueDate,
    status,
  } = req.body;

  if (!teacherCourseId || !title || !category || !weight || !totalMarks || !dueDate) {
    return sendBadRequest(
      res,
      "teacherCourseId, title, category, weight, totalMarks, and dueDate are required."
    );
  }

  teacherCourseId = String(teacherCourseId).trim();
  title = String(title).trim();
  category = String(category).trim();
  dueDate = String(dueDate).trim();
  status = status ? String(status).trim().toLowerCase() : "pending";

  const weightNumber = Number(weight);
  const totalMarksNumber = Number(totalMarks);

  if (title === "" || category === "" || dueDate === "") {
    return sendBadRequest(res, "Text fields cannot be empty.");
  }

  if (Number.isNaN(weightNumber) || weightNumber < 0) {
    return sendBadRequest(res, "Weight must be a valid non-negative number.");
  }

  if (Number.isNaN(totalMarksNumber) || totalMarksNumber <= 0) {
    return sendBadRequest(res, "Total marks must be greater than 0.");
  }

  if (status !== "pending" && status !== "completed") {
    return sendBadRequest(res, "Status must be pending or completed.");
  }

  const courses = getCourses();
  const assessments = getAssessments();

  const teacherCourse = courses.find(function (course) {
    return (
      course.id === teacherCourseId &&
      course.ownerRole === "teacher" &&
      course.ownerId === user.id
    );
  });

  if (!teacherCourse) {
    return res.status(404).json({ message: "Teacher course not found." });
  }

  const matchingStudentCourses = courses.filter(function (course) {
    return (
      course.ownerRole === "student" &&
      course.code === teacherCourse.code &&
      course.term === teacherCourse.term
    );
  });

  if (matchingStudentCourses.length === 0) {
    return res.status(404).json({
      message: "No student course sections matched this teacher course yet.",
    });
  }

  const createdAssessments = [];
  let skippedCount = 0;

  for (let i = 0; i < matchingStudentCourses.length; i++) {
    const studentCourse = matchingStudentCourses[i];

    const alreadyExists = assessments.some(function (assessment) {
      return (
        assessment.courseId === studentCourse.id &&
        String(assessment.title).toLowerCase() === title.toLowerCase() &&
        String(assessment.dueDate) === dueDate
      );
    });

    if (alreadyExists) {
      skippedCount += 1;
      continue;
    }

    const newAssessment = {
      id: makeId("a"),
      ownerId: studentCourse.ownerId,
      courseId: studentCourse.id,
      title: title,
      category: category,
      weight: weightNumber,
      earnedMarks: null,
      totalMarks: totalMarksNumber,
      dueDate: dueDate,
      status: status,
    };

    assessments.push(newAssessment);
    createdAssessments.push(newAssessment);
  }

  if (createdAssessments.length > 0) {
    saveAssessments(assessments);
  }

  res.status(201).json({
    message: "Assessment publication completed.",
    createdCount: createdAssessments.length,
    skippedCount: skippedCount,
    totalStudentCourses: matchingStudentCourses.length,
    createdAssessments: createdAssessments,
  });
});






app.get("/api/teacher/assessments", function (req, res) {
  const user = getCurrentUser(req);

  if (!user) {
    return sendUnauthorized(res, "Please log in first.");
  }

  if (user.role !== "teacher") {
    return sendForbidden(res, "Only teachers can access assessments.");
  }

  const courses = getCourses();
  const assessments = getAssessments();
  const teacherCourses = courses.filter(function (course) {
    return course.ownerId === user.id && course.ownerRole === "teacher";
  });

  const courseSummaries = teacherCourses.map(function (teacherCourse) {
    const matchingStudentCourses = getMatchingStudentCoursesForTeacherCourse(teacherCourse, courses);
    const matchingStudentCourseIds = matchingStudentCourses.map(function (course) {
      return course.id;
    });
    const relatedAssessments = assessments.filter(function (assessment) {
      return matchingStudentCourseIds.includes(assessment.courseId);
    });
    const assessmentMap = {};

    for (let i = 0; i < relatedAssessments.length; i++) {
      const currentAssessment = relatedAssessments[i];
      const groupKey = [
        currentAssessment.title,
        currentAssessment.category,
        currentAssessment.weight,
        currentAssessment.totalMarks,
        currentAssessment.dueDate,
      ].join("::");

      if (!assessmentMap[groupKey]) {
        assessmentMap[groupKey] = {
          id: currentAssessment.id,
          teacherCourseId: teacherCourse.id,
          title: currentAssessment.title,
          category: currentAssessment.category,
          weight: currentAssessment.weight,
          totalMarks: currentAssessment.totalMarks,
          dueDate: currentAssessment.dueDate,
          assignedStudents: matchingStudentCourses.length,
          createdEntries: 0,
          completedCount: 0,
          gradedCount: 0,
        };
      }

      assessmentMap[groupKey].createdEntries += 1;

      if (currentAssessment.status === "completed") {
        assessmentMap[groupKey].completedCount += 1;
      }

      if (typeof currentAssessment.earnedMarks === "number") {
        assessmentMap[groupKey].gradedCount += 1;
      }
    }

    return {
      id: teacherCourse.id,
      code: teacherCourse.code,
      title: teacherCourse.title,
      term: teacherCourse.term,
      assessments: Object.values(assessmentMap).sort(function (a, b) {
        return String(a.dueDate || "").localeCompare(String(b.dueDate || ""));
      }),
    };
  });

  res.json({
    teacher: cleanUser(user),
    courses: courseSummaries,
  });
});

app.patch("/api/teacher/assessments/:id", function (req, res) {
  const user = getCurrentUser(req);

  if (!user) {
    return sendUnauthorized(res, "Please log in first.");
  }

  if (user.role !== "teacher") {
    return sendForbidden(res, "Only teachers can edit assessments.");
  }

  const assessments = getAssessments();
  const courses = getCourses();
  const assessment = assessments.find(function (item) {
    return item.id === req.params.id;
  });

  if (!assessment) {
    return res.status(404).json({ message: "Assessment not found." });
  }

  const assessmentGroup = getPublishedAssessmentGroupForTeacher(
    user,
    assessment,
    courses,
    assessments
  );

  if (!assessmentGroup || assessmentGroup.matchingAssessments.length === 0) {
    return sendForbidden(res, "You can only edit assessments for your own courses.");
  }

  let nextTitle = assessment.title;
  let nextCategory = assessment.category;
  let nextWeight = assessment.weight;
  let nextTotalMarks = assessment.totalMarks;
  let nextDueDate = assessment.dueDate;
  let nextStatus = assessment.status;

  if (req.body.title !== undefined) {
    if (String(req.body.title).trim() === "") {
      return sendBadRequest(res, "Title cannot be empty.");
    }
    nextTitle = String(req.body.title).trim();
  }

  if (req.body.category !== undefined) {
    if (String(req.body.category).trim() === "") {
      return sendBadRequest(res, "Category cannot be empty.");
    }
    nextCategory = String(req.body.category).trim();
  }

  if (req.body.weight !== undefined) {
    const weightNumber = Number(req.body.weight);
    if (Number.isNaN(weightNumber) || weightNumber < 0) {
      return sendBadRequest(res, "Weight must be a valid non-negative number.");
    }
    nextWeight = weightNumber;
  }

  if (req.body.totalMarks !== undefined) {
    const totalMarksNumber = Number(req.body.totalMarks);
    if (Number.isNaN(totalMarksNumber) || totalMarksNumber <= 0) {
      return sendBadRequest(res, "Total marks must be greater than 0.");
    }

    for (let i = 0; i < assessmentGroup.matchingAssessments.length; i++) {
      const currentAssessment = assessmentGroup.matchingAssessments[i];
      if (
        typeof currentAssessment.earnedMarks === "number" &&
        currentAssessment.earnedMarks > totalMarksNumber
      ) {
        return sendBadRequest(
          res,
          "Total marks cannot be lower than an existing graded score."
        );
      }
    }

    nextTotalMarks = totalMarksNumber;
  }

  if (req.body.dueDate !== undefined) {
    if (String(req.body.dueDate).trim() === "") {
      return sendBadRequest(res, "Due date cannot be empty.");
    }
    nextDueDate = String(req.body.dueDate).trim();
  }

  if (req.body.status !== undefined) {
    const newStatus = String(req.body.status).trim().toLowerCase();
    if (newStatus !== "pending" && newStatus !== "completed") {
      return sendBadRequest(res, "Status must be pending or completed.");
    }
    nextStatus = newStatus;
  }

  for (let i = 0; i < assessmentGroup.matchingAssessments.length; i++) {
    assessmentGroup.matchingAssessments[i].title = nextTitle;
    assessmentGroup.matchingAssessments[i].category = nextCategory;
    assessmentGroup.matchingAssessments[i].weight = nextWeight;
    assessmentGroup.matchingAssessments[i].totalMarks = nextTotalMarks;
    assessmentGroup.matchingAssessments[i].dueDate = nextDueDate;
    assessmentGroup.matchingAssessments[i].status = nextStatus;
  }

  saveAssessments(assessments);

  res.json({
    message: "Assessment updated successfully.",
    updatedCount: assessmentGroup.matchingAssessments.length,
    assessment: assessmentGroup.matchingAssessments[0],
  });
});

app.delete("/api/teacher/assessments/:id", function (req, res) {
  const user = getCurrentUser(req);

  if (!user) {
    return sendUnauthorized(res, "Please log in first.");
  }

  if (user.role !== "teacher") {
    return sendForbidden(res, "Only teachers can delete assessments.");
  }

  const assessments = getAssessments();
  const courses = getCourses();
  const assessment = assessments.find(function (item) {
    return item.id === req.params.id;
  });

  if (!assessment) {
    return res.status(404).json({ message: "Assessment not found." });
  }

  const assessmentGroup = getPublishedAssessmentGroupForTeacher(
    user,
    assessment,
    courses,
    assessments
  );

  if (!assessmentGroup || assessmentGroup.matchingAssessments.length === 0) {
    return sendForbidden(res, "You can only delete assessments for your own courses.");
  }

  const matchingAssessmentIds = assessmentGroup.matchingAssessments.map(function (item) {
    return item.id;
  });
  const updatedAssessments = assessments.filter(function (item) {
    return !matchingAssessmentIds.includes(item.id);
  });

  saveAssessments(updatedAssessments);

  res.json({
    message: "Assessment deleted successfully.",
    deletedCount: matchingAssessmentIds.length,
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
    const studentByCourseId = {};

    for (let i = 0; i < matchingStudentCourses.length; i++) {
      const studentCourse = matchingStudentCourses[i];
      const relatedUser = users.find(function (currentUser) {
        return currentUser.id === studentCourse.ownerId;
      });

      studentByCourseId[studentCourse.id] = {
        id: relatedUser ? relatedUser.id : studentCourse.ownerId,
        name: relatedUser ? relatedUser.name : "Unknown Student",
      };
    }

    const studentSummaries = matchingStudentCourses.map(function (studentCourse) {
      const studentAssessments = assessments.filter(function (assessment) {
        return assessment.courseId === studentCourse.id;
      });
      const relatedStudent = studentByCourseId[studentCourse.id];

      return {
        studentId: relatedStudent.id,
        studentName: relatedStudent.name,
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
    const gradeEntries = relatedAssessments
      .map(function (assessment) {
        const relatedStudent = studentByCourseId[assessment.courseId];

        return {
          id: assessment.id,
          courseId: assessment.courseId,
          studentId: relatedStudent ? relatedStudent.id : "unknown",
          studentName: relatedStudent ? relatedStudent.name : "Unknown Student",
          title: assessment.title,
          category: assessment.category,
          earnedMarks: assessment.earnedMarks,
          totalMarks: assessment.totalMarks,
          dueDate: assessment.dueDate,
          status: assessment.status,
        };
      })
      .sort(function (a, b) {
        if (a.studentName !== b.studentName) {
          return a.studentName.localeCompare(b.studentName);
        }

        return String(a.dueDate || "").localeCompare(String(b.dueDate || ""));
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
      entries: gradeEntries,
    };
  });

  res.json({
    teacher: cleanUser(user),
    courses: gradebookCourses,
  });
});

app.patch("/api/teacher/assessments/:id/grade", function (req, res) {
  const user = getCurrentUser(req);

  if (!user) {
    return sendUnauthorized(res, "Please log in first.");
  }

  if (user.role !== "teacher") {
    return sendForbidden(res, "Only teachers can grade assessments.");
  }

  const assessments = getAssessments();
  const courses = getCourses();
  const assessment = assessments.find(function (item) {
    return item.id === req.params.id;
  });

  if (!assessment) {
    return res.status(404).json({ message: "Assessment not found." });
  }

  const assessmentCourse = courses.find(function (course) {
    return course.id === assessment.courseId && course.ownerRole === "student";
  });

  if (!assessmentCourse) {
    return res.status(404).json({ message: "Student course not found." });
  }

  const teacherOwnsMatchingCourse = courses.some(function (course) {
    return (
      course.ownerId === user.id &&
      course.ownerRole === "teacher" &&
      course.code === assessmentCourse.code
    );
  });

  if (!teacherOwnsMatchingCourse) {
    return sendForbidden(res, "You can only grade assessments for your own courses.");
  }

  if (req.body.earnedMarks !== undefined) {
    if (req.body.earnedMarks === "" || req.body.earnedMarks === null) {
      assessment.earnedMarks = null;
    } else {
      const earnedMarksNumber = Number(req.body.earnedMarks);

      if (
        Number.isNaN(earnedMarksNumber) ||
        earnedMarksNumber < 0 ||
        earnedMarksNumber > assessment.totalMarks
      ) {
        return sendBadRequest(
          res,
          "Earned marks must be between 0 and total marks."
        );
      }

      assessment.earnedMarks = earnedMarksNumber;
    }
  }

  if (req.body.status !== undefined) {
    const nextStatus = String(req.body.status).trim().toLowerCase();

    if (nextStatus !== "pending" && nextStatus !== "completed") {
      return sendBadRequest(res, "Status must be pending or completed.");
    }

    assessment.status = nextStatus;
  }

  saveAssessments(assessments);

  res.json({
    message: "Assessment grade updated successfully.",
    assessment: assessment,
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
