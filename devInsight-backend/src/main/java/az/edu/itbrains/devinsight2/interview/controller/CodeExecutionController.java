package az.edu.itbrains.devinsight2.interview.controller;

import az.edu.itbrains.devinsight2.interview.dto.CodeExecutionRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.CodeExecutionResponseDto;
import az.edu.itbrains.devinsight2.interview.service.CodeExecutionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/interview/code-execution")
@RequiredArgsConstructor
@Slf4j
public class CodeExecutionController {

    private final CodeExecutionService codeExecutionService;

    @PostMapping("/execute")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'CANDIDATE')")
    public ResponseEntity<Map<String, Object>> executeCode(@RequestBody CodeExecutionRequestDto request) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("⚡ Code execution requested - language: {}", request.getLanguage());
            CodeExecutionResponseDto result = codeExecutionService.executeCode(request);
            response.put("success", true);
            response.put("message", "Code executed successfully");
            response.put("data", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Code execution failed", e);
            response.put("success", false);
            response.put("message", "Code execution failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/test-cases")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> runTestCases(@RequestBody CodeExecutionRequestDto request) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("🧪 Test case execution requested - {} test cases", 
                    request.getTestCases() != null ? request.getTestCases().size() : 0);
            CodeExecutionResponseDto result = codeExecutionService.runTestCases(request);
            response.put("success", true);
            response.put("message", "Test cases executed");
            response.put("data", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Test case execution failed", e);
            response.put("success", false);
            response.put("message", "Test case execution failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/languages")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'CANDIDATE')")
    public ResponseEntity<Map<String, Object>> getSupportedLanguages() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Supported languages retrieved");
        response.put("data", List.of(
                "JAVA", "PYTHON", "JAVASCRIPT", "TYPESCRIPT", "CPP", "C",
                "CSHARP", "GO", "RUST", "KOTLIN", "SWIFT", "RUBY", "PHP", "SCALA"
        ));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/quality-analysis")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> analyzeCodeQuality(@RequestBody CodeExecutionRequestDto request) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("🔒 Code quality analysis requested");
            CodeExecutionResponseDto result = codeExecutionService.executeCode(request);
            response.put("success", true);
            response.put("message", "Code quality analysis completed");
            response.put("data", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Code quality analysis failed", e);
            response.put("success", false);
            response.put("message", "Code quality analysis failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
