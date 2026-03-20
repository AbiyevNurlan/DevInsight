package az.edu.itbrains.devinsight2.interview.controller;

import az.edu.itbrains.devinsight2.interview.dto.MockInterviewRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.MockInterviewResponseDto;
import az.edu.itbrains.devinsight2.interview.service.MockInterviewCoachService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/interview/mock-interview")
@RequiredArgsConstructor
@Slf4j
public class MockInterviewController {

    private final MockInterviewCoachService mockInterviewCoachService;

    @PostMapping("/start")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'CANDIDATE')")
    public ResponseEntity<Map<String, Object>> startMockInterview(@RequestBody MockInterviewRequestDto request) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("🎯 Starting mock interview for candidate {} - {}", request.getCandidateId(), request.getJobTitle());
            MockInterviewResponseDto session = mockInterviewCoachService.startMockInterview(request);
            response.put("success", true);
            response.put("message", "Mock interview session started");
            response.put("data", session);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to start mock interview", e);
            response.put("success", false);
            response.put("message", "Failed to start mock interview: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/{sessionId}/answer")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'CANDIDATE')")
    public ResponseEntity<Map<String, Object>> submitAnswer(
            @PathVariable String sessionId,
            @RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            String answer = body.get("answer");
            log.info("📝 Answer submitted for session {}", sessionId);
            MockInterviewResponseDto result = mockInterviewCoachService.submitAnswer(sessionId, answer);
            response.put("success", true);
            response.put("message", "Answer submitted and evaluated");
            response.put("data", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to submit answer for session {}", sessionId, e);
            response.put("success", false);
            response.put("message", "Failed to submit answer: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/{sessionId}/next")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'CANDIDATE')")
    public ResponseEntity<Map<String, Object>> getNextQuestion(@PathVariable String sessionId) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("➡️ Getting next question for session {}", sessionId);
            MockInterviewResponseDto result = mockInterviewCoachService.getNextQuestion(sessionId);
            response.put("success", true);
            response.put("message", "Next question retrieved");
            response.put("data", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get next question for session {}", sessionId, e);
            response.put("success", false);
            response.put("message", "Failed to get next question: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/{sessionId}/report")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'CANDIDATE')")
    public ResponseEntity<Map<String, Object>> getSessionReport(@PathVariable String sessionId) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("📊 Getting report for session {}", sessionId);
            MockInterviewResponseDto result = mockInterviewCoachService.getSessionReport(sessionId);
            response.put("success", true);
            response.put("message", "Session report generated");
            response.put("data", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get session report for {}", sessionId, e);
            response.put("success", false);
            response.put("message", "Failed to get session report: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @DeleteMapping("/{sessionId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'CANDIDATE')")
    public ResponseEntity<Map<String, Object>> endSession(@PathVariable String sessionId) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("🏁 Ending mock interview session {}", sessionId);
            mockInterviewCoachService.endSession(sessionId);
            response.put("success", true);
            response.put("message", "Mock interview session ended");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to end session {}", sessionId, e);
            response.put("success", false);
            response.put("message", "Failed to end session: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
