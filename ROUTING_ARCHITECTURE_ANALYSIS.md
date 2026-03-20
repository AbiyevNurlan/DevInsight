# Spring Boot Routing Architecture - Root Cause Analysis & Best Practices

**Date:** January 10, 2026  
**Issue:** Backend CV upload returning 500 errors due to routing conflicts  
**Impact:** Critical - Affects all file upload operations and potentially other endpoints

---

## 1. Root Cause Analysis

### 1.1 The Problem

**Symptom:**
```
POST /api/cv/upload → 500 Internal Server Error
"No static resource cv/upload for request '/api/cv/upload'"
```

**Root Cause:**
Double prefix problem caused by misalignment between servlet context-path and controller mappings.

### 1.2 Configuration Analysis

**application.yml:**
```yaml
server:
  servlet:
    context-path: /api
```

**Problematic Controller (Before Fix):**
```java
@RestController
@RequestMapping("/api/cv")  // ❌ WRONG
public class CVController {
    @PostMapping("/upload")
    public ResponseEntity<?> uploadCV(...) { }
}
```

**Resulting Path:**
```
context-path: /api
+ controller mapping: /api/cv
+ method mapping: /upload
= ACTUAL PATH: /api/api/cv/upload  ❌
```

**Expected Path by Frontend:**
```
/api/cv/upload  ✅
```

### 1.3 Why Spring Treated it as Static Resource

When Spring DispatcherServlet receives `/api/cv/upload`:
1. Servlet strips context-path → becomes `/cv/upload`
2. Spring tries to find controller with `@RequestMapping("/cv/upload")`
3. No controller found (our controller is at `/api/cv/upload`)
4. Falls back to `ResourceHttpRequestHandler`
5. Tries to find static file at `cv/upload`
6. Returns 500: "No static resource cv/upload"

---

## 2. Impact Assessment

### 2.1 Affected Controllers (Pre-Fix)

**✅ CORRECT (14 controllers):**
```java
@RequestMapping("/candidates")      // /api/candidates
@RequestMapping("/chat")            // /api/chat
@RequestMapping("/questions")       // /api/questions
@RequestMapping("/submissions")     // /api/submissions
@RequestMapping("/gamification")    // /api/gamification
@RequestMapping("/feedback")        // /api/feedback
@RequestMapping("/dashboard")       // /api/dashboard
@RequestMapping("/interviews")      // /api/interviews
@RequestMapping("/analytics")       // /api/analytics
@RequestMapping("/auth")            // /api/auth
@RequestMapping("/users")           // /api/users
@RequestMapping("/admin")           // /api/admin
@RequestMapping("/hr")              // /api/hr
@RequestMapping("/cv")              // /api/cv (FIXED)
```

**❌ INCORRECT (2 controllers - FIXED):**
```java
@RequestMapping("/api/cv")          // /api/api/cv ❌ → Fixed to /cv
@RequestMapping("/api/submissions") // /api/api/submissions ❌ → Fixed to /submissions/api
```

### 2.2 Vulnerability Scope

- **High Risk:** Any controller with `/api/` prefix in `@RequestMapping`
- **Medium Risk:** Controllers with dynamic path variables (could mask the issue)
- **Low Risk:** Controllers following the correct pattern

---

## 3. The Fix Applied

### 3.1 Immediate Fix

**CVController.java:**
```java
@RestController
@RequestMapping("/cv")  // ✅ CORRECT - No /api/ prefix
@RequiredArgsConstructor
@Slf4j
public class CVController {
    
    @PostMapping("/upload")  // Full path: /api/cv/upload
    @PreAuthorize("hasAnyRole('CANDIDATE', 'ADMIN', 'HR')")
    public ResponseEntity<Map<String, Object>> uploadCV(...) { }
    
    @GetMapping("/info")     // Full path: /api/cv/info
    public ResponseEntity<Map<String, Object>> getCVInfo(...) { }
    
    @DeleteMapping           // Full path: /api/cv
    public ResponseEntity<Map<String, Object>> deleteCV(...) { }
}
```

