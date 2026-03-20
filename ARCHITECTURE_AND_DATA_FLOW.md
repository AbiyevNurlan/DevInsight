# AI CV Analysis - Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React/TypeScript)              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              CVUpload Component                           │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  • File drag & drop                               │  │   │
│  │  │  • Upload progress tracking                       │  │   │
│  │  │  • Text extraction status display                 │  │   │
│  │  │  • Auto-triggers analyzeCV() on success           │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                          ↓                                │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │    CVAnalysisDisplay Component                    │  │   │
│  │  │  ┌──────────────────────────────────────────────┐ │  │   │
│  │  │  │  • Experience level badge (color-coded)     │ │  │   │
│  │  │  │  • Skills as chips                          │ │  │   │
│  │  │  │  • Job categories as badges                 │ │  │   │
│  │  │  │  • Education & Languages                    │ │  │   │
│  │  │  │  • Professional summary                     │ │  │   │
│  │  │  │  • Loading state animation                  │ │  │   │
│  │  │  └──────────────────────────────────────────────┘ │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│           ↑                                    ↓                   │
│  ┌────────┴────────────────────────────────────┴──────────────┐  │
│  │         cvService.ts (Frontend Service)                   │  │
│  │  • uploadCV(file, onProgress)                            │  │
│  │  • getCVInfo()                                           │  │
│  │  • analyzeCV()  ← NEW                                    │  │
│  │  • getExtractedText()                                    │  │
│  │  • deleteCV()                                            │  │
│  └─────────────────────────────────────────────────────────┘  │
└──────────────┬────────────────────────────────────────────────┘
               │ HTTP/HTTPS
               ↓
┌──────────────────────────────────────────────────────────────────┐
│                    Backend (Spring Boot)                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           CandidateController                            │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  POST /api/candidates/cv/upload                  │  │   │
│  │  │  POST /api/candidates/cv/analyze    ← NEW        │  │   │
│  │  │  GET  /api/candidates/cv/info                    │  │   │
│  │  │  GET  /api/candidates/cv/text                    │  │   │
│  │  │  DELETE /api/candidates/cv                       │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          ↓                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │    AIAnalysisService (NEW)                              │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  1. analyzeCVText(String text)                   │  │   │
│  │  │     ↓                                              │  │   │
│  │  │  2. buildAnalysisPrompt(String text)             │  │   │
│  │  │     ↓                                              │  │   │
│  │  │  3. callClaudeAPI(String prompt)                 │  │   │
│  │  │     ↓                                              │  │   │
│  │  │  4. parseAnalysisResponse(String response)       │  │   │
│  │  │     ↓                                              │  │   │
│  │  │  5. Return CVAnalysisResult                       │  │   │
│  │  │                                                    │  │   │
│  │  │  Error Handling:                                  │  │   │
│  │  │  • Try-catch blocks around API calls             │  │   │
│  │  │  • Graceful fallback to default analysis         │  │   │
│  │  │  • Comprehensive logging                         │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          ↓                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │    CandidateCV Entity (Enhanced)                        │   │
│  │  • candidateId, fileName, fileSize                      │   │
│  │  • extractedText, textQuality                           │   │
│  │  • analysisSkills (JSON)         ← NEW                  │   │
│  │  • experienceLevel               ← NEW                  │   │
│  │  • jobCategories (JSON)          ← NEW                  │   │
│  │  • yearsOfExperience             ← NEW                  │   │
│  │  • education                     ← NEW                  │   │
│  │  • languages (JSON)              ← NEW                  │   │
│  │  • analysisSummary               ← NEW                  │   │
│  │  • isAnalyzed, analysisDate      ← NEW                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          ↓                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         PostgreSQL Database                             │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  candidate_cv table with analysis results         │  │   │
│  │  │  • Indexed by candidate_id and is_analyzed        │  │   │
│  │  │  • Analysis cached to avoid re-analysis           │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────┬────────────────────────────────────────────────┘
               │ HTTPS
               ↓
