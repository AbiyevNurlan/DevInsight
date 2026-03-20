-- ============================================
-- Sample Interview Templates
-- Run this after your schema is set up
-- ============================================

-- NOTE: Replace company_id=1 and created_by=1 with actual IDs from your database
-- You can find these by running:
--   SELECT id FROM companies LIMIT 1;
--   SELECT id FROM users WHERE role='ADMIN' OR role='HR' LIMIT 1;

-- 1. Frontend Developer Interview (React)
INSERT INTO interview_templates (
    company_id, 
    name, 
    description, 
    category, 
    difficulty, 
    total_duration_minutes, 
    max_score, 
    tags, 
    usage_count, 
    last_used_date, 
    is_active, 
    created_by, 
    created_at, 
    updated_at
) VALUES (
    1,  -- Replace with your company_id
    'Frontend Developer Interview (React)',
    'Comprehensive React.js interview for senior developers covering hooks, state management, performance optimization, and modern React patterns',
    'Frontend',
    'Senior',
    60,
    100,
    ARRAY['React', 'TypeScript', 'JavaScript', 'CSS', 'Redux'],
    15,  -- Has been used 15 times
    NOW() - INTERVAL '2 days',  -- Last used 2 days ago
    true,
    1,  -- Replace with your user_id (HR or Admin)
    NOW() - INTERVAL '30 days',
    NOW()
);

-- 2. Backend Java Spring Boot Interview
INSERT INTO interview_templates (
    company_id, 
    name, 
    description, 
    category, 
    difficulty, 
    total_duration_minutes, 
    max_score, 
    tags, 
    usage_count, 
    last_used_date, 
    is_active, 
    created_by, 
    created_at, 
    updated_at
) VALUES (
    1,  -- Replace with your company_id
    'Backend Java Spring Boot Interview',
    'Mid-level Java backend developer assessment focusing on Spring Boot, REST APIs, database design, and microservices architecture',
    'Backend',
    'Mid',
    45,
    100,
    ARRAY['Java', 'Spring Boot', 'PostgreSQL', 'REST API', 'Hibernate'],
    8,  -- Has been used 8 times
    NOW() - INTERVAL '5 days',  -- Last used 5 days ago
    true,
    1,  -- Replace with your user_id (HR or Admin)
    NOW() - INTERVAL '25 days',
    NOW()
);

-- 3. Full-stack MERN Interview
INSERT INTO interview_templates (
    company_id, 
    name, 
    description, 
    category, 
    difficulty, 
    total_duration_minutes, 
    max_score, 
    tags, 
    usage_count, 
    last_used_date, 
    is_active, 
    created_by, 
    created_at, 
    updated_at
) VALUES (
    1,  -- Replace with your company_id
    'Full-stack MERN Interview',
    'Full-stack developer assessment using MERN stack (MongoDB, Express, React, Node.js) with emphasis on end-to-end application development',
    'Full-stack',
    'Senior',
    90,
    100,
    ARRAY['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript'],
    12,  -- Has been used 12 times
    NOW() - INTERVAL '1 day',  -- Last used 1 day ago
    true,
    1,  -- Replace with your user_id (HR or Admin)
    NOW() - INTERVAL '20 days',
    NOW()
);

-- 4. DevOps Engineer Interview
INSERT INTO interview_templates (
    company_id, 
    name, 
    description, 
    category, 
    difficulty, 
    total_duration_minutes, 
    max_score, 
    tags, 
    usage_count, 
    last_used_date, 
    is_active, 
    created_by, 
    created_at, 
    updated_at
) VALUES (
    1,  -- Replace with your company_id
    'DevOps Engineer Interview',
    'DevOps engineering role assessment covering containerization, orchestration, cloud infrastructure, CI/CD pipelines, and automation',
    'DevOps',
    'Senior',
    75,
    100,
    ARRAY['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Jenkins'],
    6,  -- Has been used 6 times
    NOW() - INTERVAL '7 days',  -- Last used 7 days ago
    true,
    1,  -- Replace with your user_id (HR or Admin)
    NOW() - INTERVAL '15 days',
    NOW()
);

-- 5. Junior Python Developer Interview
INSERT INTO interview_templates (
    company_id, 
    name, 
    description, 
    category, 
    difficulty, 
    total_duration_minutes, 
    max_score, 
    tags, 
    usage_count, 
    last_used_date, 
    is_active, 
    created_by, 
    created_at, 
    updated_at
) VALUES (
    1,  -- Replace with your company_id
    'Junior Python Developer Interview',
    'Entry-level Python developer screening covering Python fundamentals, basic Django framework, database operations, and problem-solving skills',
    'Backend',
    'Junior',
    30,
    100,
    ARRAY['Python', 'Django', 'MySQL', 'Git'],
    3,  -- Has been used 3 times
    NOW() - INTERVAL '10 days',  -- Last used 10 days ago
    true,
    1,  -- Replace with your user_id (HR or Admin)
    NOW() - INTERVAL '45 days',
    NOW()
);

-- Bonus: Data Science Interview
INSERT INTO interview_templates (
    company_id, 
    name, 
    description, 
    category, 
    difficulty, 
    total_duration_minutes, 
    max_score, 
    tags, 
    usage_count, 
    last_used_date, 
    is_active, 
    created_by, 
    created_at, 
    updated_at
) VALUES (
    1,  -- Replace with your company_id
    'Data Science & ML Engineer Interview',
    'Data science and machine learning engineer position covering Python, ML algorithms, data analysis, model deployment, and statistics',
    'Data Science',
    'Senior',
    120,
    100,
    ARRAY['Python', 'TensorFlow', 'Pandas', 'NumPy', 'Machine Learning', 'SQL'],
    4,  -- Has been used 4 times
    NOW() - INTERVAL '14 days',  -- Last used 14 days ago
    true,
    1,  -- Replace with your user_id (HR or Admin)
    NOW() - INTERVAL '35 days',
    NOW()
);

-- Mobile Developer Interview
INSERT INTO interview_templates (
    company_id, 
    name, 
    description, 
    category, 
    difficulty, 
    total_duration_minutes, 
    max_score, 
    tags, 
    usage_count, 
    last_used_date, 
    is_active, 
    created_by, 
    created_at, 
    updated_at
) VALUES (
    1,  -- Replace with your company_id
    'Mobile Developer Interview (React Native)',
    'Cross-platform mobile developer assessment using React Native, covering mobile UI/UX, native modules, and app deployment',
    'Mobile',
    'Mid',
    60,
    100,
    ARRAY['React Native', 'JavaScript', 'iOS', 'Android', 'Redux'],
    0,  -- Never used yet
    NULL,  -- Never used
    true,
    1,  -- Replace with your user_id (HR or Admin)
    NOW() - INTERVAL '5 days',
    NOW()
);

-- ============================================
-- Verify the inserts
-- ============================================
-- Run this to check if templates were inserted successfully:
-- SELECT id, name, category, difficulty, usage_count, last_used_date FROM interview_templates ORDER BY id;
