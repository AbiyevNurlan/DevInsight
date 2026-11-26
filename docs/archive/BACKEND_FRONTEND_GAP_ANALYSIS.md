# Backend Frontend Gap Analysis

Generated: 2026-03-16

## Verification Status

- Backend compile verified with `gradlew.bat build -x test`
- Backend tests verified with `gradlew.bat test`
- Frontend production build verified with `npm run build`
- Frontend service contract mismatches fixed in `src/services/aiRecruitmentService.ts`

## 1. Backend Capability Analysis

### Controller Domains

| Domain | Base Paths | Key Controllers |
|---|---|---|
| Auth and user | `/auth`, `/users` | AuthController, UserController |
| Candidate and CV | `/candidates`, `/cv` | CandidateController, CVController |
| Interview core | `/interviews`, `/interviews/{interviewId}/sessions` | InterviewController, InterviewSessionController |
| Questions and templates | `/questions`, `/hr/questions`, `/hr/templates`, `/interview/questions` | QuestionController, HRController, QuestionGenerationController |
| Submission and scoring | `/submissions`, `/submissions/api`, `/interview/scoring`, `/interview/scorecard` | SubmissionController, SubmissionApiController, ScoringController, ScorecardController |
| AI interview features | `/interview/*` | MultimodalInterviewController, VoiceEmotionController, BiasDetectionController, CodeOriginalityController, CandidatePotentialController, TeamChemistryController, TalentMatchingController, BehavioralAnalysisController, ExplainabilityController, HRReviewController, UpskillingController |
| New advanced interview features | `/interview/code-execution`, `/interview/mock-interview`, `/interview/predictive-hiring`, `/interview/smart-scheduler`, `/interview/blockchain-certificates`, `/interview/translation`, `/interview/reports` | CodeExecutionController, MockInterviewController, PredictiveHiringController, SmartSchedulerController, BlockchainCertificateController, RealTimeTranslationController, InterviewReportController |
| Analytics and reporting | `/analytics`, `/dashboard`, `/feedback` | AnalyticsController, DashboardController, FeedbackController |
| Security and admin | `/security`, `/admin`, `/hr` | SecurityViolationController, AdminController, HRController |
| Gamification and chat | `/gamification`, `/chat` | GamificationController, DashboardController, ChatController |

### Services and Business Capabilities

| Service Area | Capabilities |
|---|---|
| Authentication | registration, login, refresh token, current-user profile |
| Candidate lifecycle | candidate listing, filtering, status update, interview history, CV upload and AI analysis |
| Interview lifecycle | interview CRUD, question assignment, session start, pause, resume, report |
| Question system | CRUD, category/type filtering, HR question bank, AI question generation |
| Submission pipeline | answer submission, grading, per-interview statistics, results retrieval |
| Explainable AI | scorecards, score explanation, reason codes, audit trail |
| HR decisioning | AI-HR review workflow, disagreements, outcome feedback, model metrics |
| Talent intelligence | talent matching, semantic match, upskilling, behavioral analysis |
| Anti-cheat and security | violation reporting, recent/critical violations, WebSocket alerts |
| Multimodal analysis | transcription, audio/video analysis, multimodal evaluation |
| New differentiators | code execution, mock interview coach, predictive hiring, smart scheduling, blockchain certificates, real-time translation, auto interview reports |
| Gamification and engagement | badges, points, leaderboard, dashboard summary, post-interview chat |

### Repositories and Entities

| Domain | Main Entities / Tables |
|---|---|
| Identity | `User`, `Company` |
| Candidate | candidate profile DTO layer, candidate CV storage |
| Interview | `Interview`, `InterviewSession`, `InterviewTemplate`, question assignment tables |
| Questions | `Question`, `QuestionBank`, question feedback |
| Submission | `Submission`, `InterviewSubmission`, `QuestionAnswer` |
| Review and audit | `HRReviewEntity`, `InterviewFeedback`, `AuditTrailEntity`, `AuditLog` |
| Security | `SecurityViolation` |
| Multimodal | `MultimodalInterviewSession`, `MultimodalAnswerEntity`, `SessionAudio` |
| Gamification | `Badge`, `UserBadge`, `UserPoints`, `PointTransaction` |
| Chat | `ChatConversation`, `ChatMessage` |

