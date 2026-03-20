-- ============================================
-- DevInsight2 Multi-Tenant Schema
-- Database: PostgreSQL 15+
-- ============================================

-- ============================================
-- 1. COMPANIES (Multi-Tenant Base)
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255),
    subscription_plan VARCHAR(20) DEFAULT 'FREE',  -- FREE, PRO, ENTERPRISE
    storage_limit_mb INT DEFAULT 5120,  -- 5GB for FREE
    max_employees INT DEFAULT 50,
    max_interviews_per_month INT DEFAULT 10,
    api_key VARCHAR(255) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. USERS (All Roles)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) NOT NULL,  -- ADMIN, HR, CANDIDATE
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'ACTIVE',  -- ACTIVE, INACTIVE, SUSPENDED
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, email)
);

-- ============================================
-- 3. INTERVIEW TEMPLATES (HR Creates)
-- ============================================
CREATE TABLE IF NOT EXISTS interview_templates (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255),
    difficulty VARCHAR(20),  -- EASY, MEDIUM, HARD
    total_duration_minutes INT,
    max_score INT DEFAULT 100,
    tags VARCHAR(255)[],
    usage_count INTEGER DEFAULT 0,
    last_used_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, name)
);

-- ============================================
-- 4. QUESTION BANK (HR Builds)
-- ============================================
CREATE TABLE IF NOT EXISTS question_bank (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category VARCHAR(50),  -- BEHAVIORAL, TECHNICAL, CASE_STUDY, SITUATIONAL
    subcategory VARCHAR(100),  -- Java, Python, Leadership, etc.
    difficulty VARCHAR(20),  -- EASY, MEDIUM, HARD
    question_text TEXT NOT NULL,
    expected_keywords TEXT,
    suggested_duration_minutes INT,
    tags VARCHAR(255)[],
    rating DECIMAL(3,2),  -- 1-5 scale
    usage_count INT DEFAULT 0,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, question_text)
);

