# CV Upload API Reference

## Base URL
```
http://localhost:8080/api/candidates/cv
```

## Authentication
All endpoints require JWT token with CANDIDATE role:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📤 Upload CV

**POST** `/upload`

Upload a CV file (PDF or DOCX, max 5MB).

### Request
- **Content-Type**: `multipart/form-data`
- **Body**: 
  - `file` (File): The CV file

### Response (Success - 200 OK)
```json
{
  "success": true,
  "message": "CV uploaded successfully",
  "data": {
    "fileName": "John_Doe_Resume.pdf",
    "fileSize": 245678,
    "fileType": "PDF",
    "uploadedDate": "2026-01-08T10:30:45"
  }
}
```

### Response (Error - 400 Bad Request)
```json
{
  "success": false,
  "message": "Invalid file. Only PDF and DOCX files under 5MB are allowed."
}
```

### Example (cURL)
```bash
curl -X POST http://localhost:8080/api/candidates/cv/upload \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "file=@/path/to/resume.pdf"
```

### Example (JavaScript)
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:8080/api/candidates/cv/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
```

---

## 📄 Get CV Info

**GET** `/info`

Get information about the current user's uploaded CV.

### Request
- No body required

### Response (Success - 200 OK)
```json
{
  "success": true,
  "data": {
    "fileName": "John_Doe_Resume.pdf",
    "fileSize": 245678,
    "fileType": "PDF",
    "uploadedDate": "2026-01-08T10:30:45",
    "isAnalyzed": false,
    "analysisDate": null
  }
}
```

### Response (No CV - 200 OK)
```json
{
  "success": false,
  "message": "No CV found"
}
```

### Example (cURL)
```bash
curl -X GET http://localhost:8080/api/candidates/cv/info \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## 🗑️ Delete CV

**DELETE** `/`

Delete the current user's CV.

### Request
- No body required

### Response (Success - 200 OK)
```json
{
  "success": true,
  "message": "CV deleted successfully"
}
```

### Response (No CV - 200 OK)
```json
{
  "success": false,
  "message": "No CV found to delete"
}
```

### Example (cURL)
```bash
curl -X DELETE http://localhost:8080/api/candidates/cv \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## 🚫 Error Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 400 | Bad Request (invalid file, validation error) |
| 401 | Unauthorized (missing/invalid JWT token) |
| 403 | Forbidden (not CANDIDATE role) |
| 500 | Internal Server Error |

---

## ✅ Validation Rules

### File Type
- **Allowed**: PDF, DOCX
- **MIME Types**: 
  - `application/pdf`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### File Size
- **Maximum**: 5 MB (5,242,880 bytes)

### File Name
- **Restrictions**: No path traversal (`..` not allowed)
- **Storage Format**: `cv_YYYYMMDD_HHMMSS.{ext}`

---

## 📁 File Storage Structure

```
~/devinsight/cvs/
  ├── {userId}/
  │   └── cv_20260108_103045.pdf
  ├── {userId}/
  │   └── cv_20260108_104521.docx
```

---

## 🔐 Security Features

1. **Authentication Required**: All endpoints require valid JWT token
2. **Role-Based Access**: Only CANDIDATE role can access
3. **File Validation**: Type and size checked on server
4. **Filename Sanitization**: Prevents path traversal attacks
5. **One CV Per User**: Unique constraint on user_id
6. **Old CV Cleanup**: Previous CV automatically deleted on new upload

---

## 📊 Database Schema

```sql
CREATE TABLE candidate_cvs (
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
```

---

## 🧪 Postman Collection

Import this into Postman for easy testing:

```json
{
  "info": {
    "name": "CV Upload API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Upload CV",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          }
        ],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": []
            }
          ]
        },
        "url": {
          "raw": "http://localhost:8080/api/candidates/cv/upload",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "candidates", "cv", "upload"]
        }
      }
    },
    {
      "name": "Get CV Info",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          }
        ],
        "url": {
          "raw": "http://localhost:8080/api/candidates/cv/info",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "candidates", "cv", "info"]
        }
      }
    },
    {
      "name": "Delete CV",
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          }
        ],
        "url": {
          "raw": "http://localhost:8080/api/candidates/cv",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "candidates", "cv"]
        }
      }
    }
  ]
}
```
