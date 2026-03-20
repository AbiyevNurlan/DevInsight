package az.edu.itbrains.devinsight2.interview.controller;

import az.edu.itbrains.devinsight2.interview.dto.CandidatePotentialRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.CandidatePotentialResponseDto;
import az.edu.itbrains.devinsight2.interview.service.CandidatePotentialService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/interview/candidate-potential")
@RequiredArgsConstructor
@Slf4j
public class CandidatePotentialController {

    private final CandidatePotentialService candidatePotentialService;

    @PostMapping("/analyze")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> analyzePotential(
            @RequestBody CandidatePotentialRequestDto request) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("🚀 Candidate potential analysis requested for candidate {}", request.getCandidateId());
            CandidatePotentialResponseDto analysis = candidatePotentialService.analyzePotential(request);
            response.put("success", true);
            response.put("message", "Candidate potential analysis completed");
            response.put("data", analysis);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to analyze candidate potential", e);
            response.put("success", false);
            response.put("message", "Failed to analyze potential: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
