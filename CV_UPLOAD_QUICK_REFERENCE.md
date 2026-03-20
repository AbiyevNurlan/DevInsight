# CV Upload Integration Quick Reference

## Quick Start for Testing

### 1. **Frontend Setup**
No additional setup needed! The component is ready to use:

```tsx
import CVUpload from '@/components/Candidate/CVUpload';

// In your page/component:
<CVUpload onUploadSuccess={() => console.log('CV uploaded!')} />
```

### 2. **Backend Requirements**
Ensure these services exist:
- `FileStorageService` - File storage & validation
- `CVTextExtractionService` - PDF/DOCX text extraction
- `CandidateCVRepository` - Database operations
- `CandidateCV` Entity - Database model

### 3. **Test the Upload**
```bash
# Using curl:
curl -X POST http://localhost:8080/api/candidates/cv/upload \
  -H "Authorization: Bearer <your_token>" \
  -F "file=@/path/to/resume.pdf"

# Expected response:
{
  "success": true,
  "message": "CV uploaded and text extracted successfully",
  "fileName": "resume.pdf",
  "fileSize": 245892,
  "fileType": "PDF",
  "uploadedDate": "2026-01-09T15:30:00",
  "textExtracted": true,
  "cvTextPreview": "...",
  "textQuality": "HIGH"
}
```

## Key Features ✅

| Feature | Implementation |
|---------|-----------------|
| **File Upload** | POST `/api/candidates/cv/upload` |
| **Get CV Info** | GET `/api/candidates/cv/info` |
| **Get Extracted Text** | GET `/api/candidates/cv/text` |
| **Delete CV** | DELETE `/api/candidates/cv` |
| **Progress Tracking** | `onUploadProgress` callback |
| **Validation** | Client (type/size) + Server |
| **Text Extraction** | Automatic, quality-rated |
| **Error Handling** | Detailed messages + logging |

## Component Props

```typescript
interface CVUploadProps {
  onUploadSuccess?: () => void;  // Called after successful upload
}
```

## Service Methods

```typescript
// Upload with progress
const response = await cvService.uploadCV(file, (progress) => {
  console.log(`${progress}%`);
});

// Get CV info
const info = await cvService.getCVInfo();

// Get full extracted text
const text = await cvService.getExtractedText();

// Delete CV
const result = await cvService.deleteCV();

// Validate file
const valid = cvService.validateFile(file);

// Format bytes
const size = cvService.formatFileSize(12345); // "12.05 KB"
```

## Response Handling

### Upload Response:
```typescript
interface CVUploadResponse {
  success: boolean;
  message: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  uploadedDate?: string;
  textExtracted?: boolean;
  cvTextPreview?: string;
  textQuality?: 'HIGH' | 'MEDIUM' | 'LOW';
  extractionError?: string;
}
```

### Extracted Text Response:
```typescript
interface ExtractedTextResponse {
  success: boolean;
  text: string;
  quality: 'HIGH' | 'MEDIUM' | 'LOW';
  wordCount: number;
  message?: string;
}
```

## Customization Examples

### Change Upload Endpoint:
```typescript
// In cvService.ts
uploadCV: async (file: File, onProgress?: (progress: number) => void) => {
  const response = await axios.post('/your-custom-endpoint', formData, {...});
  return response.data;
}
```

### Add Toast Notifications:
```typescript
import { useToast } from '@/components/ui/toast'; // or your toast library

const { toast } = useToast();

// In component:
if (response.success) {
  toast.success('CV uploaded successfully! ✅');
} else {
  toast.error(response.message);
}
```

### Add to User Profile:
```tsx
import CVUpload from '@/components/Candidate/CVUpload';
import CandidateProfile from '@/pages/Candidate/CandidateProfile';

export default function Profile() {
  return (
    <div className="space-y-6">
      <CandidateProfile />
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Your CV</h2>
        <CVUpload onUploadSuccess={() => {
          // Refresh profile data
        }} />
      </div>
    </div>
  );
}
```

## Error Scenarios & Handling

### File Too Large:
```
Error: "File size must be less than 5MB"
```

### Invalid File Type:
```
Error: "Only PDF and DOCX files are allowed"
```

### Upload Fails:
```
Error: "Failed to upload CV: {error message}"
```

### Text Extraction Fails:
```
Success: true (but textExtracted: false)
Error: "Unable to extract from scanned image"
```

### No CV Found:
```
Error: "No CV found"
```

## Database Schema Requirements

The `CandidateCV` entity should have:
```java
@Entity
public class CandidateCV {
  @Id private Long id;
  @Column private Long userId;
  @Column private String fileName;
  @Column private String filePath;
  @Column private Long fileSize;
  @Column private String fileType;
  @Column private LocalDateTime uploadedDate;
  @Column private Boolean textExtracted;
  @Column(columnDefinition = "LONGTEXT") private String cvText;
  @Column private LocalDateTime textExtractedAt;
  @Column private String textQuality;
  @Column private String extractionError;
  @Column private Boolean isAnalyzed;
  @Column private LocalDateTime analysisDate;
  // ... getters/setters
}
```

## Authentication

The endpoints require:
- `@PreAuthorize("hasAnyRole('CANDIDATE', 'ADMIN', 'HR')")`
- Valid JWT token in Authorization header
- User ID extracted from token/principal

## Styling (Tailwind Classes)

Component uses these custom classes:
- `glass-card` - Semi-transparent background
- `shadow-lg` - Light shadow effects
- `rounded-xl` - Large border radius
- `transition-all` - Smooth animations
- `drag-active` styles for visual feedback

## Performance Tips

1. **Lazy load** the component if not always needed
2. **Debounce** the text viewer expand action
3. **Cache** extracted text responses
4. **Compress** PDFs before uploading for faster transfers
5. **Monitor** upload progress for large files

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## File Size Recommendations

- **Optimal**: < 2MB (fast upload + extraction)
- **Acceptable**: 2-5MB (standard files)
- **Maximum**: 5MB (hard limit enforced)

## Known Limitations

1. Max file size: 5MB
2. Only PDF and DOCX supported
3. Scanned/image PDFs may have extraction issues
4. Text extraction quality depends on file quality
5. No file preview before upload

## Debug Mode

Enable console logging:
```typescript
// In browser console
localStorage.setItem('DEBUG_CV_UPLOAD', 'true');
```

Then check browser DevTools Console for detailed logs.

## Support & Troubleshooting

### Upload button not working?
- Check network connectivity
- Verify auth token is valid
- Check browser console for errors

### Text not extracting?
- File may be scanned/image-based
- Try different PDF with searchable text
- Check file corruption with other tools

### Component not rendering?
- Ensure all dependencies imported
- Check Tailwind CSS is configured
- Verify lucide-react icons are installed

---

**Last Updated**: January 9, 2026  
**Status**: ✅ Ready for Production
