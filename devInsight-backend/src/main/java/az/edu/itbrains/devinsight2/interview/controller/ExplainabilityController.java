package az.edu.itbrains.devinsight2.interview.controller;

import az.edu.itbrains.devinsight2.interview.dto.AuditTrailDto;
import az.edu.itbrains.devinsight2.interview.dto.ExplainabilityRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.ExplainabilityResponseDto;
import az.edu.itbrains.devinsight2.interview.service.AuditTrailService;
import az.edu.itbrains.devinsight2.interview.service.ExplainabilityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/interview/explainability")
@RequiredArgsConstructor
@Slf4j
public class ExplainabilityController {
    
    private final ExplainabilityService explainabilityService;
    private final AuditTrailService auditTrailService;
    
    /**
     * Get explainability report for an AI decision
     */
    @PostMapping("/explain")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> explainDecision(
            @RequestBody ExplainabilityRequestDto request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Generating explainability report for decision type: {}", 
                request.getDecisionType());
            
            ExplainabilityResponseDto explanation = 
                explainabilityService.explainDecision(request);
            
            response.put("success", true);
            response.put("message", "Explainability report generated");
            response.put("explanation", explanation);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to generate explainability report", e);
            response.put("success", false);
            response.put("message", "Failed to explain decision: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Get audit trail for specific candidate
     */
    @GetMapping("/audit-trail/candidate/{candidateId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getCandidateAuditTrail(
            @PathVariable Long candidateId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Fetching audit trail for candidate: {}", candidateId);
            
            List<AuditTrailDto> auditTrail = 
                auditTrailService.getCandidateAuditTrail(candidateId);
            
            response.put("success", true);
            response.put("message", "Audit trail retrieved");
            response.put("auditTrail", auditTrail);
            response.put("count", auditTrail.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to fetch audit trail", e);
            response.put("success", false);
            response.put("message", "Failed to fetch audit trail: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Get audit trail by event type
     */
    @GetMapping("/audit-trail/event/{eventType}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAuditTrailByEventType(
            @PathVariable String eventType) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Fetching audit trail for event type: {}", eventType);
            
            List<AuditTrailDto> auditTrail = 
                auditTrailService.getAuditTrailByEventType(eventType);
            
            response.put("success", true);
            response.put("message", "Audit trail retrieved");
            response.put("auditTrail", auditTrail);
            response.put("count", auditTrail.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to fetch audit trail", e);
            response.put("success", false);
            response.put("message", "Failed to fetch audit trail: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Get audit trail within time range
     */
    @GetMapping("/audit-trail/time-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAuditTrailByTimeRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Fetching audit trail from {} to {}", start, end);
            
            List<AuditTrailDto> auditTrail = 
                auditTrailService.getAuditTrailByTimeRange(start, end);
            
            response.put("success", true);
            response.put("message", "Audit trail retrieved");
            response.put("auditTrail", auditTrail);
            response.put("count", auditTrail.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to fetch audit trail", e);
            response.put("success", false);
            response.put("message", "Failed to fetch audit trail: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
