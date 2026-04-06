# SOEN 287 Course Management System

## Project Description

This project is a web-based Smart Course Companion that helps students and teachers manage courses, assessments, grades, and academic progress.

## Current Features

### General
- Login page connected to the backend
- Role-based React routing
- Shared styling through `client/src/styles.css`

### Student
- Dashboard with course averages and upcoming assessments
- Add and delete courses
- Add/manage assessments
- View grade breakdown by course
- View profile information from backend user data

### Teacher
- Dashboard with teaching stats
- Create and enable/disable teacher courses
- View grading templates
- View a gradebook summary based on related student course data
- View teacher profile and teaching metrics

## How to Run the Project

### Backend
1. Open a terminal in [server/app.js](/Users/eric/Documents/GitHub/WebGen/SOEN287_Assignment_1/server/app.js)'s folder:
   `/Users/eric/Documents/GitHub/WebGen/SOEN287_Assignment_1/server`
2. Run `npm install` if needed.
3. Run `node app.js`

The backend runs on `http://localhost:5000`.

### Frontend
1. Open a second terminal in:
   `/Users/eric/Documents/GitHub/WebGen/SOEN287_Assignment_1/client`
2. Run `npm install` if needed.
3. Run `npm run dev`

The frontend runs on the Vite development server, usually `http://localhost:5173`.

## Demo Accounts

### Student
- Email: `eric@email.com`
- Password: `1234`

### Teacher
- Email: `teacher@concordia.ca`
- Password: `1234`

## Technologies Used

- HTML
- CSS
- JavaScript
- React
- Node.js
- Express

## Team

- Eric Scherpereel 40315371
- Karolina Urdenko 40319184
- Oliver Pilotin 40297499
- Paul-Louis DUBOULAIS 40311694
