package az.edu.itbrains.devinsight2.interview.controller;

import az.edu.itbrains.devinsight2.interview.dto.SmartSchedulerRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.SmartSchedulerResponseDto;
import az.edu.itbrains.devinsight2.interview.service.SmartSchedulerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/interview/smart-scheduler")
@RequiredArgsConstructor
@Slf4j
public class SmartSchedulerController {

    private final SmartSchedulerService smartSchedulerService;

    @PostMapping("/find-slots")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> findOptimalSlots(@RequestBody SmartSchedulerRequestDto request) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("📅 Finding optimal interview slots - duration: {} min, timezone: {}", 
                    request.getDurationMinutes(), request.getCandidateTimezone());
            SmartSchedulerResponseDto result = smartSchedulerService.findOptimalSlots(request);
            response.put("success", true);
            response.put("message", "Optimal slots found");
            response.put("data", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Smart scheduling failed", e);
            response.put("success", false);
            response.put("message", "Failed to find optimal slots: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/reschedule")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> reschedule(
            @RequestParam Long interviewId,
            @RequestParam String newDateTime) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("🔄 Rescheduling interview {}", interviewId);
            SmartSchedulerResponseDto result = smartSchedulerService.reschedule(interviewId, LocalDateTime.parse(newDateTime));
            response.put("success", true);
            response.put("message", "Interview rescheduled");
            response.put("data", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Rescheduling failed for {}", interviewId, e);
            response.put("success", false);
            response.put("message", "Failed to reschedule: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/workload/{interviewerId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getInterviewerWorkload(@PathVariable Long interviewerId) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("📊 Getting workload for interviewer {}", interviewerId);
            var workload = smartSchedulerService.getInterviewerWorkload(interviewerId, LocalDate.now());
            response.put("success", true);
            response.put("message", "Interviewer workload retrieved");
            response.put("data", workload);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Workload retrieval failed for interviewer {}", interviewerId, e);
            response.put("success", false);
            response.put("message", "Failed to get workload: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