### REST API Inventory

The codebase contains a large API surface. Below is the grouped source-of-truth inventory by domain.

#### Auth and User

| Method | Endpoint | Description | Request | Response |
|---|---|---|---|---|
| POST | `/auth/register` | Register user | body: name, email, password, role | tokens + user |
| POST | `/auth/login` | Login user | body: email, password | tokens + user |
| POST | `/auth/refresh` | Refresh token | body: refreshToken | new tokens |
| GET | `/users/me` | Current user profile | none | user profile |
| GET | `/users/{id}` | User by id | path: id | user |
| GET | `/users` | Paginated users | query: page, size | page of users |
| PUT | `/users/{id}` | Update user | path: id, body: profile fields | user |
| DELETE | `/users/{id}` | Delete user | path: id | empty |

#### Candidate and CV

| Method | Endpoint | Description | Request | Response |
|---|---|---|---|---|
| GET | `/candidates` | Filtered candidate list | query: page, size, search, status, sort | paged candidate profiles |
| GET | `/candidates/{id}` | Candidate details | path: id | candidate profile |
| GET | `/candidates/{id}/history` | Candidate interview history | path: id | history list |
| PUT | `/candidates/{id}/status` | Update candidate status | path: id, body: status, notes | updated candidate |
| POST | `/candidates/cv/upload` | Upload candidate CV | multipart file | upload result |
| GET | `/candidates/cv/text` | Current user CV text | none | text payload |
| POST | `/candidates/cv/analyze` | Analyze uploaded CV | none | AI CV analysis |
| POST | `/cv/upload` | Upload CV in CV module | multipart file | upload result |
| GET | `/cv/info` | CV metadata | none | file metadata |
| GET | `/cv/text` | Extracted text | none | extracted text |
| DELETE | `/cv` | Delete CV | none | empty |

#### Interviews, Sessions, Questions, Templates

| Method | Endpoint | Description | Request | Response |
|---|---|---|---|---|
| GET | `/interviews/public` | Public interviews | none | interview list |
| GET | `/interviews/active` | Active interviews | none | interview list |
| GET | `/interviews/{id}` | Interview details | path: id | interview |
| GET | `/interviews/company/{companyId}` | Company interviews | path: companyId | interview list |
| PUT | `/interviews/{id}` | Update interview | path: id, body: interview fields | interview |
| DELETE | `/interviews/{id}` | Delete interview | path: id | empty |
| POST | `/interviews/{interviewId}/questions/{questionId}` | Add question to interview | path params | empty |
| DELETE | `/interviews/{interviewId}/questions/{questionId}` | Remove question | path params | empty |
| POST | `/interviews/{interviewId}/sessions/start` | Start session | path: interviewId, body: session data | session DTO |
| GET | `/interviews/{interviewId}/sessions/{sessionId}` | Session status | path params | session DTO |
| GET | `/interviews/{interviewId}/sessions/{sessionId}/progress` | Session progress | path params | progress object |
| GET | `/interviews/{interviewId}/sessions/{sessionId}/report` | Session report | path params | report DTO |
| POST | `/interviews/{interviewId}/sessions/{sessionId}/pause` | Pause session | path params | session DTO |
| POST | `/interviews/{interviewId}/sessions/{sessionId}/resume` | Resume session | path params | session DTO |
| GET | `/questions` | Question list | query: filters | question list |
| POST | `/questions` | Create question | body: question fields | question |
| GET | `/questions/{id}` | Question details | path: id | question |
| PUT | `/questions/{id}` | Update question | path: id, body | question |
| DELETE | `/questions/{id}` | Delete question | path: id | empty |
| GET | `/questions/type/{type}` | By type | path: type | question list |
| GET | `/hr/questions` | HR bank list | query: category, difficulty | question-bank list |
| POST | `/hr/questions` | Create bank question | body | question-bank item |
| GET | `/hr/questions/search` | Search bank | query: keyword | question-bank list |
| GET | `/hr/templates` | Template list | query filters | template list |
| POST | `/hr/templates` | Create template | body | template |
| GET | `/hr/templates/{id}` | Template detail | path: id | template |
| PUT | `/hr/templates/{id}` | Update template | path: id, body | template |
| DELETE | `/hr/templates/{id}` | Delete template | path: id | empty |
| POST | `/hr/templates/{id}/clone` | Clone template | path: id | template |
| GET | `/hr/templates/categories` | Template categories | none | string list |
| POST | `/interview/questions/generate` | AI question generation | body: role, experienceLevel, skills, questionCount, difficulty | `{ success, questions, totalQuestions }` |

