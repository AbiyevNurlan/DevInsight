# AI CV Analysis - Quick Reference

## 🚀 Quick Start (5 Minutes)

### 1. Get Your API Key
Visit: https://console.anthropic.com/ → Create account → Get API key

### 2. Set Environment Variable (Windows)
```powershell
[Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "sk-ant-YOUR_KEY_HERE", "User")
```
Then restart VS Code or PowerShell.

### 3. Start Your Application
```bash
cd devInsight-backend
./gradlew bootRun
```

```bash
cd devInsight-frontend
npm install
npm run dev
```

### 4. Test It Out
- Upload a CV file (PDF or DOCX)
- Watch automatic analysis happen
- See skills, experience level, and categories extracted

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/main/java/az/edu/itbrains/devinsight2/ai/AIAnalysisService.java` | Claude API integration |
| `src/main/java/az/edu/itbrains/devinsight2/cv/dto/CVAnalysisResult.java` | Analysis response DTO |
| `src/main/java/az/edu/itbrains/devinsight2/cv/CandidateController.java` | `/analyze` endpoint |
| `src/main/java/az/edu/itbrains/devinsight2/cv/model/CandidateCV.java` | Database entity |
| `src/services/cvService.ts` | Frontend service |
| `src/components/Candidate/CVUpload.tsx` | Upload component |
| `src/components/CVAnalysisDisplay.tsx` | Results display |
| `application.yml` | Config file |

## 🔌 API Endpoints

### Upload CV
```
POST /api/candidates/cv/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: file (PDF or DOCX, max 5MB)
```

### Analyze CV
```
POST /api/candidates/cv/analyze
Authorization: Bearer <token>

Returns: { success, data: { skills, experienceLevel, ... } }
```

### Get CV Info
```
GET /api/candidates/cv/info
Authorization: Bearer <token>
```

### Get Extracted Text
```
GET /api/candidates/cv/text
Authorization: Bearer <token>
```

### Delete CV
```
DELETE /api/candidates/cv
Authorization: Bearer <token>
```

## 💻 Frontend Usage

```typescript
import { cvService } from '@/services/cvService';
import CVAnalysisDisplay from '@/components/CVAnalysisDisplay';

// Upload and analyze
const response = await cvService.uploadCV(file);

// Manual analysis
const analysis = await cvService.analyzeCV();

// Display results
<CVAnalysisDisplay analysis={analysis.data} isLoading={false} />
```

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| "API Key not configured" | Check environment variable: `echo $env:ANTHROPIC_API_KEY` |
| Analysis not starting | Ensure CV text extracted successfully first |
| API rate limit error | Wait a minute, then retry (free tier limit) |
| Timeout error | Check internet connection to api.anthropic.com |
| Missing fields | Not all CVs have all info - this is normal |

## 📊 Data Models

### CVAnalysisResult
```typescript
{
  success: boolean;
  message: string;
  data: {
    skills: string[];                    // ["React", "Node.js", ...]
    experienceLevel: "JUNIOR" | "MID" | "SENIOR";
    categories: string[];                // ["Full-stack", "Backend", ...]
    yearsOfExperience: number;           // 5
    education: string;                   // "Bachelor of CS"
    languages: string[];                 // ["English", "Spanish"]
    summary: string;                     // Professional summary text
  }
}
```

## 🎨 UI Colors

| Element | Color | Class |
|---------|-------|-------|
| JUNIOR badge | Blue | `bg-blue-100 text-blue-800` |
| MID badge | Green | `bg-green-100 text-green-800` |
| SENIOR badge | Purple | `bg-purple-100 text-purple-800` |
| Skills | Yellow | `bg-yellow-100 text-yellow-800` |
| Categories | Blue | `bg-blue-100 text-blue-800` |
| Languages | Red | `bg-red-100 text-red-800` |
| Loading | Blue | Animated gradient |

## 🔧 Configuration (application.yml)

```yaml
anthropic:
  api-key: ${ANTHROPIC_API_KEY:}  # Falls back to env var
  api-url: https://api.anthropic.com/v1/messages
  model: claude-3-5-sonnet-20241022
  max-tokens: 4096
```

## 📈 Performance Tips

- **First analysis**: Takes 2-5 seconds (API call)
- **Cached**: Subsequent loads instant (from database)
- **Max file**: 5MB PDF or DOCX
- **Free tier**: 15 requests/min limit

## 🔐 Security Notes

✅ API key stored in environment variables  
✅ API key never logged or exposed  
✅ All calls to Anthropic use HTTPS  
✅ Results only accessible by authenticated users  
✅ CV text deleted when CV deleted  

⚠️ Never hardcode API key in source code  
⚠️ Never commit `.env` files  
⚠️ Rotate API keys regularly in production  

## 📞 Common Tasks

### Check if API Key is Set
```powershell
echo $env:ANTHROPIC_API_KEY
```

### Force Analysis on Existing CV
```typescript
// In frontend
const result = await cvService.analyzeCV();
```

### View Recent Analysis (Database)
```sql
SELECT * FROM candidate_cv 
WHERE candidate_id = ? 
AND is_analyzed = true 
ORDER BY analysis_date DESC 
LIMIT 1;
```

### Clear Analysis Results (Database)
```sql
UPDATE candidate_cv 
SET is_analyzed = false, analysis_skills = NULL 
WHERE candidate_id = ?;
```

## 🚀 Deployment Reminders

1. Set `ANTHROPIC_API_KEY` in production environment
2. Use HTTPS for all API calls
3. Monitor Claude API usage and costs
4. Backup database regularly
5. Test with production data before going live
6. Monitor error logs for API issues

## 📚 Learn More

- Anthropic Docs: https://docs.anthropic.com/
- Claude API: https://docs.anthropic.com/claude/reference/messages-api
- Free Tier: https://console.anthropic.com/

## ❓ FAQ

**Q: Does analysis cost money?**  
A: Free tier is available. Paid tier required after usage limits.

**Q: Can I change the Claude model?**  
A: Yes, update `model` field in application.yml and test.

**Q: What if CV text extraction fails?**  
A: Analysis is skipped, user sees error message. Upload clearer CV.

**Q: Is my CV data safe?**  
A: Yes, only sent to Claude API and stored in your database. Not shared elsewhere.

**Q: Can I re-analyze a CV?**  
A: Yes, click "Re-analyze CV" button in UI or call analyzeCV() method.

**Q: What formats are supported?**  
A: PDF and DOCX files, max 5MB.

---

**Last Updated**: 2024  
**Status**: ✅ Production Ready
