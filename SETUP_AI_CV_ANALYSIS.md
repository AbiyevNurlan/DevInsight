# AI CV Analysis Integration - Setup Guide

## Overview
This guide explains how to set up and use the AI-powered CV analysis feature that leverages Claude API from Anthropic to extract insights from uploaded CVs.

## Features
- **Automatic Analysis**: CV analysis starts automatically after successful upload
- **Skill Extraction**: Identifies and extracts technical skills from your CV
- **Experience Level**: Determines your professional level (JUNIOR/MID/SENIOR)
- **Job Categories**: Suggests relevant job categories based on your profile
- **Years of Experience**: Extracts total years of professional experience
- **Education**: Identifies education background
- **Languages**: Detects languages you speak
- **Professional Summary**: Generates an AI-powered summary of your profile

## Prerequisites

### Backend Requirements
- Spring Boot application running
- PostgreSQL database configured
- Java 11 or higher

### Frontend Requirements
- React with TypeScript
- Axios for HTTP requests
- Node.js and npm/yarn

### API Key Requirements
- **Anthropic Claude API Key** (FREE tier available)
  - Visit: https://console.anthropic.com/
  - Create a free account
  - Generate an API key from the dashboard
  - Note: Free tier has rate limits but is sufficient for development

## Environment Setup

### 1. Set ANTHROPIC_API_KEY (Windows)

#### Method 1: Using Environment Variables GUI
1. Press `Win + X` and select "System"
2. Click "Advanced system settings"
3. Click "Environment Variables" button
4. Under "User variables", click "New"
5. Variable name: `ANTHROPIC_API_KEY`
6. Variable value: `sk-ant-xxxxxxxxxxxxx...`
7. Click OK and restart your IDE/application

#### Method 2: Using PowerShell
```powershell
[Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "sk-ant-xxxxxxxxxxxxx...", "User")
```
Then restart your IDE for changes to take effect.

#### Method 3: Using Command Prompt
```cmd
setx ANTHROPIC_API_KEY sk-ant-xxxxxxxxxxxxx...
```
Then restart Command Prompt or IDE.

### 2. Alternative: application.yml Configuration
If you prefer hardcoding (NOT RECOMMENDED for production):

```yaml
anthropic:
  api-key: sk-ant-xxxxxxxxxxxxx...
  api-url: https://api.anthropic.com/v1/messages
  model: claude-3-5-sonnet-20241022
  max-tokens: 4096
```

### 3. Docker Setup (Optional)
If running in Docker, pass the environment variable:

```bash
docker run -e ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx... <other options>
```

Or in docker-compose.yml:
```yaml
services:
  backend:
    environment:
      ANTHROPIC_API_KEY: sk-ant-xxxxxxxxxxxxx...
```

## Backend Implementation

### Database Schema
The `CandidateCV` entity has been extended with analysis fields:

```java
@Entity
public class CandidateCV {
    // ... existing fields ...
    
    // Analysis fields
    private String analysisSkills;           // JSON array of skills
    private String experienceLevel;          // JUNIOR/MID/SENIOR
    private String jobCategories;            // JSON array of job categories
    private Integer yearsOfExperience;       // Years extracted from CV
    private String education;                // Education background
    private String languages;                // JSON array of languages
    private String analysisSummary;          // Professional summary
    private LocalDateTime analysisDate;      // When analysis was performed
    private Boolean isAnalyzed;              // Analysis flag
}
```

### API Endpoints

#### Upload CV
```
POST /api/candidates/cv/upload
Content-Type: multipart/form-data

Response:
{
  "success": true,
  "message": "CV uploaded successfully",
  "data": {
    "fileName": "resume.pdf",
    "fileSize": 102400,
    "fileType": "application/pdf",
    "uploadedDate": "2024-01-15T10:30:00",
    "textExtracted": true,
    "cvTextPreview": "John Doe - Senior Developer...",
    "textQuality": "HIGH"
  }
}
```

#### Analyze CV
```
POST /api/candidates/cv/analyze
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "message": "CV analyzed successfully",
  "data": {
    "skills": ["React", "Node.js", "PostgreSQL", "Docker", "AWS"],
    "experienceLevel": "SENIOR",
    "categories": ["Full-stack", "Backend", "Cloud"],
    "yearsOfExperience": 7,
    "education": "Bachelor of Science in Computer Science",
    "languages": ["English", "Spanish"],
    "summary": "Experienced full-stack developer with 7 years of expertise in building scalable web applications..."
  }
}
```

#### Get Extracted Text
```
GET /api/candidates/cv/text
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "text": "Full extracted CV text...",
  "quality": "HIGH",
  "wordCount": 450
}
```

## Frontend Integration

### Service Methods

```typescript
// Upload CV with progress tracking
const response = await cvService.uploadCV(file, (progress) => {
  console.log(`Uploaded: ${progress}%`);
});

// Get CV information
const cvInfo = await cvService.getCVInfo();

// Get extracted text
const textResponse = await cvService.getExtractedText();

// Analyze CV
const analysisResult = await cvService.analyzeCV();
console.log(analysisResult.data.skills);  // Array of detected skills
console.log(analysisResult.data.experienceLevel);  // JUNIOR/MID/SENIOR

// Delete CV
const deleteResponse = await cvService.deleteCV();
```

### Components

#### CVUpload Component
Handles file upload with:
- Drag & drop support
- File validation
- Progress tracking
- Text extraction status
- Automatic AI analysis trigger
- Analysis results display

```tsx
import CVUpload from '@/components/Candidate/CVUpload';

<CVUpload onUploadSuccess={() => console.log('CV uploaded!')} />
```

