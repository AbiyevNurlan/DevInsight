package az.edu.itbrains.devinsight2.interview.controller;

import az.edu.itbrains.devinsight2.interview.dto.InterviewReportRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.InterviewReportResponseDto;
import az.edu.itbrains.devinsight2.interview.service.InterviewReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/interview/reports")
@RequiredArgsConstructor
@Slf4j
public class InterviewReportController {

    private final InterviewReportService interviewReportService;

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> generateReport(@RequestBody InterviewReportRequestDto request) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("📄 Generating {} report for interview {} - candidate {}", 
                    request.getReportType(), request.getInterviewId(), request.getCandidateId());
            InterviewReportResponseDto report = interviewReportService.generateReport(request);
            response.put("success", true);
            response.put("message", "Interview report generated successfully");
            response.put("data", report);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Report generation failed", e);
            response.put("success", false);
            response.put("message", "Failed to generate report: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/executive-summary/{interviewId}/{candidateId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getExecutiveSummary(
            @PathVariable Long interviewId,
            @PathVariable Long candidateId) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("📋 Executive summary for interview {} - candidate {}", interviewId, candidateId);
            InterviewReportResponseDto report = interviewReportService.generateExecutiveSummary(interviewId, candidateId);
            response.put("success", true);
            response.put("message", "Executive summary generated");
            response.put("data", report);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Executive summary generation failed", e);
            response.put("success", false);
            response.put("message", "Failed to generate executive summary: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/compare")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> compareCandidates(
            @RequestParam Long interviewId,
            @RequestBody List<Long> candidateIds) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("🔄 Comparing {} candidates for interview {}", candidateIds.size(), interviewId);
            var comparison = interviewReportService.compareMultipleCandidates(interviewId, candidateIds);
            response.put("success", true);
            response.put("message", "Candidate comparison completed");
            response.put("data", comparison);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Candidate comparison failed", e);
            response.put("success", false);
            response.put("message", "Failed to compare candidates: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
