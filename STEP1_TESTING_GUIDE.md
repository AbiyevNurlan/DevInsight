# STEP 1: CV Upload & File Storage - Testing Guide

## ✅ Implementation Complete!

All components have been created and are ready for testing.

---

## 📁 Files Created

### Backend (Java Spring Boot):
1. **Configuration**: `application.yml` - File storage settings added
2. **Service**: `FileStorageService.java` - File upload/download/validation
3. **Entity**: `CandidateCV.java` - Database model
4. **Repository**: `CandidateCVRepository.java` - Data access layer
5. **DTO**: `CVUploadResponseDto.java` - Response data structure
6. **Controller**: `CVController.java` - REST API endpoints
7. **SQL Migration**: `01_initial_schema.sql` - candidate_cvs table added

### Frontend (React + TypeScript):
1. **Service**: `cvService.ts` - API integration and utilities
2. **Component**: `CVUpload.tsx` - Drag & drop upload component
3. **Page**: `CandidateProfile.tsx` - Test page with CV upload
4. **Routes**: Added to `App.tsx`

---

## 🗄️ Database Setup

### Step 1: Run the migration (if not using JPA auto-create)

```sql
-- This is already in 01_initial_schema.sql, but run it manually if needed:

CREATE TABLE IF NOT EXISTS candidate_cvs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL UNIQUE,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(10) NOT NULL,
    uploaded_date TIMESTAMP NOT NULL DEFAULT NOW(),
    is_analyzed BOOLEAN NOT NULL DEFAULT false,
    analysis_date TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_cv_user ON candidate_cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_analyzed ON candidate_cvs(is_analyzed);
```

---

## 🚀 How to Test

### 1. Start Backend

```bash
cd devInsight-backend
./gradlew bootRun
```

Backend should start on: http://localhost:8080

### 2. Start Frontend

```bash
cd devInsight-frontend
npm run dev
```

Frontend should start on: http://localhost:5173

### 3. Navigate to Test Page

**Login as a Candidate** (or create a candidate user):
- Email: candidate@example.com
- Password: (your password)

Then navigate to: http://localhost:5173/candidate/profile

---

## ✅ Testing Checklist

### Backend Tests:

#### ✅ File Validation
- [ ] Upload valid PDF → Should succeed
- [ ] Upload valid DOCX → Should succeed
- [ ] Upload .jpg file → Should fail with "Invalid file type"
- [ ] Upload file > 5MB → Should fail with "File too large"
- [ ] Upload empty file → Should fail

#### ✅ File Storage
- [ ] Check file created in: `~/devinsight/cvs/{userId}/cv_YYYYMMDD_HHMMSS.pdf`
- [ ] Verify file permissions are correct
- [ ] Check database record created in `candidate_cvs` table

#### ✅ API Endpoints

**POST /api/candidates/cv/upload**
```bash
curl -X POST http://localhost:8080/api/candidates/cv/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/resume.pdf"
```

Expected Response:
```json
{
  "success": true,
  "message": "CV uploaded successfully",
  "data": {
    "fileName": "resume.pdf",
    "fileSize": 123456,
    "fileType": "PDF",
    "uploadedDate": "2026-01-08T10:30:00"
  }
}
```

**GET /api/candidates/cv/info**
```bash
curl -X GET http://localhost:8080/api/candidates/cv/info \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**DELETE /api/candidates/cv**
```bash
curl -X DELETE http://localhost:8080/api/candidates/cv \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Frontend Tests:

#### ✅ Drag & Drop
- [ ] Drag PDF file → Highlight drop zone in blue
- [ ] Drop PDF file → File selected, shows name and size
- [ ] Drag invalid file → Should show error

#### ✅ File Browser
- [ ] Click "Choose File" → Opens file picker
- [ ] Select PDF → File shows in preview
- [ ] Select DOCX → File shows in preview
- [ ] Select .jpg → Shows error message

#### ✅ Validation
- [ ] Upload 6MB file → Error: "File size must be less than 5MB"
- [ ] Upload .txt file → Error: "Only PDF and DOCX files are allowed"
- [ ] Upload valid file → Success

#### ✅ Upload Progress
- [ ] Progress bar appears during upload
- [ ] Shows percentage (0% → 100%)
- [ ] Cancel button works (if implemented)

#### ✅ Success State
- [ ] Shows green checkmark
- [ ] Displays: "CV Uploaded Successfully!"
- [ ] Shows file details (name, size, type, date)
- [ ] "Replace CV" button visible
- [ ] "Delete" button visible