#### Submission, Scoring, Scorecard

| Method | Endpoint | Description | Request | Response |
|---|---|---|---|---|
| POST | `/submissions/interviews/{interviewId}` | Submit answers | body: answer list | submission result |
| GET | `/submissions/{submissionId}` | Submission detail | path: submissionId | submission result |
| GET | `/submissions/interviews/{interviewId}/my-submissions` | Current user submissions | path: interviewId | submission list |
| GET | `/submissions/interviews/{interviewId}` | Interview submissions | path: interviewId | submission list |
| GET | `/submissions/interviews/{interviewId}/results` | Current user result | path: interviewId | submission result |
| GET | `/submissions/interviews/{interviewId}/statistics` | Interview statistics | path: interviewId | statistics DTO |
| GET | `/submissions/test-similarity` | Similarity test helper | query params | score object |
| GET | `/submissions/api/{interviewId}` | Submission API list | path: interviewId | submission list |
| POST | `/interview/scoring/evaluate` | Evaluate a single answer | body: question, candidateAnswer, expectedKeywords, idealAnswer, evaluationCriteria, maxScore | `{ success, score }` |
| POST | `/interview/scoring/shortlist` | Generate shortlist | body: candidates, topN, minimumPercentage | `{ success, shortlist }` |
| POST | `/interview/scorecard/generate` | Generate explainable scorecard | body: candidateId, candidateName, jobId, jobTitle, interviewData | `{ success, scorecard }` |
| GET | `/interview/scorecard/{candidateId}` | Retrieve scorecard | path: candidateId, query: jobId | placeholder retrieval response |
| POST | `/interview/scorecard/explain-score` | Explain score component | body: score, context | `{ success, explanation }` |
| GET | `/interview/scorecard/reason-codes` | Explainability reason codes | none | `{ success, reasonCodes }` |
| POST | `/interview/scorecard/compare` | Compare scorecards | body: candidateIds | comparison placeholder |
| GET | `/interview/scorecard/feature-importance` | Feature importance | query: jobRole | feature weights |
| POST | `/interview/scorecard/bias-report` | Bias report | body: candidateId | bias report |

#### AI, Review, Explainability, Matching, Upskilling

