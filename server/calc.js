// Calculate the current average for one course
function calculateAverage(assessments) {
  let totalEarned = 0;
  let totalPossible = 0;

  for (let i = 0; i < assessments.length; i++) {
    const assessment = assessments[i];

    // make sure its a valid number
    if (typeof assessment.earnedMarks === "number" &&
        typeof assessment.totalMarks === "number" &&
        assessment.totalMarks > 0) {
            
      totalEarned += assessment.earnedMarks;
      totalPossible += assessment.totalMarks;
    }
  }

  if (totalPossible === 0) {
    return 0;
  }

  // to make the result out of 100
  return Number(((totalEarned / totalPossible) * 100).toFixed(2));
  // toFixed used to make the output .00 (decimals)
}

// Calculate how much of a course is completed
function calculateProgress(assessments) {
  if (assessments.length === 0) {
    return 0;
  }

  let completedCount = 0;

  for (let i = 0; i < assessments.length; i++) {
    if (assessments[i].status === "completed") {
      completedCount++;
    }
  }

  return Number(((completedCount / assessments.length) * 100).toFixed(2));
}

// Get only upcoming assessments and sort them by date
function getUpcomingAssessments(assessments) {
  const today = new Date().toISOString().slice(0, 10);

  const upcoming = assessments.filter(function (assessment) {
    return (
      assessment.status !== "completed" &&
      assessment.dueDate &&
      assessment.dueDate >= today
    );
  });

  upcoming.sort(function (a, b) {
    return a.dueDate.localeCompare(b.dueDate);
  });

  return upcoming;
}

module.exports = {
  calculateAverage,
  calculateProgress,
  getUpcomingAssessments,
};