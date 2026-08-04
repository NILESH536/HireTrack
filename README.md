# HireTrack

An intelligent, next-generation Campus Recruitment & Hiring Platform powered by Generative AI.

HireTrack transforms traditional placement processes by integrating a powerful **Hiring Intelligence Engine**, enabling automated resume analysis, AI-driven job matching, interview coaching, coding assessments, and personalized learning roadmaps.

## 🚀 Features

- **Resume Intelligence**: Automated ATS scoring, skill extraction, and personalized feedback.
- **AI Job Matching**: Explainable AI recommendations matching students to the right drives.
- **Career Intelligence**: Predicted placement likelihoods and trajectory analysis.
- **Interview Coach**: Interactive LLM-powered mock interviews tailored to the student's resume.
- **Learning Engine**: Generation of dynamic 3-week learning roadmaps to bridge skill gaps.
- **Coding Assessments**: Integrated recruitment tests and automated evaluations.
- **Workflow Automation**: Intelligent event-driven notifications across the entire application lifecycle.
- **Compliance & Trust**: Audit logs and role-based access control.

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **AI Integration**: Google Gemini via `@google/genai`
- **Architecture**: Modular Monolith

## 📦 Setup & Installation

1. **Prerequisites**
   - Node.js (v18+)
   - PostgreSQL
   - A valid Google Gemini API Key

2. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/hiretrack.git
   cd hiretrack
   ```

3. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Environment Configuration**
   Create a `.env` file in the `server/` directory:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=hiretrack
   DB_USER=postgres
   DB_PASS=postgres
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```

5. **Run Migrations**
   ```bash
   npx sequelize-cli db:migrate
   ```

6. **Start the Server**
   ```bash
   npm run dev
   ```

## 📖 Documentation

- [Architecture Guide](./ARCHITECTURE.md)
- [API Reference](./API_DOCS.md)

## 🤝 Contribution Guidelines

1. Follow standard clean architecture principles.
2. Ensure new APIs use the standard `responseBuilder`.
3. Add appropriate `asyncHandler` wrappers for all async controllers to ensure domain errors are caught.
