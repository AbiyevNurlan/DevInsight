# CANDIDATES SƏHIFƏSI - PROBLEM VƏ HƏLL

## PROBLEM:
`/api/candidates` endpoint-i 500 error verir

## SƏBƏB TAPMAQ ÜÇÜN ADDIMLAR:

### 1. Backend log-lara baxın:
Backend terminalda error stack trace-i oxuyun

### 2. Database-də CANDIDATE var mı?
```sql
SELECT * FROM users WHERE role = 'CANDIDATE';
```

Əgər yoxdursa - test data yaradın:
```sql
INSERT INTO users (email, password, full_name, role, status, created_at) 
VALUES ('candidate@test.com', '$2a$10$...', 'Test Candidate', 'CANDIDATE', 'ACTIVE', NOW());
```

### 3. Sadə test:
Postman və ya browser-də:
```
GET http://localhost:8080/api/candidates?page=0&size=10
Headers: Authorization: Bearer YOUR_ADMIN_TOKEN
```

## MƏQSƏD:
- Admin/HR-in bütün namizədləri görməsi
- Namizəd statistikası (müsahibə sayı, bal)
- Filtrasiya və axtarış
- Müsahibə tarixçəsi

## HƏLL YOLLARI:

### Yol 1: Test data yarat
Database-ə CANDIDATE rolu olan istifadəçilər əlavə et

### Yol 2: Empty state göstər
Əgər namizəd yoxdursa, səhv əvəzinə "No candidates found" mesajı göstər

### Yol 3: Better error handling
Backend-də və frontend-də error handling-i yaxşılaşdır
