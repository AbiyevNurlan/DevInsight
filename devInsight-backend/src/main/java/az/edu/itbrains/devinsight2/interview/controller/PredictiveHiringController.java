package az.edu.itbrains.devinsight2.interview.controller;

import az.edu.itbrains.devinsight2.interview.dto.PredictiveHiringRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.PredictiveHiringResponseDto;
import az.edu.itbrains.devinsight2.interview.service.PredictiveHiringService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/interview/predictive-hiring")
@RequiredArgsConstructor
@Slf4j
public class PredictiveHiringController {

    private final PredictiveHiringService predictiveHiringService;

    @PostMapping("/predict")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> predictHiringOutcome(@RequestBody PredictiveHiringRequestDto request) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("📈 Predictive hiring analysis for candidate {} at company {}", 
                    request.getCandidateId(), request.getCompanyId());
            PredictiveHiringResponseDto prediction = predictiveHiringService.predict(request);
            response.put("success", true);
            response.put("message", "Hiring prediction completed");
            response.put("data", prediction);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Predictive hiring analysis failed", e);
            response.put("success", false);
            response.put("message", "Prediction failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/salary-benchmark")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getSalaryBenchmark(
            @RequestParam String role,
            @RequestParam(defaultValue = "MID") String level,
            @RequestParam(defaultValue = "Baku") String region) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("💰 Salary benchmark for {} ({}) in {}", role, level, region);
            var benchmark = predictiveHiringService.getSalaryBenchmark(role, level, region);
            response.put("success", true);
            response.put("message", "Salary benchmark retrieved");
            response.put("data", benchmark);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Salary benchmark retrieval failed", e);
            response.put("success", false);
            response.put("message", "Failed to get salary benchmark: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/funnel/{companyId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getHiringFunnel(@PathVariable Long companyId) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("📊 Hiring funnel analytics for company {}", companyId);
            var funnel = predictiveHiringService.getHiringFunnel(companyId);
            response.put("success", true);
            response.put("message", "Hiring funnel analytics retrieved");
            response.put("data", funnel);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Hiring funnel retrieval failed", e);
            response.put("success", false);
            response.put("message", "Failed to get hiring funnel: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