| Method | Endpoint | Description | Request | Response |
|---|---|---|---|---|
| POST | `/interview/behavioral/analyze` | Behavioral analysis | body: candidateAnswer and context | trait analysis |
| POST | `/interview/behavioral/adaptive-question` | Adaptive next question | body: previous context | suggested question |
| POST | `/interview/explainability/explain` | Explain decision | body: decision metadata | explainability response |
| GET | `/interview/explainability/audit-trail/candidate/{candidateId}` | Candidate audit trail | path: candidateId | audit events |
| GET | `/interview/explainability/audit-trail/event/{eventType}` | Event audit trail | path: eventType | audit events |
| GET | `/interview/explainability/audit-trail/time-range` | Time-range audit trail | query: start, end | audit events |
| POST | `/interview/hr-review/create` | Create HR review | body: candidate/job/AI artifacts | review DTO |
| POST | `/interview/hr-review/submit-decision/{reviewId}` | Submit HR decision | path: reviewId, body: finalDecision and notes | review DTO |
| GET | `/interview/hr-review/candidate/{candidateId}/job/{jobId}` | Get review | path params | review DTO |
| GET | `/interview/hr-review/disagreements` | AI/HR disagreement list | none | review list |
| POST | `/interview/hr-review/feedback` | Model feedback | body: actual outcome, prediction, rating | feedback result |
| GET | `/interview/hr-review/metrics` | Model metrics | none | model metrics |
| GET | `/interview/hr-review/pending` | Pending reviews | none | review list |
| GET | `/interview/hr-review/all` | All reviews | none | review list |
| POST | `/interview/upskilling/analyze-gaps` | Skill gap analysis | body | skill gap report |
| POST | `/interview/upskilling/learning-path` | Learning path generation | body | learning path |
| POST | `/interview/matching/find-matches` | Candidate/job matching | body | match list |
| POST | `/interview/matching/semantic-match` | Semantic similarity match | body | semantic comparison |

#### Multimodal and Security

| Method | Endpoint | Description | Request | Response |
|---|---|---|---|---|
| POST | `/interview/multimodal/transcribe` | Audio transcription | body: audio/video input | transcript DTO |
| POST | `/interview/multimodal/analyze-audio` | Audio analysis | query/body hybrid | audio metrics |
| POST | `/interview/multimodal/analyze-video` | Video analysis | query/body hybrid | video metrics |
| POST | `/interview/multimodal/analyze-multimodal` | Combined analysis | body: multimodal answer | multimodal analysis |
| POST | `/security/violations/report` | Report violation | body: interviewId, userId, violationType | violation DTO |
| GET | `/security/violations/interview/{interviewId}` | Interview violations | path: interviewId | violation list |
| GET | `/security/violations/user/{userId}/interview/{interviewId}` | User interview violations | path params | violation list |
| GET | `/security/violations/recent` | Recent violations | query: hours | violation list |
| GET | `/security/violations/critical` | Critical violations | none | violation list |
| PUT | `/security/violations/{id}/resolve` | Resolve violation | path: id, body: resolution info | violation DTO |
| WS | `/api/ws-interview-native` | STOMP websocket | subscribe topics | realtime events |

#### New Advanced Interview Endpoints

| Method | Endpoint | Description | Request | Response |
|---|---|---|---|---|
| POST | `/interview/code-execution/execute` | Execute code | body: language, sourceCode, stdin, limits | execution result |
| POST | `/interview/code-execution/test-cases` | Run code test cases | body: code + test cases | test case results |
| GET | `/interview/code-execution/languages` | Supported runtimes | none | language list |
| POST | `/interview/code-execution/quality-analysis` | Code quality pass | body: code payload | execution + quality metrics |
| POST | `/interview/mock-interview/start` | Start mock session | body: candidateId, jobTitle, difficulty, technologies | session DTO |
| POST | `/interview/mock-interview/{sessionId}/answer` | Submit mock answer | path: sessionId, body: answer | updated session DTO |
| GET | `/interview/mock-interview/{sessionId}/next` | Next question | path: sessionId | next question DTO |
| GET | `/interview/mock-interview/{sessionId}/report` | Session report | path: sessionId | report DTO |
| DELETE | `/interview/mock-interview/{sessionId}` | End mock session | path: sessionId | `{ success }` |
| POST | `/interview/predictive-hiring/predict` | Predict hiring outcome | body: hiring metrics | predictive response |
| GET | `/interview/predictive-hiring/salary-benchmark` | Salary benchmark | query: role, level, region | salary benchmark |
| GET | `/interview/predictive-hiring/funnel/{companyId}` | Hiring funnel | path: companyId | funnel analytics |
| POST | `/interview/smart-scheduler/find-slots` | Optimal slots | body: availability and timezone data | scheduler response |
| POST | `/interview/smart-scheduler/reschedule` | Reschedule | query: interviewId, newDateTime | scheduler response |
| GET | `/interview/smart-scheduler/workload/{interviewerId}` | Interviewer workload | path: interviewerId | workload object |
| POST | `/interview/blockchain-certificates/issue` | Issue certificate | body: candidateId, interviewId, skill metadata | certificate DTO |
| GET | `/interview/blockchain-certificates/verify/{certificateId}` | Verify certificate | path: certificateId | certificate validation |
| GET | `/interview/blockchain-certificates/candidate/{candidateId}` | Candidate certificates | path: candidateId | certificate list |
| GET | `/interview/blockchain-certificates/chain-status` | Blockchain status | none | chain status |
| DELETE | `/interview/blockchain-certificates/revoke/{certificateId}` | Revoke certificate | path: certificateId | `{ success }` |
| POST | `/interview/translation/translate` | Translate text | body: translation request | translation result |
| POST | `/interview/translation/batch` | Batch translation | body: request list | translation result |
| POST | `/interview/translation/detect` | Language detect | body: text | detected language |
| GET | `/interview/translation/languages` | Supported languages | none | language catalog |
| POST | `/interview/reports/generate` | Generate interview report | body: interviewId, candidateId, flags | report DTO |
| GET | `/interview/reports/executive-summary/{interviewId}/{candidateId}` | Executive summary | path params | report DTO |
| POST | `/interview/reports/compare` | Compare candidates | query/body mixed | comparison result |

