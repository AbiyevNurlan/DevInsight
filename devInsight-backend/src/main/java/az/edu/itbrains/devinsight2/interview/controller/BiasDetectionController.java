package az.edu.itbrains.devinsight2.interview.controller;

import az.edu.itbrains.devinsight2.interview.dto.BiasDetectionRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.BiasDetectionResponseDto;
import az.edu.itbrains.devinsight2.interview.service.BiasDetectionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/interview/bias-detection")
@RequiredArgsConstructor
@Slf4j
public class BiasDetectionController {

    private final BiasDetectionService biasDetectionService;

    @PostMapping("/analyze")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> detectBias(
            @RequestBody BiasDetectionRequestDto request) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("🔍 Bias detection analysis requested for interview {}", request.getInterviewId());
            BiasDetectionResponseDto analysis = biasDetectionService.detectBias(request);
            response.put("success", true);
            response.put("message", "Bias detection analysis completed");
            response.put("data", analysis);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to detect bias", e);
            response.put("success", false);
            response.put("message", "Failed to analyze bias: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
