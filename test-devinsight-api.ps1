# Complete DevInsight2 API Test Script
# Usage: .\test-devinsight-api.ps1

$BASE = "http://localhost:8080/api"
$ErrorActionPreference = "Continue"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "DevInsight2 API Test Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Login
Write-Host "Step 1: Logging in as admin..." -ForegroundColor Green
$loginBody = @{
    email = "admin@devinsight.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$BASE/auth/login" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $loginBody
    
    if ($loginResponse.StatusCode -eq 200) {
        $loginData = $loginResponse.Content | ConvertFrom-Json
        $token = $loginData.data.token
        $role = $loginData.data.role
        
        Write-Host "✅ Login successful!" -ForegroundColor Green
        Write-Host "Role: $role" -ForegroundColor Green
        Write-Host "Token: $($token.Substring(0, 30))..." -ForegroundColor DarkGray
    } else {
        Write-Host "❌ Login failed!" -ForegroundColor Red
        Write-Host $loginResponse.Content -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Login error: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Get all questions
Write-Host "`nStep 2: Fetching all questions..." -ForegroundColor Green
try {
    $questionsResponse = Invoke-WebRequest -Uri "$BASE/questions" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
    
    if ($questionsResponse.StatusCode -eq 200) {
        $questionsData = $questionsResponse.Content | ConvertFrom-Json
        $questionCount = ($questionsData.data | Measure-Object).Count
        
        Write-Host "✅ Questions fetched!" -ForegroundColor Green
        Write-Host "Count: $questionCount" -ForegroundColor Green
        
        if ($questionCount -gt 0) {
            Write-Host "`nFirst 2 questions:" -ForegroundColor Cyan
            $questionsData.data | Select-Object -First 2 | ForEach-Object {
                Write-Host "  - ID: $($_.id), Title: $($_.title)" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "❌ Failed to fetch questions (Status: $($questionsResponse.StatusCode))" -ForegroundColor Red
        Write-Host $questionsResponse.Content -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error fetching questions: $_" -ForegroundColor Red
}

# Step 3: Get question by ID
Write-Host "`nStep 3: Fetching question by ID..." -ForegroundColor Green
try {
    $questionId = ($questionsData.data[0].id)
    
    if ($questionId) {
        $questionResponse = Invoke-WebRequest -Uri "$BASE/questions/$questionId" `
            -Method GET `
            -Headers @{
                "Authorization" = "Bearer $token"
                "Content-Type" = "application/json"
            }
        
        if ($questionResponse.StatusCode -eq 200) {
            $questionData = $questionResponse.Content | ConvertFrom-Json
            
            Write-Host "✅ Question loaded!" -ForegroundColor Green
            Write-Host "ID: $($questionData.data.id)" -ForegroundColor Green
            Write-Host "Title: $($questionData.data.title)" -ForegroundColor Green
            Write-Host "Type: $($questionData.data.type)" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to load question (Status: $($questionResponse.StatusCode))" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️ No questions available to test" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error fetching question: $_" -ForegroundColor Red
}

# Step 4: Get admin stats
Write-Host "`nStep 4: Getting admin stats..." -ForegroundColor Green
try {
    $statsResponse = Invoke-WebRequest -Uri "$BASE/admin/stats" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
    
    if ($statsResponse.StatusCode -eq 200) {
        $statsData = $statsResponse.Content | ConvertFrom-Json
        
        Write-Host "✅ Admin stats loaded!" -ForegroundColor Green
        Write-Host ($statsData.data | ConvertTo-Json -Depth 2) -ForegroundColor Cyan
    } else {
        Write-Host "❌ Failed to load admin stats (Status: $($statsResponse.StatusCode))" -ForegroundColor Red
        Write-Host $statsResponse.Content -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error fetching stats: $_" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