#### Analytics, Feedback, Admin, Gamification, Chat

| Method | Endpoint | Description | Request | Response |
|---|---|---|---|---|
| GET | `/analytics/overview` | Platform overview | none | overview object |
| GET | `/analytics/trends` | Trend data | query: days/period | trend list |
| GET | `/analytics/score-distribution` | Score distribution | none | distribution |
| GET | `/analytics/pass-fail-ratio` | Pass/fail stats | none | ratio object |
| GET | `/analytics/hiring-stats` | Hiring stats | none | hiring object |
| GET | `/dashboard/summary` | Dashboard summary | none | summary DTO |
| POST | `/feedback/interview/{interviewId}` | Create interview feedback | path + body | feedback |
| POST | `/feedback/{feedbackId}/questions` | Add question feedback | path + body | question feedback |
| POST | `/feedback/{feedbackId}/finalize` | Finalize feedback | path | feedback |
| POST | `/feedback/{feedbackId}/share` | Share feedback | path | feedback |
| GET | `/feedback/interview/{interviewId}` | Interview feedback | path | feedback |
| GET | `/feedback/my-feedback` | Candidate received feedback | query: page, size | page of feedback |
| GET | `/feedback/my-reviews` | HR-created feedback | none | feedback list |
| GET | `/feedback/statistics/company/{companyId}` | Feedback stats | path | feedback stats |
| GET | `/admin/users` | Admin user list | query: page, size | page of users |
| POST | `/admin/users` | Create user | body | user |
| PUT | `/admin/users/{id}` | Update user | path + body | user |
| DELETE | `/admin/users/{id}` | Delete user | path | empty |
| GET | `/admin/interviews` | Admin interview list | query: page, size | page of interviews |
| POST | `/admin/interviews` | Create interview | body | interview |
| PUT | `/admin/interviews/{id}` | Update interview | path + body | interview |
| DELETE | `/admin/interviews/{id}` | Delete interview | path | empty |
| GET | `/admin/companies` | Company list | query: page, size | page of companies |
| POST | `/admin/companies` | Create company | body | company |
| PUT | `/admin/companies/{id}` | Update company | path + body | company |
| DELETE | `/admin/companies/{id}` | Delete company | path | empty |
| GET | `/admin/audit-logs` | Audit log list | query: page, size | page of logs |
| GET | `/gamification/profile` | My gamification profile | none | profile |
| GET | `/gamification/leaderboard` | Leaderboard | query: limit | leaderboard |
| GET | `/gamification/badges` | Badge catalog | none | badge list |
| GET | `/gamification/my-badges` | Earned badges | none | badge list |
| GET | `/gamification/transactions` | Point history | query: page, size | page of transactions |
| POST | `/chat/start` | Start AI chat | query/body by controller contract | chat conversation |
| POST | `/chat/message` | Send AI chat message | body: conversationId, message | chat message |
| GET | `/chat/history/{conversationId}` | Chat history | path + query | paged chat messages |
| GET | `/chat/conversations` | My conversations | none | conversation list |

