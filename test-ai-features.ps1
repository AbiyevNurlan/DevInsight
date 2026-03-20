# AI Features Quick Test Script
# Run this script to test all 8 AI features

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "AI Features Testing Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseUrl = "http://localhost:8080"
$frontendUrl = "http://localhost:5173"

# Step 1: Check if backend is running
Write-Host "[1/10] Checking if backend is running..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "$baseUrl/actuator/health" -ErrorAction Stop
    Write-Host "✓ Backend is running!" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend is NOT running!" -ForegroundColor Red
    Write-Host "Please start backend first:" -ForegroundColor Yellow
    Write-Host "  cd devInsight-backend" -ForegroundColor Gray
    Write-Host "  ./gradlew bootRun" -ForegroundColor Gray
    exit
}

# Step 2: Login
Write-Host "`n[2/10] Logging in as HR user..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "hr@test.com"
        password = "password123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    $token = $loginResponse.data.token
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "  Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Login failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

# Step 3: Test Question Generation
Write-Host "`n[3/10] Testing Question Generation..." -ForegroundColor Yellow
try {
    $questionGenBody = @{
        role = "Senior Java Developer"
        skills = @("Java", "Spring Boot", "Microservices")
        experienceLevel = "SENIOR"
        questionCount = 5
    } | ConvertTo-Json

    $questionResponse = Invoke-RestMethod -Uri "$baseUrl/interview/questions/generate" -Method POST -Headers $headers -Body $questionGenBody
    Write-Host "✓ Question Generation working!" -ForegroundColor Green
    Write-Host "  Generated: $($questionResponse.totalQuestions) questions" -ForegroundColor Gray
} catch {
    Write-Host "✗ Question Generation failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Test Auto-Scoring
Write-Host "`n[4/10] Testing Auto-Scoring..." -ForegroundColor Yellow
try {
    $scoringBody = @{
        question = "What is Spring Boot?"
        candidateAnswer = "Spring Boot is a framework that simplifies Spring application development"
        expectedAnswer = "Spring Boot is an opinionated framework for building production-ready Spring applications"
        maxScore = 10
    } | ConvertTo-Json

    $scoringResponse = Invoke-RestMethod -Uri "$baseUrl/interview/scoring/evaluate" -Method POST -Headers $headers -Body $scoringBody
    Write-Host "✓ Auto-Scoring working!" -ForegroundColor Green
    Write-Host "  Score: $($scoringResponse.score.score)/$($scoringResponse.score.maxScore)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Auto-Scoring failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Test Behavioral Analysis
Write-Host "`n[5/10] Testing Behavioral Analysis..." -ForegroundColor Yellow
try {
    $behavioralBody = @{
        candidateAnswer = "I handled the project by first breaking it down into smaller tasks and delegating to team members"
        questionType = "BEHAVIORAL"
        currentDifficulty = 5
    } | ConvertTo-Json

    $behavioralResponse = Invoke-RestMethod -Uri "$baseUrl/interview/behavioral/analyze" -Method POST -Headers $headers -Body $behavioralBody
    Write-Host "✓ Behavioral Analysis working!" -ForegroundColor Green
    Write-Host "  Confidence: $($behavioralResponse.analysis.confidenceLevel)%" -ForegroundColor Gray
    Write-Host "  Stress: $($behavioralResponse.analysis.stressLevel)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Behavioral Analysis failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 6: Test Explainable AI
Write-Host "`n[6/10] Testing Explainable AI..." -ForegroundColor Yellow
try {
    $explainBody = @{
        candidateId = 101
        decisionType = "HIRING"
        aiArtifacts = @{
            cvAnalysis = @{ overallScore = 88 }
            interviewScores = @{ overallScore = 85 }
        }
    } | ConvertTo-Json -Depth 3

    $explainResponse = Invoke-RestMethod -Uri "$baseUrl/interview/explainability/explain" -Method POST -Headers $headers -Body $explainBody
    Write-Host "✓ Explainable AI working!" -ForegroundColor Green
    Write-Host "  Reasons provided: $($explainResponse.explanation.reasons.Count)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Explainable AI failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 7: Test Upskilling
Write-Host "`n[7/10] Testing Upskilling..." -ForegroundColor Yellow
try {
    $upskillingBody = @{
        candidateId = 101
        currentSkills = @("Java", "Spring")
        targetRole = "Cloud Architect"
        targetSkills = @("AWS", "Kubernetes", "Terraform")
    } | ConvertTo-Json

    $upskillingResponse = Invoke-RestMethod -Uri "$baseUrl/interview/upskilling/analyze-gaps" -Method POST -Headers $headers -Body $upskillingBody
    Write-Host "✓ Upskilling working!" -ForegroundColor Green
    Write-Host "  Skill gaps found: $($upskillingResponse.analysis.gapSkills.Count)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Upskilling failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 8: Test Global Matching
Write-Host "`n[8/10] Testing Global Talent Matching..." -ForegroundColor Yellow
try {
    $matchingBody = @{
        jobTitle = "Senior Java Developer"
        requiredSkills = @("Java", "Spring Boot", "Microservices")
        location = "Baku, Azerbaijan"
        experienceLevel = "SENIOR"
    } | ConvertTo-Json

    $matchingResponse = Invoke-RestMethod -Uri "$baseUrl/interview/matching/find-matches?limit=5" -Method POST -Headers $headers -Body $matchingBody
    Write-Host "✓ Global Talent Matching working!" -ForegroundColor Green
    Write-Host "  Matches found: $($matchingResponse.matches.candidates.Count)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Global Talent Matching failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 9: Test HR Review
Write-Host "`n[9/10] Testing HR Review..." -ForegroundColor Yellow
try {
    $hrReviewBody = @{
        candidateId = 101
        candidateName = "Test Candidate"
        jobId = 5
        jobTitle = "Senior Java Developer"
        aiRecommendation = "STRONG_YES"
        aiConfidence = 0.92
        aiReasoning = "Strong technical skills and good cultural fit"
        aiArtifacts = @{
            cvAnalysis = @{ overallScore = 88 }
            interviewScores = @{ overallScore = 85 }
            behavioralAnalysis = @{ confidenceLevel = 85 }
        }
    } | ConvertTo-Json -Depth 3

    $hrReviewResponse = Invoke-RestMethod -Uri "$baseUrl/interview/hr-review/create" -Method POST -Headers $headers -Body $hrReviewBody
    Write-Host "✓ HR Review working!" -ForegroundColor Green
    Write-Host "  Review ID: $($hrReviewResponse.review.reviewId)" -ForegroundColor Gray
} catch {
    Write-Host "✗ HR Review failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 10: Frontend Check
Write-Host "`n[10/10] Checking if frontend is running..." -ForegroundColor Yellow
try {
    $frontendCheck = Invoke-WebRequest -Uri $frontendUrl -UseBasicParsing -TimeoutSec 5
    Write-Host "✓ Frontend is running!" -ForegroundColor Green
} catch {
    Write-Host "✗ Frontend is NOT running!" -ForegroundColor Red
    Write-Host "To start frontend:" -ForegroundColor Yellow
    Write-Host "  cd devInsight-frontend" -ForegroundColor Gray
    Write-Host "  npm run dev" -ForegroundColor Gray
}

# Summary
Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. If frontend is running, open: $frontendUrl/login" -ForegroundColor White
Write-Host "2. Login with: hr@test.com / password123" -ForegroundColor White
Write-Host "3. Navigate to each feature page:" -ForegroundColor White
Write-Host "   - Question Generation: /hr/questions" -ForegroundColor Gray
Write-Host "   - Auto-Scoring: /hr/candidates" -ForegroundColor Gray
Write-Host "   - Behavioral Analysis: /hr/decisions" -ForegroundColor Gray
Write-Host "   - Explainable AI: /hr/decisions" -ForegroundColor Gray
Write-Host "   - Upskilling: /hr/upskilling" -ForegroundColor Gray
Write-Host "   - Global Matching: /hr/talent-matching" -ForegroundColor Gray
Write-Host "   - HR Review: /hr/decisions" -ForegroundColor Gray
Write-Host ""
Write-Host "For detailed testing guide, see: AI_FEATURES_TESTING_STATUS.md" -ForegroundColor Cyan
