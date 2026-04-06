function getFirstName(name) {
  if (!name) {
    return "there";
  }

  return String(name).trim().split(" ")[0];
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(0)}%`;
}

function formatDate(value) {
  if (!value) {
    return "No date";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function calculateAverage(assessments) {
  let totalEarned = 0;
  let totalPossible = 0;

  for (let i = 0; i < assessments.length; i++) {
    const assessment = assessments[i];

    if (
      typeof assessment.earnedMarks === "number" &&
      typeof assessment.totalMarks === "number" &&
      assessment.totalMarks > 0
    ) {
      totalEarned += assessment.earnedMarks;
      totalPossible += assessment.totalMarks;
    }
  }

  if (totalPossible === 0) {
    return 0;
  }

  return Number(((totalEarned / totalPossible) * 100).toFixed(2));
}

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

export { getFirstName, formatPercent, formatDate, calculateAverage, calculateProgress };