## 2. Frontend Analysis

### Main Pages and Routes

Source routes are defined in `devInsight-frontend/src/App.tsx`.

#### Existing route groups

- Public: login, register, forbidden
- Dashboards: default dashboard, admin dashboard, HR dashboard, candidate dashboard
- Interview flows: interview list, detail, submission, completion, results
- Admin management: question CRUD, candidates, analytics
- HR operations: question bank, template builder, vacancies, reports, settings, interview manager
- HR AI pages: AI model dashboard, talent matching, decision panel, upskilling, voice emotion, bias detection, code originality, candidate potential, team chemistry
- Candidate tools: CV upload, profile, gamification dashboard

### Frontend Service Layer

| Service File | Current Purpose |
|---|---|
| `src/services/api.ts` | axios instance, auth headers, refresh handling |
| `src/services/adminService.ts` | admin users, companies, interviews |
| `src/services/questionService.ts` | question CRUD |
| `src/services/submissionService.ts` | submission and result APIs |
| `src/services/cvService.ts` | CV upload and analysis |
| `src/services/analyticsService.ts` | analytics queries |
| `src/services/securityService.ts` | security violation APIs and monitoring |
| `src/services/aiRecruitmentService.ts` | advanced AI and HR feature APIs |

### Frontend Page to Backend Mapping

| Frontend Page | APIs Used |
|---|---|
| Login / Register | `/auth/login`, `/auth/register` |
| Dashboard / HRDashboard / Admin dashboards | `/dashboard/summary`, `/analytics/*`, `/admin/*` |
| QuestionList / AddQuestion / EditQuestion / QuestionBank | `/questions/*`, `/hr/questions/*`, `/interview/questions/generate` |
| InterviewList / InterviewDetail / InterviewManager | `/interviews/*`, question services |
| Submission pages | `/submissions/*`, `/interviews/*` |
| CVUploadPage | `/cv/upload`, `/cv/info`, `/candidates/cv/analyze` |
| CandidatesPage | `/candidates`, `/candidates/{id}/history` |
| AnalyticsPage / ReportsPage | `/analytics/*` |
| TalentMatchingPage | `/interview/matching/find-matches`, `/interview/matching/semantic-match` |
| HRDecisionPanel | `/interview/hr-review/all`, `/interview/hr-review/submit-decision/{id}`, `/interview/explainability/explain` |
| AIModelDashboard | `/interview/hr-review/metrics`, `/interview/hr-review/disagreements` |
| UpskillingPage | `/interview/upskilling/analyze-gaps`, `/interview/upskilling/learning-path` |
| VoiceEmotionPage | `/interview/voice-emotion/analyze` |
| BiasDetectionPage | `/interview/bias-detection/analyze` |
| CodeOriginalityPage | `/interview/code-originality/analyze` |
| CandidatePotentialPage | `/interview/candidate-potential/analyze` |
| TeamChemistryPage | `/interview/team-chemistry/predict` |
| SecurityMonitor / ViolationAlert | `/security/violations/*` + STOMP topics |
| GamificationDashboard | `/gamification/*` |

## 3. Backend vs Frontend Gap Analysis

### Backend Features Already Used in Frontend

1. Authentication and role routing
2. Question CRUD and HR question bank
3. Interview listing and submission flow
4. CV upload and AI CV analysis
5. Candidate listing and interview history
6. Analytics overview, trends, score distribution
7. Security monitoring and real-time violation alerts
8. Talent matching
9. HR review workflow and AI explanation
10. Upskilling recommendations
11. Voice emotion analysis
12. Bias detection
13. Code originality detection
14. Candidate potential analysis
15. Team chemistry prediction
16. Gamification dashboard

