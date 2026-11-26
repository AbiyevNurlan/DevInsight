# Controller Mapping Quick Reference

## ⚡ TL;DR

```yaml
# application.yml
server:
  servlet:
    context-path: /api
```

```java
// ✅ CORRECT
@RestController
@RequestMapping("/resource")  // NO /api/ prefix!
public class ResourceController { }
// Result: /api/resource

// ❌ WRONG  
@RestController
@RequestMapping("/api/resource")  // Don't duplicate!
public class ResourceController { }
// Result: /api/api/resource (BROKEN!)
```

---

## 📋 Current Controller Mappings

| Controller | Mapping | Full Path | Status |
|------------|---------|-----------|--------|
| AdminController | `/admin` | `/api/admin` | ✅ |
| AnalyticsController | `/analytics` | `/api/analytics` | ✅ |
| AuthController | `/auth` | `/api/auth` | ✅ |
| CandidateController | `/candidates` | `/api/candidates` | ✅ |
| ChatController | `/chat` | `/api/chat` | ✅ |
| **CVController** | `/cv` | `/api/cv` | ✅ **FIXED** |
| DashboardController | `/dashboard` | `/api/dashboard` | ✅ |
| FeedbackController | `/feedback` | `/api/feedback` | ✅ |
| GamificationController | `/gamification` | `/api/gamification` | ✅ |
| HRController | `/hr` | `/api/hr` | ✅ |
| InterviewController | `/interviews` | `/api/interviews` | ✅ |
| InterviewSessionController | `/interviews/{id}/sessions` | `/api/interviews/{id}/sessions` | ✅ |
| QuestionController | `/questions` | `/api/questions` | ✅ |
| SubmissionController | `/submissions` | `/api/submissions` | ✅ |
| **SubmissionApiController** | `/submissions/api` | `/api/submissions/api` | ✅ **FIXED** |
| UserController | `/users` | `/api/users` | ✅ |

---

## 🎯 New Controller Template

```java
package az.edu.itbrains.devinsight2.controller.yourmodule;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/your-resource")  // ← NO /api/ prefix!
@RequiredArgsConstructor
@Slf4j
public class YourController {
    
    private final YourService yourService;
    
    // GET /api/your-resource
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<?> getAll() {
        log.info("GET /api/your-resource");
        return ResponseEntity.ok(yourService.findAll());
    }
    
    // POST /api/your-resource
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@RequestBody YourDto dto) {
        log.info("POST /api/your-resource");
        return ResponseEntity.ok(yourService.create(dto));
    }
    
    // GET /api/your-resource/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        log.info("GET /api/your-resource/{}", id);
        return ResponseEntity.ok(yourService.findById(id));
    }
}
```

---

## 🧪 Testing Template

```java
@WebMvcTest(YourController.class)
class YourControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private YourService yourService;
    
    @Test
    void getAll_shouldReturnList() throws Exception {
        mockMvc.perform(get("/api/your-resource"))  // ← Include /api/ in test
               .andExpect(status().isOk());
    }
}
```

---

## ⚠️ Common Mistakes

### Mistake 1: Duplicating /api/
```java
❌ @RequestMapping("/api/cv")  // Creates /api/api/cv
✅ @RequestMapping("/cv")      // Creates /api/cv
```

### Mistake 2: Forgetting context-path in tests
```java
❌ mockMvc.perform(get("/cv/upload"))      // Will fail
✅ mockMvc.perform(get("/api/cv/upload"))  // Correct
```

### Mistake 3: Hardcoding full path
```java
❌ @RequestMapping("http://localhost:8080/api/cv")  // Never do this
✅ @RequestMapping("/cv")                            // Let Spring handle it
```

---

## 🔍 Troubleshooting

### Error: "No static resource X for request '/api/X'"

**Cause:** Controller mapping includes `/api/` prefix  
**Fix:** Remove `/api/` from `@RequestMapping`

```java
// Before
@RequestMapping("/api/cv")  ❌

// After  
@RequestMapping("/cv")      ✅
```

### Error: 404 Not Found

**Check:**
1. Controller mapping doesn't have `/api/` prefix
2. Test/frontend is using full path `/api/resource`
3. Security permits the endpoint
4. Spring Boot is scanning the controller package

---

## 📚 Related Files

- [ROUTING_ARCHITECTURE_ANALYSIS.md](ROUTING_ARCHITECTURE_ANALYSIS.md) - Full analysis
- [application.yml](devInsight-backend/src/main/resources/application.yml) - Context path config
- [SecurityConfig.java](devInsight-backend/src/main/java/az/edu/itbrains/devinsight2/config/SecurityConfig.java) - Endpoint security

---

**Last Updated:** January 10, 2026  
**Quick Link:** https://docs.spring.io/spring-boot/docs/current/reference/html/application-properties.html#application-properties.server.servlet.context-path
