#!/bin/bash
# Quick Start Guide for Interview Grading System

# ============================================================================
# INTERVIEW SUBMISSION & GRADING SYSTEM - QUICK START
# ============================================================================

# This system allows students to:
# 1. Take interviews with multiple questions
# 2. Submit text answers
# 3. Get graded using AI-powered text similarity (no external APIs)
# 4. View detailed results with score breakdown

# ============================================================================
# PREREQUISITES
# ============================================================================

# Backend:
# - Java 21+
# - Gradle 9.2.1+
# - PostgreSQL 16.6+
# - Maven/Spring Boot knowledge

# Frontend:
# - Node.js 18+
# - npm 9+
# - React 18+
# - Vite

# ============================================================================
# STEP 1: START THE BACKEND
# ============================================================================

# Open Terminal 1 - Backend
cd devInsight-backend
./gradlew.bat bootRun
# Backend running on: http://localhost:8080

# ============================================================================
# STEP 2: START THE FRONTEND
# ============================================================================

# Open Terminal 2 - Frontend
cd devInsight-frontend
npm install        # First time only
npm run dev
# Frontend running on: http://localhost:5173

# ============================================================================
# STEP 3: TEST THE WORKFLOW
# ============================================================================

# 1. Open http://localhost:5173 in browser
# 2. Login with credentials:
#    Email: (any registered user)
#    Password: (correct password)
# 3. Browse interviews on /interviews
# 4. Click on an interview to see details
# 5. Click "Start Interview" button
# 6. Fill in all answer textareas
# 7. Click "Submit Answers"
# 8. View results on /submissions/{id}

# ============================================================================
# DIRECTORY STRUCTURE
# ============================================================================

# Backend Components:
# src/main/java/az/edu/itbrains/devinsight2/
# ├── service/
# │   ├── grading/
# │   │   └── TextSimilarityService.java      ← Levenshtein + Keywords
# │   └── submission/
# │       ├── SubmissionService.java          ← Grading orchestration
# │       └── SubmissionController.java       ← REST API
# ├── model/
# │   └── submission/
# │       ├── InterviewSubmission.java        ← Main entity
# │       ├── QuestionAnswer.java             ← Individual answer
# │       ├── SubmissionStatus.java           ← Enum
# │       └── AnswerStatus.java               ← Enum
# └── repository/
#     └── submission/
#         ├── InterviewSubmissionRepository.java
#         └── QuestionAnswerRepository.java

# Frontend Components:
# src/
# ├── pages/
# │   ├── InterviewSubmissionPage.tsx         ← Answer submission
# │   └── SubmissionResultsPage.tsx           ← Results display
# ├── services/
# │   └── submissionService.ts                ← API functions
# └── App.tsx                                  ← Routes

# ============================================================================
# API ENDPOINTS
# ============================================================================

# Submit Answers:
# POST /api/submissions/interviews/{interviewId}
# Body: { answers: [{ questionId, answer }, ...] }

# Get Results:
# GET /api/submissions/{submissionId}

# Get My Submissions:
# GET /api/submissions/interviews/{interviewId}/my-submissions

# Get All Submissions (Admin):
# GET /api/submissions/interviews/{interviewId}

# Get Statistics (Admin):
# GET /api/submissions/interviews/{interviewId}/statistics

# ============================================================================
# GRADING ALGORITHM
# ============================================================================

# For each question answer:
#
# 1. TEXT NORMALIZATION
#    - Convert to lowercase
#    - Remove special characters
#    - Trim whitespace
#
# 2. LEVENSHTEIN DISTANCE (40% weight)
#    - Character-level edit distance
#    - Measures how many changes needed to transform one string to another
#    - Formula: 1 - (distance / max_length)
#
# 3. KEYWORD MATCHING (60% weight)
#    - Extract meaningful keywords (filter stop words)
#    - Calculate Jaccard Similarity: intersection / union
#    - Account for typos with character similarity
#
# 4. COMBINED SCORE
#    Score = (Levenshtein × 0.4) + (Keywords × 0.6)
#    Result: 0-100 percentage
#
# 5. DETERMINE STATUS
#    ✓ CORRECT:   score ≥ 80%
#    ◐ PARTIAL:   50% ≤ score < 80%
#    ✕ INCORRECT: score < 50%
#
# 6. CALCULATE POINTS
#    Points = (score / 100) × maxPoints

# ============================================================================
# EXAMPLE USAGE
# ============================================================================

# Frontend Submit:
# POST /api/submissions/interviews/5 with:
# {
#   "answers": [
#     {
#       "questionId": 1,
#       "answer": "JavaScript is a programming language used in web development"
#     },
#     {
#       "questionId": 2,
#       "answer": "Variables store data values in memory"
#     }
#   ]
# }

# Response:
# {
#   "submissionId": 42,
#   "interviewId": 5,
#   "interviewTitle": "JavaScript Basics",
#   "totalScore": 85.5,
#   "percentageScore": 85.5,
#   "results": [
#     {
#       "questionId": 1,
#       "similarityScore": 92.5,
#       "status": "CORRECT",
#       "feedback": "Excellent answer! Very close to the correct answer.",
#       "pointsEarned": 9.25,
#       "maxPoints": 10
#     }
#   ]
# }

# ============================================================================
# ENVIRONMENT SETUP
# ============================================================================

# Frontend .env file:
cat > devInsight-frontend/.env << EOF
VITE_API_BASE=http://localhost:8080/api
VITE_ENV=dev
EOF

# Backend application-dev.yml:
# spring.datasource.url=jdbc:postgresql://localhost:5432/DevInsight2
# spring.datasource.username=postgres
# spring.datasource.password=yourpassword
# spring.jpa.hibernate.ddl-auto=update

# ============================================================================
# TROUBLESHOOTING
# ============================================================================