#### CVAnalysisDisplay Component
Shows analysis results:
- Experience level badge
- Skills as chips
- Job categories
- Education
- Languages
- Professional summary
- Loading state

```tsx
import CVAnalysisDisplay from '@/components/CVAnalysisDisplay';

<CVAnalysisDisplay 
  analysis={analysisData}
  isLoading={false}
/>
```

## How It Works

### Upload Flow
1. User selects/drags CV file (PDF or DOCX)
2. File is validated (size, type)
3. Uploaded to backend
4. Text extraction begins automatically
5. If extraction successful, AI analysis starts
6. Analysis results display in UI

### Analysis Process
1. Extracted CV text is sent to Claude API
2. Claude analyzes the text using a detailed prompt
3. Structured JSON response is parsed
4. Results are saved to database
5. UI displays formatted results

### Error Handling
- **Missing API Key**: Analysis shows error, suggests checking setup
- **API Rate Limit**: Graceful error message with retry option
- **Extraction Failed**: Analysis skipped, user can still view error details
- **Analysis Parse Error**: Fallback analysis provided with best-guess data

## Configuration Details

### Claude Model
- **Current Model**: `claude-3-5-sonnet-20241022`
- **Max Tokens**: 4096 (can be adjusted in application.yml)
- **API Version**: Latest (2024-06-01)

### Rate Limits
- Free tier has rate limits on the Anthropic API
- Production deployments should use paid tier
- Implement caching to avoid re-analyzing same CVs

### Prompt Engineering
The analysis prompt instructs Claude to:
- Extract technical skills with confidence
- Determine experience level based on years and seniority
- Identify relevant job categories
- Calculate years of experience
- Detect education credentials
- List languages
- Generate professional summary

## Troubleshooting

### "API Key not configured" Error
**Solution**: Ensure `ANTHROPIC_API_KEY` environment variable is set:
```powershell
# Check if variable is set
$env:ANTHROPIC_API_KEY

# If empty, set it:
[Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "sk-ant-...", "User")
```

### "Failed to analyze CV" Error
**Causes & Solutions**:
1. **Text not extracted**: Upload file might be corrupted or unsupported
   - Try a cleaner PDF or convert DOCX to PDF
2. **API rate limit**: Free tier exceeded
   - Wait a few minutes and retry
   - Consider upgrading to paid tier
3. **Network error**: Backend can't reach Anthropic
   - Check internet connection
   - Verify firewall settings

### Analysis Results Missing Fields
**Solution**: Not all fields are always detected. This is normal:
- If education field is empty, it wasn't found in CV
- If languages missing, none were detected
- Re-upload a clearer CV for better results

## Testing

### Manual Testing
1. Navigate to Profile or Candidate Dashboard
2. Upload a CV file
3. Wait for automatic analysis to complete
4. Verify all fields populate correctly

### API Testing with cURL
```bash
# Upload CV
curl -X POST http://localhost:8080/api/candidates/cv/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@resume.pdf"

# Analyze CV
curl -X POST http://localhost:8080/api/candidates/cv/analyze \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### API Testing with Postman
1. Import the Postman collection: `DevInsight2-API-Collection.postman_collection.json`
2. Set `ANTHROPIC_API_KEY` in environment variables
3. Upload CV using `/candidates/cv/upload`
4. Analyze using `/candidates/cv/analyze`

## Performance Considerations

### Caching
Current implementation saves analysis results to database:
- Avoids re-analyzing same CV
- Reduces API calls
- Instant results on reload

### Rate Limiting
- Implement database query caching
- Consider Redis for distributed caching
- Monitor API usage against free tier limits

### Async Processing (Future Enhancement)
For large-scale deployments, consider:
```java
@Async
public void analyzeCV(Long candidateId) {
    // Analysis logic
}
```

## Security

### API Key Management
- ✅ Using environment variables (secure)
- ✅ Not hardcoded in source
- ✅ Not logged or exposed in responses
- ✅ Only sent to Anthropic API

### Data Privacy
- Analysis results stored in secure database
- Only accessible by authenticated users
- CV text not shared beyond Anthropic API
- Comply with data protection regulations

### HTTPS
- All API calls to Anthropic use HTTPS
- Ensure production deployment uses HTTPS
- SSL/TLS certificates configured

## Upgrade Path

### Free to Paid
When ready to scale:
1. Create paid Anthropic account
2. Update `ANTHROPIC_API_KEY` with paid tier key
3. Adjust `max-tokens` in application.yml if needed
4. No code changes required

### Claude Model Upgrade
To use newer Claude versions:
1. Visit https://docs.anthropic.com/
2. Update `model` field in application.yml
3. Adjust `max-tokens` if needed
4. Test thoroughly before deploying

## Additional Resources

- **Anthropic Documentation**: https://docs.anthropic.com/
- **Claude API Guide**: https://docs.anthropic.com/claude/reference/messages-api
- **Free Tier Details**: https://console.anthropic.com/
- **Rate Limiting Info**: https://docs.anthropic.com/claude/reference/rate-limits

## Support

### Common Issues
For common issues and solutions, see the Troubleshooting section above.

### Contact
If issues persist:
1. Check application logs for error details
2. Verify environment variables are set correctly
3. Ensure backend is running and accessible
4. Check network connectivity to api.anthropic.com

## Version History

### v1.0.0 (Current)
- Initial implementation with Claude 3.5 Sonnet
- Automatic analysis after upload
- Skills, experience level, categories extraction
- Years of experience calculation
- Education and languages detection
- Professional summary generation
