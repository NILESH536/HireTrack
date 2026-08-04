# HireTrack API Documentation

All APIs respond with a standardized JSON structure.

## Base URL
`/api`

## Authentication
Most routes require a valid JWT token passed in the `Authorization` header.
```
Authorization: Bearer <token>
```

---

## Standard Response Format

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 1. Authentication APIs

### `POST /api/auth/register`
Registers a new user (Student or Company).
- **Body:** `{ email, password, name, role, ...profileData }`
- **Response:** `201 Created` with Token.

### `POST /api/auth/login`
Authenticates a user.
- **Body:** `{ email, password }`
- **Response:** `200 OK` with Token.

### `GET /api/auth/me`
Fetches the currently authenticated user's profile.

---

## 2. Student APIs (Requires `STUDENT` role)

### `GET /api/student/dashboard`
Fetches aggregated stats, application counts, and upcoming interviews.

### `GET /api/student/drives`
Fetches a list of placement drives the student is eligible for based on CGPA and Branch.

### `POST /api/student/drives/:driveId/apply`
Submits a job application for a specific drive.

### `POST /api/student/resume/upload`
Uploads a resume file (PDF) and immediately triggers the **Resume Intelligence Platform** for ATS scoring and skill extraction.
- **Form Data:** `resume` (file)

### `POST /api/student/resume/analyze-ats`
Dynamically analyzes the primary resume against a specific Job Description.
- **Body:** `{ jobDescription }`

---

## 3. Coaching & Preparation (Requires `STUDENT` role)

### `POST /api/coaching/mock-interview/start`
Starts a new LLM-driven mock interview based on the student's resume.
- **Body:** `{ interviewType, jobRole }`

### `POST /api/coaching/mock-interview/:attemptId/answer`
Submits a text answer to an interview question for AI evaluation.
- **Body:** `{ questionId, answerText }`

### `GET /api/coaching/roadmap`
Generates or retrieves a personalized 3-week Learning Roadmap to improve placement chances.

---

## 4. Company APIs (Requires `COMPANY` role)

### `POST /api/company/drives`
Creates a new recruitment drive.
- **Body:** `{ jobRole, jobDescription, salaryLpa, minCgpa, eligibleBranches, applicationDeadline }`

### `GET /api/company/drives/:driveId/applicants`
Fetches all students who applied to the drive.

### `PUT /api/company/applications/:applicationId/shortlist`
Updates the status of a specific candidate for a specific round (e.g., `aptitudeTest`, `hrRound`).
- **Body:** `{ round, status: boolean }`

### `POST /api/company/applications/schedule-interview`
Schedules an interview slot for a candidate.
- **Body:** `{ applicationId, roundType, interviewDateTime, mode, venueOrLink }`

### `PUT /api/company/applications/:applicationId/result`
Declares the final hiring result for a candidate.
- **Body:** `{ result: "SELECTED" | "REJECTED" }`

---

## 5. Admin APIs (Requires `ADMIN` role)

### `GET /api/admin/dashboard`
Fetches platform-wide placement statistics and pending company approvals.

### `PUT /api/admin/companies/:id/approve`
Approves a newly registered company to start posting drives.

---

## 6. System & Workflow APIs

### `GET /api/health`
Basic health-check endpoint to verify if the server is running.
