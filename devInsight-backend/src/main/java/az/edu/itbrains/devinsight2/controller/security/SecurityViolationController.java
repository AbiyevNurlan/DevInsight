package az.edu.itbrains.devinsight2.controller.security;

import az.edu.itbrains.devinsight2.dto.common.ApiResponse;
import az.edu.itbrains.devinsight2.dto.security.ViolationDto;
import az.edu.itbrains.devinsight2.dto.security.ViolationReportDto;
import az.edu.itbrains.devinsight2.service.security.SecurityViolationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/security")
@RequiredArgsConstructor
@Slf4j
public class SecurityViolationController {

    private final SecurityViolationService violationService;

    /**
     * Report a security violation (called by frontend during interview)
     * POST /security/violations/report
     */
    @PostMapping("/violations/report")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'ADMIN')")
    public ResponseEntity<ApiResponse<ViolationDto>> reportViolation(
            @Valid @RequestBody ViolationReportDto dto
    ) {
        log.info("Security violation reported: {} for interview {}", dto.getType(), dto.getInterviewId());
        
        try {
            ViolationDto violation = violationService.reportViolation(dto);
            return ResponseEntity.ok(ApiResponse.success("Violation reported", violation));
        } catch (Exception e) {
            log.error("Error reporting violation: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to report violation: " + e.getMessage()));
        }
    }

    /**
     * Get all violations for an interview
     * GET /security/violations/interview/{interviewId}
     */
    @GetMapping("/violations/interview/{interviewId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ViolationDto>>> getInterviewViolations(
            @PathVariable Long interviewId
    ) {
        log.info("Fetching violations for interview: {}", interviewId);
        
        List<ViolationDto> violations = violationService.getInterviewViolations(interviewId);
        return ResponseEntity.ok(ApiResponse.success(violations));
    }

    /**
     * Get user violations for specific interview
     * GET /security/violations/user/{userId}/interview/{interviewId}
     */
    @GetMapping("/violations/user/{userId}/interview/{interviewId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ViolationDto>>> getUserInterviewViolations(
            @PathVariable Long userId,
            @PathVariable Long interviewId
    ) {
        log.info("Fetching violations for user {} in interview {}", userId, interviewId);
        
        List<ViolationDto> violations = violationService.getUserViolations(userId, interviewId);
        return ResponseEntity.ok(ApiResponse.success(violations));
    }

    /**
     * Get recent violations (last N hours)
     * GET /security/violations/recent?hours=24
     */
    @GetMapping("/violations/recent")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ViolationDto>>> getRecentViolations(
            @RequestParam(defaultValue = "24") int hours
    ) {
        log.info("Fetching violations from last {} hours", hours);
        
        List<ViolationDto> violations = violationService.getRecentViolations(hours);
        return ResponseEntity.ok(ApiResponse.success(violations));
    }

    /**
     * Get critical violations only
     * GET /security/violations/critical
     */
    @GetMapping("/violations/critical")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ViolationDto>>> getCriticalViolations() {
        log.info("Fetching critical violations");
        
        List<ViolationDto> violations = violationService.getCriticalViolations();
        return ResponseEntity.ok(ApiResponse.success(violations));
    }

    /**
     * Resolve a violation
     * PUT /security/violations/{id}/resolve
     */
    @PutMapping("/violations/{id}/resolve")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<ApiResponse<String>> resolveViolation(@PathVariable Long id) {
        log.info("Resolving violation: {}", id);
        
        try {
            violationService.resolveViolation(id);
            return ResponseEntity.ok(ApiResponse.success("Violation resolved", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to resolve violation: " + e.getMessage()));
        }
    }
}