# Issue: Backend won't start
# Solution:
# 1. Check Java version: java -version
# 2. Check PostgreSQL running: psql -U postgres
# 3. Check port 8080 not in use: netstat -ano | findstr :8080
# 4. Run: gradlew.bat clean build -x test

# Issue: Frontend API errors
# Solution:
# 1. Check backend running: curl http://localhost:8080/api/health
# 2. Check VITE_API_BASE in .env
# 3. Check network tab in DevTools
# 4. Verify JWT token in localStorage

# Issue: Submission not appearing
# Solution:
# 1. Check user is logged in
# 2. Check token is valid
# 3. Check backend logs for errors
# 4. Verify interview ID exists

# Issue: Similarity scores incorrect
# Solution:
# 1. Check TextSimilarityService logs
# 2. Test with exact matching first
# 3. Review algorithm explanation above
# 4. Check answer normalization

# ============================================================================
# DEVELOPMENT TIPS
# ============================================================================

# Enable Debug Logging:
# Frontend: Open DevTools Console (F12)
# - [InterviewSubmission] - submission page logs
# - [SubmissionResults] - results page logs
# - [submissionService] - API service logs

# Backend: Update application-dev.yml
# logging.level.az.edu.itbrains.devinsight2=DEBUG
# logging.level.org.springframework.security=DEBUG

# Test Specific Endpoint:
# curl -X POST http://localhost:8080/api/submissions/interviews/5 \
#   -H "Authorization: Bearer YOUR_JWT_TOKEN" \
#   -H "Content-Type: application/json" \
#   -d '{"answers":[{"questionId":1,"answer":"test"}]}'

# View Database:
# psql -U postgres -d DevInsight2
# \dt                          # List tables
# SELECT * FROM interview_submissions;
# SELECT * FROM question_answers;

# ============================================================================
# FILE CHECKLIST
# ============================================================================

# Backend Files:
# ✓ TextSimilarityService.java (241 lines)
#   - levenshteinDistance() - DP algorithm
#   - calculateSimilarity() - Main scoring function
#   - calculateLevenshteinSimilarity() - Character similarity
#   - calculateKeywordSimilarity() - Semantic similarity
#   - generateFeedback() - AI-like feedback messages

# ✓ SubmissionService.java (255 lines)
#   - submitAnswers() - Main submission handler
#   - gradeAnswer() - Individual answer grading
#   - getSubmissionResults() - Retrieve results
#   - getUserSubmissions() - User's own submissions
#   - getInterviewSubmissions() - All submissions (admin)

# ✓ SubmissionController.java (5 endpoints)
#   - POST /submissions/interviews/{id}
#   - GET /submissions/{id}
#   - GET /submissions/interviews/{id}/my-submissions
#   - GET /submissions/interviews/{id}
#   - GET /submissions/interviews/{id}/statistics

# ✓ InterviewSubmission.java - Database entity
# ✓ QuestionAnswer.java - Answer tracking entity
# ✓ SubmissionStatus.java - Status enum
# ✓ AnswerStatus.java - Answer status enum
# ✓ Repositories - Database access

# Frontend Files:
# ✓ InterviewSubmissionPage.tsx (372 lines)
#   - Question display with textareas
#   - Progress tracking
#   - Form validation
#   - API submission
#   - Error handling

# ✓ SubmissionResultsPage.tsx (450+ lines)
#   - Results visualization
#   - Score breakdown
#   - Expandable question details
#   - Progress ring animation
#   - Download functionality

# ✓ submissionService.ts (106 lines)
#   - submitInterview()
#   - getSubmissionResults()
#   - getUserSubmissions()
#   - getInterviewSubmissions()
#   - getSubmissionStatistics()

# ✓ App.tsx (updated routes)
# ✓ InterviewDetail.tsx (updated button)

# ============================================================================
# PERFORMANCE NOTES
# ============================================================================

# Algorithm Complexity:
# - Levenshtein Distance: O(m × n) where m, n = string lengths
# - Keyword Extraction: O(n) where n = word count
# - Jaccard Similarity: O(n) where n = keyword count
# - Overall: O(m × n) per answer, parallelizable across answers

# Database Queries:
# - Interview fetch: Single query with LEFT JOIN FETCH
# - Submission save: Single transaction with cascading
# - Results fetch: Eager loading with JOIN FETCH

# Frontend Performance:
# - Component rendering: Optimized with React.memo
# - API calls: Async/await with proper loading states
# - DOM updates: Only on state changes
# - CSS: Tailwind utility classes (no bloat)

# ============================================================================
# NEXT STEPS
# ============================================================================

# 1. Test locally with sample data
# 2. Verify all grading calculations
# 3. Test with various answer formats
# 4. Set up admin dashboard (optional)
# 5. Deploy to production
# 6. Monitor performance and errors
# 7. Gather user feedback
# 8. Implement enhancements

# ============================================================================
# SUPPORT RESOURCES
# ============================================================================

# Documentation Files:
# - SUBMISSION_SYSTEM_COMPLETE.md
# - SUBMISSION_INTEGRATION_GUIDE.ts
# - This file (quick-start)

# Code Comments:
# - All service methods have JSDoc comments
# - Complex algorithms explained inline
# - Error handling documented

# External Resources:
# - Spring Boot Docs: https://spring.io/projects/spring-boot
# - React Docs: https://react.dev
# - Tailwind CSS: https://tailwindcss.com
# - Levenshtein Distance: https://en.wikipedia.org/wiki/Levenshtein_distance

echo "✅ Interview Submission & Grading System Ready!"
echo "📝 Backend: http://localhost:8080"
echo "💻 Frontend: http://localhost:5173"
echo "📚 See SUBMISSION_SYSTEM_COMPLETE.md for details"