#### ✅ Replace CV
- [ ] Click "Replace CV" → Back to upload state
- [ ] Upload new file → Old file deleted, new file stored
- [ ] Check only one CV exists per user in database

#### ✅ Delete CV
- [ ] Click "Delete" → Confirmation dialog
- [ ] Confirm → CV deleted from storage and database
- [ ] Back to empty upload state

#### ✅ Error Handling
- [ ] Network error → Shows friendly error message
- [ ] File too large → Shows size error
- [ ] Invalid type → Shows type error
- [ ] Retry button works

---

## 🔍 Manual Verification

### 1. Check File System
```bash
# Linux/Mac
ls -la ~/devinsight/cvs/

# Windows
dir %USERPROFILE%\devinsight\cvs\
```

You should see:
```
cvs/
  ├── 1/                    # User ID 1
  │   └── cv_20260108_103045.pdf
  ├── 2/                    # User ID 2
  │   └── cv_20260108_104521.docx
```

### 2. Check Database
```sql
-- View all CVs
SELECT * FROM candidate_cvs;

-- Expected columns:
-- id | user_id | file_name | file_path | file_size | file_type | uploaded_date | is_analyzed | analysis_date

-- Check specific user's CV
SELECT * FROM candidate_cvs WHERE user_id = 1;
```

### 3. Check Logs
```bash
# Backend logs should show:
[INFO] User 1 uploading CV: resume.pdf
[INFO] CV uploaded successfully for user 1: 1/cv_20260108_103045.pdf
```

---

## 🐛 Troubleshooting

### Issue: "Unable to extract user ID from authentication"

**Fix**: Update `CVController.getUserIdFromAuth()` method to match your JWT implementation.

```java
// Example for custom UserDetails:
CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
return userDetails.getId();

// Or if using email as principal:
String email = (String) authentication.getPrincipal();
User user = userRepository.findByEmail(email).orElseThrow();
return user.getId();
```

### Issue: "Directory creation failed"

**Fix**: Check permissions on home directory:
```bash
mkdir -p ~/devinsight/cvs
chmod 755 ~/devinsight/cvs
```

### Issue: "File upload fails with 413 Request Entity Too Large"

**Fix**: Ensure Spring Boot multipart config allows 5MB:
```yaml
spring:
  servlet:
    multipart:
      max-file-size: 100MB
      max-request-size: 100MB
```

### Issue: CORS errors in browser

**Fix**: Add CORS configuration in backend:
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:5173")
                    .allowedMethods("GET", "POST", "PUT", "DELETE");
            }
        };
    }
}
```

---

## 📊 Success Criteria

All these should work:
- ✅ Upload PDF file (< 5MB)
- ✅ Upload DOCX file (< 5MB)
- ✅ Reject invalid file types
- ✅ Reject files > 5MB
- ✅ Show upload progress
- ✅ Display success state with file info
- ✅ Replace existing CV
- ✅ Delete CV
- ✅ File stored in filesystem
- ✅ Database record created
- ✅ API returns correct responses

---

## 🎯 Next Steps

Once STEP 1 is tested and working, we'll proceed to:

**STEP 2: Text Extraction**
- Extract text from PDF files using Apache PDFBox
- Extract text from DOCX files using Apache POI
- Store extracted text in database
- Display extracted text in UI

**STEP 3: AI-Powered Analysis**
- Integrate with OpenAI API or local LLM
- Extract skills, experience, education
- Generate candidate summary
- Score candidate profile

**STEP 4: CV-Job Matching**
- Match CVs with interview templates
- Calculate match percentage
- Recommend best candidates for positions

---

## 🔐 Security Notes

- ✅ Files stored outside web root
- ✅ Filename sanitization prevents path traversal
- ✅ File type validation (client + server)
- ✅ File size limits enforced
- ✅ Authentication required (CANDIDATE role)
- ✅ One CV per user (unique constraint)

---

## 📸 Expected UI Flow

1. **Initial State**: Empty upload box with dashed border
2. **Hover State**: Blue border and background
3. **File Selected**: Shows file icon, name, size, Upload/Cancel buttons
4. **Uploading**: Progress bar with percentage
5. **Success**: Green checkmark, file details, Replace/Delete buttons
6. **Error**: Red error message with retry option

---

## ✅ You're Ready!

All code is implemented and ready for testing. Start the backend and frontend, navigate to `/candidate/profile`, and try uploading a CV!

Report any issues you encounter, and we'll fix them before moving to STEP 2. 🚀