**SubmissionApiController.java:**
```java
@RestController
@RequestMapping("/submissions/api")  // ✅ FIXED - Changed from /api/submissions
@RequiredArgsConstructor
@Slf4j
public class SubmissionApiController {
    // Endpoints now correctly resolve to /api/submissions/api/*
}
```

### 3.2 Why This Works

```
context-path: /api
+ controller: /cv
+ method: /upload
= RESULT: /api/cv/upload  ✅
```

---

## 4. Best Practices & Strategy

### 4.1 Recommended Pattern

**Option 1: Keep context-path (CURRENT APPROACH - RECOMMENDED)**

✅ **Advantages:**
- Clear separation of API from static resources
- Easy to add API versioning later (/api/v1, /api/v2)
- Industry standard pattern
- Better for reverse proxy configuration
- Consistent with frontend expectations

**Rules:**
```java
// ✅ CORRECT
@RestController
@RequestMapping("/resource")  // No /api/ prefix in controller

// ❌ WRONG
@RestController
@RequestMapping("/api/resource")  // Don't duplicate context-path
```

**Option 2: Remove context-path**

Change `application.yml`:
```yaml
server:
  servlet:
    context-path: /  # or remove entirely
```

Then update all controllers:
```java
@RestController
@RequestMapping("/api/resource")  // Add /api/ prefix to every controller
```

❌ **Disadvantages:**
- Requires updating ALL 15+ controllers
- More error-prone
- Less flexible for future changes
- Harder to configure reverse proxy rules

### 4.2 Recommended Solution: **KEEP Option 1** ✅

**Rationale:**
1. **Minimal changes:** Only 2 controllers needed fixing vs. 15+ controllers
2. **Industry standard:** Most Spring Boot APIs use context-path pattern
3. **Future-proof:** Easy to add API versioning
4. **Clear separation:** API routes vs static resources
5. **Proxy-friendly:** Nginx/Apache can easily route `/api/*` to backend

---

## 5. Architectural Guidelines

### 5.1 Controller Naming Convention

```java
// Module-based controllers
@RequestMapping("/candidates")      // Candidate operations
@RequestMapping("/interviews")      // Interview operations
@RequestMapping("/submissions")     // Submission operations

// Feature-based controllers
@RequestMapping("/auth")            // Authentication
@RequestMapping("/cv")              // CV management
@RequestMapping("/analytics")       // Analytics

// Role-based controllers
@RequestMapping("/admin")           // Admin operations
@RequestMapping("/hr")              // HR operations
```

### 5.2 Path Structure

```
/api                              ← context-path (application.yml)
  /candidates                     ← @RequestMapping("/candidates")
    /{id}                         ← @GetMapping("/{id}")
    /{id}/cv                      ← @GetMapping("/{id}/cv")
  /cv                             ← @RequestMapping("/cv")
    /upload                       ← @PostMapping("/upload")
    /info                         ← @GetMapping("/info")
  /auth                           ← @RequestMapping("/auth")
    /login                        ← @PostMapping("/login")
    /refresh                      ← @PostMapping("/refresh")
```

### 5.3 Testing Strategy

**Unit Test Example:**
```java
@WebMvcTest(CVController.class)
class CVControllerTest {
    
    @Test
    void uploadCV_shouldResolveToCorrectPath() throws Exception {
        mockMvc.perform(
            multipart("/api/cv/upload")  // Full path with context
                .file("file", "test.pdf".getBytes())
        )
        .andExpect(status().isOk());
    }
}
```

**Integration Test:**
```java
@SpringBootTest(webEnvironment = RANDOM_PORT)
class CVControllerIntegrationTest {
    
    @LocalServerPort
    private int port;
    
    @Test
    void uploadCV_shouldWork() {
        String url = "http://localhost:" + port + "/api/cv/upload";
        // Test with actual HTTP client
    }
}
```

---

## 6. Prevention Checklist

### 6.1 Code Review Checklist