-- ============================================
-- 5. TEMPLATE QUESTIONS (Association)
-- ============================================
CREATE TABLE IF NOT EXISTS template_questions (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES interview_templates(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
    question_order INT NOT NULL,
    max_score INT NOT NULL,
    time_limit_minutes INT,
    UNIQUE(template_id, question_id)
);

-- ============================================
-- 6. INTERVIEWS (Scheduled Sessions)
-- ============================================
CREATE TABLE IF NOT EXISTS interviews (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    template_id BIGINT NOT NULL REFERENCES interview_templates(id),
    title VARCHAR(255),
    scheduled_date TIMESTAMP,
    candidate_email VARCHAR(255),
    candidate_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'SCHEDULED',  -- SCHEDULED, IN_PROGRESS, COMPLETED
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 7. SUBMISSIONS (Interview Attempts)
-- ============================================
CREATE TABLE IF NOT EXISTS submissions (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    interview_id BIGINT NOT NULL REFERENCES interviews(id),
    candidate_id BIGINT REFERENCES users(id),
    candidate_email VARCHAR(255),
    total_score DECIMAL(7,2),
    status VARCHAR(20) DEFAULT 'IN_PROGRESS',  -- IN_PROGRESS, SUBMITTED, EVALUATED
    started_at TIMESTAMP DEFAULT NOW(),
    submitted_at TIMESTAMP,
    evaluated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 8. INTERVIEW ANSWERS
-- ============================================
CREATE TABLE IF NOT EXISTS interview_answers (
    id BIGSERIAL PRIMARY KEY,
    submission_id BIGINT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES question_bank(id),
    answer_text TEXT,
    answer_code TEXT,  -- For code questions
    submitted_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 9. AI EVALUATION & FEEDBACK
-- ============================================
CREATE TABLE IF NOT EXISTS answer_analysis (
    id BIGSERIAL PRIMARY KEY,
    submission_id BIGINT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES question_bank(id),
    score DECIMAL(5,2),
    feedback TEXT,
    strengths TEXT,
    improvements TEXT,
    ai_model VARCHAR(50),  -- GPT-4, Claude-3, etc.
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_feedback (
    id BIGSERIAL PRIMARY KEY,
    submission_id BIGINT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    ai_score DECIMAL(5,2),
    ai_feedback TEXT,
    strengths TEXT,
    improvements TEXT,
    tips_for_improvement TEXT,
    recommended_resources VARCHAR(500)[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 10. GAMIFICATION (Achievements & Badges)
-- ============================================
CREATE TABLE IF NOT EXISTS candidate_achievements (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    candidate_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_name VARCHAR(100) NOT NULL,
    badge_icon VARCHAR(255),  -- emoji
    description TEXT,
    earned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, candidate_id, badge_name)
);

CREATE TABLE IF NOT EXISTS candidate_leaderboard (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    candidate_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_score DECIMAL(10,2),
    interviews_completed INT DEFAULT 0,
    average_score DECIMAL(5,2),
    rank INT,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, candidate_id)
);

-- ============================================
-- 11. LEARNING RESOURCES (For Candidates)
-- ============================================
CREATE TABLE IF NOT EXISTS learning_resources (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(500),
    category VARCHAR(100),  -- Video, Article, Course
    difficulty VARCHAR(20),
    tags VARCHAR(255)[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 12. AUDIT LOGS (Admin Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(100),  -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT
    entity_type VARCHAR(50),  -- USER, INTERVIEW, SUBMISSION, etc.
    entity_id BIGINT,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES (Performance)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_interviews_company ON interviews(company_id);
CREATE INDEX IF NOT EXISTS idx_interviews_template ON interviews(template_id);
CREATE INDEX IF NOT EXISTS idx_submissions_interview ON submissions(interview_id);
CREATE INDEX IF NOT EXISTS idx_submissions_candidate ON submissions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_answers_submission ON interview_answers(submission_id);
CREATE INDEX IF NOT EXISTS idx_achievements_candidate ON candidate_achievements(candidate_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_company ON candidate_leaderboard(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_company ON audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_company ON question_bank(company_id);
CREATE INDEX IF NOT EXISTS idx_template_company ON interview_templates(company_id);

-- ============================================
-- Row-Level Security (PostgreSQL)
-- ============================================
-- Enable RLS for tenant-specific tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for isolation
DROP POLICY IF EXISTS users_isolation ON users;
DROP POLICY IF EXISTS interviews_isolation ON interviews;
DROP POLICY IF EXISTS submissions_isolation ON submissions;
DROP POLICY IF EXISTS question_bank_isolation ON question_bank;
DROP POLICY IF EXISTS templates_isolation ON interview_templates;

CREATE POLICY users_isolation ON users
    FOR ALL
    USING (company_id = current_setting('app.current_company_id')::BIGINT);

CREATE POLICY interviews_isolation ON interviews
    FOR ALL
    USING (company_id = current_setting('app.current_company_id')::BIGINT);

CREATE POLICY submissions_isolation ON submissions
    FOR ALL
    USING (company_id = current_setting('app.current_company_id')::BIGINT);

CREATE POLICY question_bank_isolation ON question_bank
    FOR ALL
    USING (company_id = current_setting('app.current_company_id')::BIGINT);

CREATE POLICY templates_isolation ON interview_templates
    FOR ALL
    USING (company_id = current_setting('app.current_company_id')::BIGINT);

-- ============================================
-- CANDIDATE CVs (for AI Matching)
-- ============================================
CREATE TABLE IF NOT EXISTS candidate_cvs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL UNIQUE,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(10) NOT NULL,  -- PDF or DOCX
    uploaded_date TIMESTAMP NOT NULL DEFAULT NOW(),
    is_analyzed BOOLEAN NOT NULL DEFAULT false,
    analysis_date TIMESTAMP,
    UNIQUE(user_id)  -- One CV per user
);

CREATE INDEX IF NOT EXISTS idx_cv_user ON candidate_cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_analyzed ON candidate_cvs(is_analyzed);

-- ============================================
-- DONE
-- ============================================
COMMIT;
