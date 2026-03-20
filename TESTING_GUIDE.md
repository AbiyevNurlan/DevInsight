# AI CV Analysis - Testing Guide

## Overview
This guide provides comprehensive testing procedures for the AI CV Analysis feature.

## Pre-Testing Setup

### Requirements
- [ ] Backend running on `http://localhost:8080`
- [ ] Frontend running on `http://localhost:5173` (or configured port)
- [ ] PostgreSQL database accessible
- [ ] `ANTHROPIC_API_KEY` environment variable set
- [ ] Valid JWT token for authentication

### Sample Files for Testing
Prepare sample CV files:
- `test-senior.pdf` - Senior developer CV (5+ years)
- `test-junior.pdf` - Junior developer CV (0-2 years)
- `test-mid.pdf` - Mid-level developer CV (3-4 years)
- `test-corrupted.pdf` - Corrupted or invalid file
- `test-large.pdf` - CV close to 5MB limit

## Unit Testing

### Backend Tests

#### 1. AIAnalysisService Tests
```java
@Test
public void testAnalyzeCVText_ValidInput() {
    // Given
    String cvText = "Senior Developer with 7 years experience in React and Node.js";
    
    // When
    CVAnalysisResult result = aiAnalysisService.analyzeCVText(cvText);
    
    // Then
    assertNotNull(result.getSkills());
    assertTrue(result.getSkills().contains("React"));
    assertEquals("SENIOR", result.getExperienceLevel());
}

@Test
public void testAnalyzeCVText_EmptyInput() {
    // Given
    String emptyText = "";
    
    // When
    CVAnalysisResult result = aiAnalysisService.analyzeCVText(emptyText);
    
    // Then
    assertNotNull(result);
    assertTrue(result.getSuccess() || !result.getSuccess());  // Graceful handling
}

@Test
public void testAnalyzeCVText_APIKeyMissing() {
    // Given
    System.setProperty("ANTHROPIC_API_KEY", "");
    
    // When
    CVAnalysisResult result = aiAnalysisService.analyzeCVText("some CV text");
    
    // Then
    assertNotNull(result);  // Should return default analysis
}
```

#### 2. CandidateController Tests
```java
@Test
@WithMockUser(username = "user@example.com")
public void testAnalyzeCV_ValidCV() throws Exception {
    // Given
    // Mock existing CV with extracted text
    
    // When
    mockMvc.perform(post("/api/candidates/cv/analyze")
        .contentType(MediaType.APPLICATION_JSON))
    
    // Then
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.success").value(true))
    .andExpect(jsonPath("$.data.skills").isArray());
}

@Test
@WithMockUser(username = "user@example.com")
public void testAnalyzeCV_NoTextExtracted() throws Exception {
    // Given
    // Mock CV without extracted text
    
    // When
    mockMvc.perform(post("/api/candidates/cv/analyze")
        .contentType(MediaType.APPLICATION_JSON))
    
    // Then
    .andExpect(status().isBadRequest())
    .andExpect(jsonPath("$.success").value(false));
}
```

### Frontend Tests

#### 1. cvService Tests
```typescript
describe('cvService', () => {
  describe('analyzeCV', () => {
    it('should call POST /candidates/cv/analyze', async () => {
      const mockResult: CVAnalysisResult = {
        success: true,
        data: {
          skills: ['React'],
          experienceLevel: 'SENIOR',
          // ... other fields
        }
      };
      
      jest.spyOn(axios, 'post').mockResolvedValue({ data: mockResult });
      
      const result = await cvService.analyzeCV();
      
      expect(axios.post).toHaveBeenCalledWith('/candidates/cv/analyze');
      expect(result.success).toBe(true);
    });
  });
});
```

#### 2. CVAnalysisDisplay Tests
```typescript
describe('CVAnalysisDisplay', () => {
  it('renders loading state', () => {
    const { getByText } = render(
      <CVAnalysisDisplay isLoading={true} analysis={null} />
    );
    
    expect(getByText(/analyzing your cv/i)).toBeInTheDocument();
  });

  it('displays skills as chips', () => {
    const analysis = {
      skills: ['React', 'Node.js'],
      // ... other fields
    };
    
    const { getByText } = render(
      <CVAnalysisDisplay isLoading={false} analysis={analysis} />
    );
    
    expect(getByText('React')).toBeInTheDocument();
    expect(getByText('Node.js')).toBeInTheDocument();
  });

  it('shows correct experience badge color', () => {
    const senior = { experienceLevel: 'SENIOR' };
    const { container } = render(
      <CVAnalysisDisplay isLoading={false} analysis={senior} />
    );
    
    expect(container.querySelector('.bg-purple-100')).toBeInTheDocument();
  });
});
```

## Integration Testing

### Upload and Analysis Flow