### Backend Features Not Used or Not Fully Used in Frontend

1. Code execution engine and test case runner
2. Mock interview coach workflow
3. Predictive hiring analytics and salary benchmark
4. Smart scheduler and interviewer workload view
5. Blockchain skill certificate issuance and verification
6. Real-time translation and language detection
7. Interview report generator and executive summaries
8. Scorecard and explainable scoring pages
9. Shortlist generation UI on top of `/interview/scoring/shortlist`
10. Audit trail explorer and explainability timeline
11. Multimodal interview capture and full audio/video analysis UI
12. Feedback authoring and review sharing workflow
13. Admin audit-log explorer
14. Full company CRUD management pages
15. Candidate-facing AI chat workflow
16. Template statistics and advanced template management UX

### Real Gaps Found in Existing Integration

1. `src/services/aiRecruitmentService.ts` was calling `/interview/scoring/score`, while backend exposes `/interview/scoring/evaluate`. Fixed.
2. `src/services/aiRecruitmentService.ts` was sending `jobTitle` to question generation, while backend expects `role`. Fixed.
3. `src/services/aiRecruitmentService.ts` modeled shortlist as `GET /interview/scoring/shortlist/{jobId}`, while backend exposes `POST /interview/scoring/shortlist`. Fixed.
4. Several HR AI pages still rely on demo fallback data when API fails. That keeps UI alive but hides backend contract issues.

## 4. Required Frontend Features

| Unused Backend Capability | Page To Create | UI Component(s) | User Action | Data To Display |
|---|---|---|---|---|
| Code execution | `HR/CodeExecutionLabPage` and candidate coding sandbox | editor, language selector, stdin panel, test case table, results drawer | run code, run tests, quality check | output, runtime, memory, passed tests, quality metrics |
| Mock interview coach | `Candidate/MockInterviewPage` | question card, answer box, timer, session progress, feedback panel | start session, submit answer, next question, end session | question history, coach feedback, readiness score |
| Predictive hiring | `HR/PredictiveHiringPage` | candidate selector, benchmark cards, risk gauges, funnel chart | predict outcome, compare salary, open funnel insights | retention risk, acceptance probability, market salary, funnel bottlenecks |
| Smart scheduler | `HR/SmartSchedulerPage` | calendar grid, timezone picker, slot ranking list, interviewer workload heatmap | find slots, reschedule, inspect interviewer load | ranked slots, timezone notes, workload summary |
| Blockchain certificates | `HR/CertificatesPage` and public verify screen | issue modal, certificate table, verify form, QR panel | issue certificate, verify id, revoke certificate | certificate status, chain validity, verification URL |
| Translation | `Interview/LiveTranslationPanel` | text input, language selectors, detected-language badge, translation feed | translate, batch translate, detect language | translated text, confidence, preserved terms |
| Interview reports | `HR/InterviewReportsPage` | report builder form, report viewer, executive summary cards, compare modal | generate report, view executive summary, compare candidates | HTML report, hiring recommendation, score breakdown |
| Explainable scorecards | `HR/ScorecardsPage` | scorecard tabs, reason-code chips, explanation drawer, comparison matrix | generate scorecard, explain score, compare candidates | feature weights, reason codes, score explanation |
| Audit trails | `HR/AuditTrailPage` | candidate filter, timeline, event-type filter, date range picker | inspect candidate decisions, compliance review | audit events, timestamps, event metadata |
| Multimodal interview | `Interview/MultimodalReviewPage` | transcript viewer, audio waveform, video metrics cards, confidence timeline | upload/session review, analyze multimodal | transcript, emotion, eye contact, posture, engagement |
| Feedback workflow | `HR/FeedbackWorkbenchPage` | feedback composer, question-level annotations, share toggle | write feedback, finalize, share to candidate | overall feedback, per-question notes, feedback stats |
| Admin company management | `Admin/CompaniesPage` | company data table, CRUD modal, status filters | create, edit, delete companies | company records, counts, status |
| AI chat | `Candidate/PostInterviewChatPage` | conversation panel, input box, suggestion chips | start chat, send message, view history | threaded messages, AI responses, conversation status |