┌──────────────────────────────────────────────────────────────────┐
│                  External API (Anthropic)                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Claude API (v1/messages)                         │   │
│  │                                                          │   │
│  │  Request:                                              │   │
│  │  ┌────────────────────────────────────────────────┐    │   │
│  │  │ POST https://api.anthropic.com/v1/messages   │    │   │
│  │  │ Headers:                                      │    │   │
│  │  │  • Authorization: x-api-key                   │    │   │
│  │  │  • anthropic-version: 2024-06-01             │    │   │
│  │  │  • content-type: application/json            │    │   │
│  │  │ Body:                                         │    │   │
│  │  │  • model: claude-3-5-sonnet-20241022        │    │   │
│  │  │  • max_tokens: 4096                          │    │   │
│  │  │  • messages: [prompt with CV text]           │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  │                      ↓                                   │   │
│  │  Response:                                              │   │
│  │  ┌────────────────────────────────────────────────┐    │   │
│  │  │ {                                              │    │   │
│  │  │   "content": [{                               │    │   │
│  │  │     "type": "text",                           │    │   │
│  │  │     "text": "```json\n{...}\n```"            │    │   │
│  │  │   }],                                          │    │   │
│  │  │   "stop_reason": "end_turn"                   │    │   │
│  │  │ }                                              │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
User Upload → File Validation → FormData Upload
   ↓
Backend /upload → File Storage → PDF/DOCX Parser
   ↓
Text Extraction → Text Quality Assessment → Save to DB
   ↓
Auto-trigger Analysis → AIAnalysisService.analyzeCVText()
   ↓
Build Prompt (Rules + CV Text) → HTTP POST to Claude API
   ↓
Claude Analysis → JSON Response → Parse Response
   ↓
Extract/Validate Data → Save to DB (analysis results)
   ↓
Return CVAnalysisResult → Frontend Service
   ↓
Update Component State → CVAnalysisDisplay Renders
   ↓
Beautiful UI with Skills, Experience Level, Categories, etc.
```

## Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    CVUpload.tsx                          │
│                                                          │
│  State:                                                 │
│  • file, uploadProgress, uploading, success            │
│  • existingCV, extractedText, showFullText             │
│  • analyzing, analysisResult, analysisError   ← NEW    │
│                                                          │
│  Methods:                                               │
│  • handleFileSelect()                                  │
│  • handleUpload() ← triggers analyzeCV()               │
│  • handleDelete()                                       │
│  • handleAnalyzeCV()  ← NEW                           │
│  • loadExtractedText()                                 │
└──────────────────────────────────────────────────────────┘
         ↓                                      ↓
  Uses cvService.ts              Uses CVAnalysisDisplay.tsx
         ↓                                      ↓
    ┌────────────┐            ┌──────────────────────────┐
    │ cvService  │            │CVAnalysisDisplay.tsx     │
    │ • uploadCV │            │                          │
    │ • analyzeCV│─────────→  │ • Loading state          │
    │ • deleteCV │            │ • Skills chips           │
    │ • getCVInfo│            │ • Experience badge       │
    │ • getText  │            │ • Categories badges      │
    └────────────┘            │ • Education              │
         ↓                     │ • Languages              │
         │                     │ • Summary                │
         │                     └──────────────────────────┘
         │
         └─→ Backend API Endpoints
               • /cv/upload
               • /cv/analyze    ← NEW
               • /cv/info
               • /cv/text
               • /cv/delete
```

## Request/Response Flow

### Upload CV Request
```
POST /api/candidates/cv/upload
Content-Type: multipart/form-data
Authorization: Bearer {jwt_token}

[Binary File Data]
```

### Upload Response
```json
{
  "success": true,
  "message": "CV uploaded and text extracted successfully",
  "data": {
    "fileName": "resume.pdf",
    "fileSize": 102400,
    "fileType": "application/pdf",
    "uploadedDate": "2024-01-15T10:30:00",
    "textExtracted": true,
    "textQuality": "HIGH",
    "cvTextPreview": "John Doe - Senior Developer..."
  }
}
```

### Analyze CV Request
```
POST /api/candidates/cv/analyze
Authorization: Bearer {jwt_token}
Content-Type: application/json

(No body - uses CV from database)
```

### Analysis Response
```json
{
  "success": true,
  "message": "CV analyzed successfully",
  "data": {
    "skills": ["React", "Node.js", "PostgreSQL", "Docker"],
    "experienceLevel": "SENIOR",
    "categories": ["Full-stack", "Backend"],
    "yearsOfExperience": 7,
    "education": "Bachelor of Science in Computer Science",
    "languages": ["English", "Spanish"],
    "summary": "Experienced full-stack developer..."
  }
}
```

## Database Schema

