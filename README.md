# HireTrack V2

HireTrack V2 is an intelligent Campus Placement Platform designed to streamline hiring workflows for students, universities, and companies.

## Architecture Evolution
HireTrack has evolved from a monolithic MVP to a production-ready, cloud-native architecture. 
- **Database**: Serverless PostgreSQL via Neon.
- **Backend**: Express.js (Node.js) with Sequelize ORM.
- **Frontend**: React (SPA) with Vite/Webpack.
- **AI Integrations**: OpenRouter / Gemini / Claude compatible backend.

---

## Environment Variables & Secrets

To run this project, you will need the following Environment Variables. 

**Backend (`server/.env`)**
- `DATABASE_URL`: Your Neon PostgreSQL connection string (e.g. `postgresql://user:pass@ep-rest-of-url.neon.tech/neondb?sslmode=require`)
- `JWT_SECRET`: A strong random string for signing JWTs.
- `JWT_EXPIRES_IN`: E.g. `7d`.
- `AI_PROVIDER`: Choose one: `OPENAI` or `GEMINI` or `CLAUDE`.
- `OPENAI_API_KEY`: Required if using OpenRouter / OpenAI.
- `GEMINI_API_KEY`: Required if using Gemini.

**Frontend (`client/.env`)**
- `REACT_APP_API_URL`: `/api` (Defaults to this, routed via Nginx in Docker).

---

## Development Setup

If you wish to run the project natively (without Docker):
1. **Database**: Provision a Neon DB and place the `DATABASE_URL` in `server/.env`.
2. **Backend**:
   ```bash
   cd server
   npm install
   npm run dev
   ```
3. **Frontend**:
   ```bash
   cd client
   npm install
   npm start
   ```

---

## Docker Setup

We use a multi-container Docker Compose setup. It automatically builds the optimized React Nginx image and the Node.js backend image.

**Standard / Production Test**:
```bash
docker compose up --build -d
```

**Local Development (Hot Reloading)**:
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

---

## Deployment & CI/CD (GitHub Actions)

This repository is strictly configured to use **GitHub Actions**. Jenkins is completely obsolete and has been removed.

### Workflows
1. **Continuous Integration** (`.github/workflows/ci.yml`): Runs on every Push/PR. Installs dependencies, lints, runs tests, and builds both the frontend and backend.
2. **Docker Validation** (`.github/workflows/docker-validate.yml`): Validates that the `docker-compose` build process executes flawlessly.
3. **AWS Deployment Ready** (`.github/workflows/aws-deploy.yml`): A templated workflow for deploying directly to an AWS EC2 instance over SSH.

### GitHub Secrets Required for AWS EC2
If you intend to activate the AWS deployment workflow, you must add the following Secrets to your GitHub repository:
- `EC2_SSH_KEY`: The private PEM key for your EC2 instance.
- `EC2_HOST`: The public IP or DNS of your EC2 instance.
- `EC2_USER`: Usually `ec2-user` or `ubuntu`.
- `DATABASE_URL`: Your Neon connection string.
- `JWT_SECRET`: Your production JWT secret.
- `OPENAI_API_KEY`: Your production AI key.