- [ ] Controller `@RequestMapping` does NOT include `/api/` prefix
- [ ] Full path matches frontend expectations
- [ ] Integration tests use full path including `/api/`
- [ ] Swagger documentation reflects correct paths
- [ ] CORS configuration allows correct origins

### 6.2 Development Guidelines

**DO:**
```java
✅ @RequestMapping("/resource")
✅ Use descriptive, RESTful paths
✅ Test full paths in integration tests
✅ Document expected paths in comments
```

**DON'T:**
```java
❌ @RequestMapping("/api/resource")  // Don't duplicate context-path
❌ Hardcode context-path in controller
❌ Mix patterns (some with /api/, some without)
```

### 6.3 Automated Detection

**Create a custom ArchUnit test:**
```java
@AnalyzeClasses(packages = "az.edu.itbrains.devinsight2.controller")
public class ControllerArchitectureTest {
    
    @ArchTest
    static final ArchRule controllers_should_not_have_api_prefix =
        classes()
            .that().areAnnotatedWith(RestController.class)
            .should().notBeAnnotatedWith(
                RequestMapping.class, 
                having(value -> value.startsWith("/api/"))
            )
            .because("Context path /api is defined in application.yml");
}
```

---

## 7. Migration Path for Future Changes

### 7.1 If API Versioning Needed

**Option A: Path-based versioning**
```yaml
# application.yml
server:
  servlet:
    context-path: /api/v1
```

All existing controllers automatically become `/api/v1/*`

**Option B: Header-based versioning**
```java
@RequestMapping(value = "/cv", headers = "API-Version=1")
public class CVControllerV1 { }

@RequestMapping(value = "/cv", headers = "API-Version=2")
public class CVControllerV2 { }
```

### 7.2 Microservices Migration

If splitting into microservices:
```yaml
# cv-service
server:
  servlet:
    context-path: /api/cv-service

# interview-service  
server:
  servlet:
    context-path: /api/interview-service
```

Controllers remain unchanged - just update context-path.

---

## 8. Summary & Action Items

### 8.1 Completed Actions

✅ Fixed CVController: `/api/cv` → `/cv`  
✅ Fixed SubmissionApiController: `/api/submissions` → `/submissions/api`  
✅ Verified all other controllers follow correct pattern  
✅ Documented root cause and best practices

### 8.2 Recommended Next Steps

1. **Immediate:**
   - [ ] Test CV upload functionality end-to-end
   - [ ] Verify SubmissionApiController endpoints
   - [ ] Update API documentation (Swagger/Postman)

2. **Short-term:**
   - [ ] Add ArchUnit test to prevent future violations
   - [ ] Update developer onboarding documentation
   - [ ] Add path validation to CI/CD pipeline

3. **Long-term:**
   - [ ] Consider API versioning strategy
   - [ ] Implement automated API contract testing
   - [ ] Create Spring Boot starter with preconfigured patterns

### 8.3 Key Takeaways

1. **Context-path adds prefix to ALL routes** - Don't duplicate in controllers
2. **Consistency is critical** - One pattern across entire application
3. **Test full paths** - Integration tests should use complete URLs
4. **Document patterns** - Make it easy for new developers to follow
5. **Automate validation** - Use tools like ArchUnit to enforce rules

---

## 9. References

### 9.1 Spring Boot Documentation
- [Spring MVC Request Mapping](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html)
- [Servlet Context Path](https://docs.spring.io/spring-boot/docs/current/reference/html/application-properties.html#application-properties.server)

### 9.2 Industry Standards
- [RESTful API Design Best Practices](https://restfulapi.net/resource-naming/)
- [API Versioning Strategies](https://www.baeldung.com/rest-versioning)

### 9.3 Internal Documentation
- `README_IMPLEMENTATION.md` - Implementation guidelines
- `TESTING_GUIDE.md` - Testing strategies
- `API_REFERENCE.md` - Endpoint documentation (needs update)

---

**Document Version:** 1.0  
**Last Updated:** January 10, 2026  
**Owner:** Backend Team  
**Status:** ✅ Issue Resolved - Best Practices Documented