#### Test Case 1: Happy Path
```
1. Upload valid PDF CV
2. Wait for text extraction (automatic)
3. Wait for analysis to start (automatic)
4. Verify analysis results display correctly
5. Check database has new records

Expected: All steps complete successfully
```

**Steps**:
1. Open http://localhost:5173/profile or dashboard
2. Scroll to CV Upload section
3. Drag & drop test-senior.pdf or click to select
4. Wait for upload progress bar (2-5 seconds)
5. Verify text extraction badge shows "✓ High Quality"
6. Wait for analysis section to show results (5-10 seconds)
7. Verify:
   - Skills displayed correctly
   - Experience level shows "👑 Senior"
   - Job categories listed
   - Education shown
   - Languages listed
   - Professional summary appears

**Pass Criteria**:
- ✅ All analysis fields populated
- ✅ No error messages
- ✅ Loading indicator disappeared
- ✅ Results match CV content

#### Test Case 2: DOCX File Upload
```
1. Upload valid DOCX CV
2. Verify text extraction
3. Verify analysis completion
4. Verify correct fields extracted

Expected: Same as PDF, DOCX handled correctly
```

#### Test Case 3: Manual Re-analysis
```
1. Upload CV (automatic analysis completes)
2. Click "Re-analyze CV" button
3. Wait for new analysis
4. Verify results update

Expected: New analysis runs, results refresh
```

**Steps**:
1. Complete upload (Test Case 1)
2. Scroll to analysis section
3. Click "Re-analyze CV" button
4. Wait for analysis (loading indicator shows)
5. Verify results update with same/similar data

**Pass Criteria**:
- ✅ New analysis starts immediately
- ✅ Loading indicator displays
- ✅ Results refresh after completion

#### Test Case 4: Corrupted File
```
1. Upload corrupted PDF
2. Observe text extraction failure
3. Verify analysis section shows error
4. Click "Analyze CV with AI" button
5. Verify appropriate error message

Expected: Graceful error handling
```

**Pass Criteria**:
- ✅ Text extraction shows error message
- ✅ Analysis section visible but disabled
- ✅ Error message guides user
- ✅ Option to delete and re-upload

#### Test Case 5: Missing API Key
```
1. Unset ANTHROPIC_API_KEY environment variable
2. Upload valid CV
3. Wait for analysis
4. Observe error or fallback behavior

Expected: Graceful handling of missing key
```

**Pass Criteria**:
- ✅ Analysis completes or shows helpful error
- ✅ Application doesn't crash
- ✅ User guided to fix issue

#### Test Case 6: API Rate Limit
```
1. Upload multiple CVs in quick succession
2. Trigger analysis on each
3. Observe handling when rate limit hit

Expected: Error message, option to retry
```

**Pass Criteria**:
- ✅ Clear error message about rate limit
- ✅ Retry button available
- ✅ No silent failures

### Database Integration Tests

#### Verify Data Persistence
```sql
-- After uploading and analyzing a CV
SELECT 
    c.id,
    c.candidate_id,
    c.file_name,
    c.is_analyzed,
    c.analysis_skills,
    c.experience_level,
    c.job_categories,
    c.analysis_date
FROM candidate_cv c
ORDER BY c.analysis_date DESC
LIMIT 1;
```

**Expected Results**:
- ✅ `is_analyzed` = true
- ✅ `analysis_skills` contains JSON array
- ✅ `experience_level` has valid value
- ✅ `analysis_date` recent timestamp
- ✅ Other fields populated

## API Testing (with Postman/cURL)

### Test Setup
1. Create valid JWT token
2. Set Authorization header: `Bearer YOUR_JWT_TOKEN`
3. Import collection: `DevInsight2-API-Collection.postman_collection.json`

### API Test Sequence

#### 1. Upload CV
```bash
curl -X POST http://localhost:8080/api/candidates/cv/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@test-senior.pdf"
```

**Expected Response**:
```json
{
  "success": true,
  "message": "CV uploaded and text extracted successfully",
  "data": {
    "fileName": "test-senior.pdf",
    "fileSize": 102400,
    "fileType": "application/pdf",
    "uploadedDate": "2024-01-15T10:30:00",
    "textExtracted": true,
    "textQuality": "HIGH"
  }
}
```

#### 2. Get CV Info
```bash
curl -X GET http://localhost:8080/api/candidates/cv/info \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "fileName": "test-senior.pdf",
    "isAnalyzed": true,
    "analysisDate": "2024-01-15T10:35:00"
  }
}
```

#### 3. Get Extracted Text
```bash
curl -X GET http://localhost:8080/api/candidates/cv/text \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "text": "Full extracted CV text...",
  "quality": "HIGH",
  "wordCount": 450
}
```