## 5. Frontend Structure Improvement

### Recommended Architecture

1. Split `src/services/aiRecruitmentService.ts` into domain services:
   - `questionGenerationService.ts`
   - `scoringService.ts`
   - `hrReviewService.ts`
   - `matchingService.ts`
   - `upskillingService.ts`
   - `advancedInterviewService.ts`
2. Introduce feature folders with local UI, hooks, and types:
   - `features/code-execution/*`
   - `features/mock-interview/*`
   - `features/predictive-hiring/*`
   - `features/reports/*`
   - `features/scheduler/*`
3. Add a unified API contract layer with typed request/response DTOs per endpoint group.
4. Move page-level data fetching into custom hooks such as `useCandidates`, `useHRReviews`, `useInterviewReports`, `usePredictiveHiring`.
5. Add React Query or equivalent for server-state caching, retries, invalidation, and mutation tracking.
6. Centralize auth/session state instead of repeated `localStorage` reads across pages.
7. Standardize response parsing because backend often returns `{ success, message, data }`, `{ success, ...namedPayload }`, and paged objects in different shapes.
8. Lazy-load heavy HR AI routes to reduce the current large production bundle.

### Recommended Folder Shape

```text
src/
  app/
    router/
    providers/
    auth/
  services/
    core/apiClient.ts
    core/wsClient.ts
    authService.ts
    candidateService.ts
    interviewService.ts
    analyticsService.ts
  features/
    questions/
    candidates/
    submissions/
    hr-review/
    scorecards/
    reports/
    code-execution/
    mock-interview/
    predictive-hiring/
    scheduler/
    certificates/
    translation/
  shared/
    components/
    hooks/
    utils/
    types/
```

## 6. Final Result

### 1. Backend features already used in frontend

- Auth and registration
- Dashboards and analytics
- Question management and AI question generation
- Interview listing and answer submission
- CV upload and AI analysis
- Candidate list and history
- HR review and AI explanation
- Talent matching
- Upskilling
- Voice emotion
- Bias detection
- Code originality
- Candidate potential
- Team chemistry
- Security monitoring
- Gamification

### 2. Backend features not used in frontend

- Code execution
- Mock interview coach
- Predictive hiring
- Smart scheduler
- Blockchain certificates
- Translation
- Interview report generation
- Explainable scorecards
- Audit trail explorer
- Multimodal review workspace
- Feedback authoring workflow
- Admin company management depth
- Candidate AI chat

### 3. Frontend pages that must be created

- HR Code Execution Lab
- Candidate Mock Interview Page
- HR Predictive Hiring Page
- HR Smart Scheduler Page
- HR Certificates Page
- Public Certificate Verification Page
- Interview Translation Panel
- HR Interview Reports Page
- HR Scorecards Page
- HR Audit Trail Page
- Interview Multimodal Review Page
- HR Feedback Workbench Page
- Admin Companies Page
- Candidate Post-Interview Chat Page

### 4. UI components that must be added

- Monaco-based code editor panel
- Test case runner table
- Mock session progress timeline
- Salary benchmark cards
- Retention risk gauges
- Scheduling heatmap and timezone overlap matrix
- Certificate issue and verify widgets
- Translation composer and language detector
- Report viewer and comparison modal
- Score explanation drawer and reason-code chips
- Audit timeline viewer
- Transcript + waveform + video insight panels
- Feedback annotation sidebar
- Company CRUD table and modal
- Reusable API status banner for demo/fallback states

### 5. Recommended full frontend structure

- Domain-oriented services instead of one large AI service file
- Feature folders with local hooks/types/components
- Shared typed API contract layer
- React Query for server state
- Central auth/session store
- Route-level lazy loading for heavy AI pages
- Unified response adapters for backend payload variability