```sql
CREATE TABLE candidate_cv (
    id BIGINT PRIMARY KEY,
    candidate_id BIGINT NOT NULL,
    
    -- File Info
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(50),
    uploaded_date TIMESTAMP,
    
    -- Text Extraction
    extracted_text TEXT,
    text_quality VARCHAR(20),
    extraction_error TEXT,
    
    -- AI Analysis (NEW)
    analysis_skills TEXT,          -- JSON array
    experience_level VARCHAR(20),  -- JUNIOR/MID/SENIOR
    job_categories TEXT,           -- JSON array
    years_of_experience INTEGER,
    education VARCHAR(500),
    languages TEXT,                -- JSON array
    analysis_summary TEXT,
    is_analyzed BOOLEAN,
    analysis_date TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);

CREATE INDEX idx_candidate_cv_candidate_id ON candidate_cv(candidate_id);
CREATE INDEX idx_candidate_cv_is_analyzed ON candidate_cv(is_analyzed);
```

## Configuration Files

### application.yml
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # Auto-create/update schema

anthropic:                    # NEW CONFIG BLOCK
  api-key: ${ANTHROPIC_API_KEY:}
  api-url: https://api.anthropic.com/v1/messages
  model: claude-3-5-sonnet-20241022
  max-tokens: 4096
```

### Environment Variables
```bash
# Required for production
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
DATABASE_URL=jdbc:postgresql://...
JWT_SECRET=...
```

## Error Handling Strategy

```
API Request → 200 OK?
   ├─ Yes ─→ Parse Response → Valid JSON?
   │           ├─ Yes ─→ Extract Data → Save to DB → Return Result
   │           └─ No  ─→ Handle Markdown → Extract Data → Save
   └─ No ──→ API Error?
               ├─ 401 (Auth) ─→ Log error, return error response
               ├─ 429 (Rate Limit) ─→ Return error with retry message
               ├─ 500 (Server) ─→ Return error, suggest retry
               └─ Network ─→ Fallback to default analysis, log error
```

## Security Architecture

```
┌─────────────┐
│   Frontend  │
│   (React)   │
└──────┬──────┘
       │ HTTPS Only
       ↓
┌──────────────────┐
│  Spring Security │
│  • JWT Validation│
│  • Role Checking │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│   CandidateCtrl  │
│ @PostMapping     │
│ @PreAuthorize    │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│   AIService      │
│ • Validate Input │
│ • Log Operations │
└──────┬───────────┘
       │ HTTPS + API Key
       ↓
┌──────────────────────┐
│  Anthropic API       │
│  claude-...          │
│  (Secure)            │
└──────────────────────┘
       │
       ↓
┌──────────────────┐
│   PostgreSQL     │
│   Encrypted @    │
│   Transport      │
└──────────────────┘
```

## Deployment Architecture

```
Development
├── Backend: localhost:8080
├── Frontend: localhost:5173
├── Database: PostgreSQL (local)
└── API Key: Environment variable

Production
├── Backend: Spring Boot (Docker/Cloud)
├── Frontend: Static build (CDN/Cloud)
├── Database: PostgreSQL (Managed Service)
├── API Key: Secrets Management (AWS/Azure/GCP)
└── HTTPS: SSL/TLS Certificates
```

## Performance Optimization

```
Cache Layer:
└─ Database caching of analysis results
   └─ Avoids re-analyzing same CV
   └─ Instant results on subsequent loads

Async Operations (Future Enhancement):
└─ Queue analysis jobs
└─ Process in background
└─ Notify user when complete

Rate Limiting:
└─ Client-side: Prevent multiple analysis clicks
└─ Server-side: Handle API rate limits gracefully
└─ Queue: Implement job queue for scale
```

## Monitoring & Logging

```
Frontend Logging:
└─ Console logs for development
└─ Error tracking (optional)

Backend Logging:
└─ INFO: Successful analysis
└─ WARN: API timeouts, retries
└─ ERROR: Failed analysis, API errors

Metrics to Monitor:
├─ Analysis success rate (target: >95%)
├─ Average analysis time (target: 2-5s)
├─ API error rate (target: <5%)
├─ Database query time (target: <100ms)
└─ Claude API usage/costs
```

---

This architecture provides:
- ✅ Scalability through caching and database
- ✅ Security through authentication and encryption
- ✅ Reliability through error handling and fallbacks
- ✅ Performance through optimization and monitoring
- ✅ Maintainability through clean separation of concerns