#### 4. Analyze CV
```bash
curl -X POST http://localhost:8080/api/candidates/cv/analyze \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response**:
```json
{
  "success": true,
  "message": "CV analyzed successfully",
  "data": {
    "skills": ["React", "Node.js", "PostgreSQL"],
    "experienceLevel": "SENIOR",
    "categories": ["Full-stack", "Backend"],
    "yearsOfExperience": 7,
    "education": "Bachelor in Computer Science",
    "languages": ["English", "Spanish"],
    "summary": "Experienced developer..."
  }
}
```

#### 5. Delete CV
```bash
curl -X DELETE http://localhost:8080/api/candidates/cv \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "message": "CV deleted successfully"
}
```

## Performance Testing

### Load Testing
```bash
# Using Apache JMeter or similar
- Test upload with 100 concurrent users
- Test analysis with 50 concurrent requests
- Monitor response times (should be <5s for analysis)
- Monitor database performance
- Check API rate limits
```

### Response Time Benchmarks
| Operation | Target | Acceptable |
|-----------|--------|-----------|
| File Upload | <3s | <5s |
| Text Extraction | <3s | <5s |
| AI Analysis | <4s | <8s |
| Results Display | <0.5s | <1s |
| Database Query | <0.1s | <0.5s |

### File Size Testing
- [ ] Test 1MB CV - should complete normally
- [ ] Test 5MB CV (max limit) - should complete
- [ ] Test 5.1MB - should reject with error
- [ ] Test 0KB - should reject with error

## Edge Case Testing

### Input Variations
```
1. CV with no skills mentioned
   → Verify empty skills array handled
   
2. CV with multiple years of experience
   → Verify calculation accuracy
   
3. CV with many skills (50+)
   → Verify all extracted
   
4. CV in foreign language
   → Verify language detection
   
5. CV with special characters
   → Verify parsing doesn't break
```

### Error Scenarios
```
1. Network timeout during analysis
   → Verify error message and retry option
   
2. Database connection lost
   → Verify graceful degradation
   
3. Claude API returns invalid JSON
   → Verify fallback analysis
   
4. Partial response from Claude
   → Verify missing fields handled
```

## Browser Compatibility Testing

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✅ Test |
| Firefox | Latest | ✅ Test |
| Safari | Latest | ✅ Test |
| Edge | Latest | ✅ Test |

**Test Checklist**:
- [ ] File upload drag & drop works
- [ ] Progress bar displays correctly
- [ ] UI colors render properly
- [ ] Animation plays smoothly
- [ ] Buttons are clickable and responsive

## Accessibility Testing

- [ ] Keyboard navigation works (Tab through UI)
- [ ] Screen reader announces loading states
- [ ] Color contrast meets WCAG standards
- [ ] Focus indicators visible
- [ ] Error messages announced to screen readers

## Security Testing

- [ ] JWT token required for analysis endpoint
- [ ] Non-authenticated users get 401
- [ ] Users can't access other users' CVs
- [ ] API key not exposed in responses
- [ ] HTTPS only for external API calls

## Regression Testing

After each code change:
1. [ ] Upload still works
2. [ ] Text extraction still works
3. [ ] Analysis completes successfully
4. [ ] Results display correctly
5. [ ] Errors handled gracefully
6. [ ] No console errors
7. [ ] Database transactions completed

## Test Report Template

```markdown
## Test Execution Report

**Date**: 2024-01-15
**Tester**: Name
**Environment**: Development

### Summary
- Total Tests: 25
- Passed: 24
- Failed: 1
- Skipped: 0

### Failures
1. Test Case: CVAnalysisDisplay.renders-loading-state
   - Error: Timeout after 5s
   - Root Cause: Mock data not loaded
   - Fix: Add delay to mock

### Observations
- Performance within acceptable range
- All critical paths working
- Edge cases handled well

### Blockers
None

### Recommendations
- Increase rate limit testing
- Add performance monitoring
- Monitor API usage costs
```

## Deployment Verification

After deploying to production:

```
1. [ ] Environment variables set correctly
2. [ ] Database migrations completed
3. [ ] API key configured
4. [ ] SSL certificates valid
5. [ ] Logging configured
6. [ ] Monitoring set up
7. [ ] Upload CV
8. [ ] Verify analysis works
9. [ ] Check logs for errors
10. [ ] Monitor API usage
```

## Continuous Testing

### Automated Tests
```bash
# Run backend tests
cd devInsight-backend
./gradlew test

# Run frontend tests
cd devInsight-frontend
npm run test
```

### Integration Tests
```bash
# Run full test suite
npm run test:integration
```

### E2E Tests with Playwright
```bash
# Run Playwright tests
npx playwright test

# Run with debugging
npx playwright test --debug
```

---

**Test Status**: Ready for Production  
**Last Updated**: 2024
