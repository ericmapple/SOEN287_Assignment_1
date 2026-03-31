const fs = require("fs");
const path = require("path");

// Build the full path to a file inside the data folder
function getFilePath(fileName) {
  return path.join(__dirname, "../data", fileName);
}

// Read a JSON file and turn it into JavaScript data
function readJSON(fileName) {
  const filePath = getFilePath(fileName);

  // If the file does not exist yet, create it as an empty array
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf8");
  }

  const fileContent = fs.readFileSync(filePath, "utf8");

  if (fileContent.trim() === "") {
    return [];
  }

  return JSON.parse(fileContent);
}

// Save JavaScript data back into a JSON file
function writeJSON(fileName, data) {
  const filePath = getFilePath(fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

// Very simple ID generator for demo/project use
function makeId(prefix) {
  return prefix + Date.now() + Math.floor(Math.random() * 1000);
}

module.exports = {
  readJSON,
  writeJSON,
  makeId,
};