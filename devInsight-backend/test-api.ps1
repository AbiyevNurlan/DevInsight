# DevInsight2 API Test Script
$baseUrl = "http://localhost:8080/api"
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DevInsight2 API Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Admin Login
Write-Host "`n[1] Admin Login Test..." -ForegroundColor Yellow
try {
    $adminLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@devinsight.com","password":"admin123"}'
    $script:adminToken = $adminLogin.data.token
    Write-Host "   SUCCESS: Admin logged in" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 2. HR Login
Write-Host "`n[2] HR Login Test..." -ForegroundColor Yellow
try {
    $hrLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"hr@devinsight.com","password":"hr123"}'
    $script:hrToken = $hrLogin.data.token
    Write-Host "   SUCCESS: HR logged in" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Candidate Login
Write-Host "`n[3] Candidate Login Test..." -ForegroundColor Yellow
try {
    $candidateLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"candidate@devinsight.com","password":"candidate123"}'
    $script:candidateToken = $candidateLogin.data.token
    Write-Host "   SUCCESS: Candidate logged in" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Admin Stats
Write-Host "`n[4] Admin Stats Test..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/admin/stats" -Method GET -Headers @{Authorization="Bearer $script:adminToken"}
    Write-Host "   SUCCESS: Total Users=$($stats.data.totalUsers), Companies=$($stats.data.totalCompanies)" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Admin Users List
Write-Host "`n[5] Admin Users List Test..." -ForegroundColor Yellow
try {
    $users = Invoke-RestMethod -Uri "$baseUrl/admin/users" -Method GET -Headers @{Authorization="Bearer $script:adminToken"}
    Write-Host "   SUCCESS: Found $($users.data.totalElements) users" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Admin Companies List
Write-Host "`n[6] Admin Companies List Test..." -ForegroundColor Yellow
try {
    $companies = Invoke-RestMethod -Uri "$baseUrl/admin/companies" -Method GET -Headers @{Authorization="Bearer $script:adminToken"}
    Write-Host "   SUCCESS: Found $($companies.data.totalElements) companies" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. HR Create Question
Write-Host "`n[7] HR Create Question Test..." -ForegroundColor Yellow
try {
    $questionBody = '{"category":"BACKEND","subcategory":"Java","difficulty":"MEDIUM","questionText":"Java-da ArrayList ile LinkedList arasindaki ferqi izah edin","expectedKeywords":"performance,memory,random access","suggestedDurationMinutes":5,"tags":["java","collections"]}'
    $question = Invoke-RestMethod -Uri "$baseUrl/hr/questions" -Method POST -Headers @{Authorization="Bearer $script:hrToken"} -ContentType "application/json" -Body $questionBody
    Write-Host "   SUCCESS: Question created with ID=$($question.id)" -ForegroundColor Green
    $script:questionId = $question.id
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. HR Get Questions
Write-Host "`n[8] HR Get Questions Test..." -ForegroundColor Yellow
try {
    $questions = Invoke-RestMethod -Uri "$baseUrl/hr/questions" -Method GET -Headers @{Authorization="Bearer $script:hrToken"}
    Write-Host "   SUCCESS: Found $($questions.Count) questions" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 9. HR Create Interview Template
Write-Host "`n[9] HR Create Interview Template Test..." -ForegroundColor Yellow
try {
    $templateBody = '{"name":"Java Backend Developer Interview","description":"Standard interview for Java developers","difficulty":"MEDIUM","questionIds":[],"maxScores":[]}'
    $template = Invoke-RestMethod -Uri "$baseUrl/hr/templates" -Method POST -Headers @{Authorization="Bearer $script:hrToken"} -ContentType "application/json" -Body $templateBody
    Write-Host "   SUCCESS: Template created with ID=$($template.id)" -ForegroundColor Green
    $script:templateId = $template.id
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 10. HR Get Templates
Write-Host "`n[10] HR Get Templates Test..." -ForegroundColor Yellow
try {
    $templates = Invoke-RestMethod -Uri "$baseUrl/hr/templates" -Method GET -Headers @{Authorization="Bearer $script:hrToken"}
    Write-Host "   SUCCESS: Found $($templates.Count) templates" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 11. Gamification - Get Badges
Write-Host "`n[11] Gamification Badges Test..." -ForegroundColor Yellow
try {
    $badges = Invoke-RestMethod -Uri "$baseUrl/gamification/badges" -Method GET -Headers @{Authorization="Bearer $script:candidateToken"}
    Write-Host "   SUCCESS: Found $($badges.data.Count) badges" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 12. User Profile
Write-Host "`n[12] User Profile Test..." -ForegroundColor Yellow
try {
    $profile = Invoke-RestMethod -Uri "$baseUrl/users/me" -Method GET -Headers @{Authorization="Bearer $script:candidateToken"}
    Write-Host "   SUCCESS: Profile retrieved for $($profile.data.email)" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Test Suite Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
