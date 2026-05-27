CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    approved BOOLEAN DEFAULT FALSE
);

CREATE TABLE students (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id),
    branch VARCHAR(100),
    cgpa DOUBLE PRECISION DEFAULT 0,
    skills JSONB DEFAULT '[]',
    career_goal TEXT,
    placed BOOLEAN DEFAULT FALSE
);

CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id),
    industry VARCHAR(100),
    website VARCHAR(255),
    description TEXT
);

CREATE TABLE drives (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id),
    job_role VARCHAR(255) NOT NULL,
    job_description TEXT,
    salary_lpa DOUBLE PRECISION,
    location VARCHAR(255),
    job_type VARCHAR(50),
    min_cgpa DOUBLE PRECISION,
    eligible_branches TEXT,
    application_deadline DATE,
    drive_date DATE,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id),
    drive_id BIGINT NOT NULL REFERENCES drives(id),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cv_screening BOOLEAN,
    aptitude_test BOOLEAN,
    technical_round1 BOOLEAN,
    technical_round2 BOOLEAN,
    hr_round BOOLEAN,
    final_result VARCHAR(20) DEFAULT 'IN_PROGRESS'
);

CREATE TABLE interview_slots (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES applications(id),
    round_type VARCHAR(50),
    interview_date_time TIMESTAMP,
    mode VARCHAR(20),
    venue_or_link TEXT,
    feedback TEXT
);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    message TEXT,
    type VARCHAR(50),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id),
    sender VARCHAR(20),
    message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
