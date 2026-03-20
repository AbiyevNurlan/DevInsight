package az.edu.itbrains.devinsight2.interview.controller;

import az.edu.itbrains.devinsight2.interview.dto.CodeOriginalityRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.CodeOriginalityResponseDto;
import az.edu.itbrains.devinsight2.interview.service.CodeOriginalityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/interview/code-originality")
@RequiredArgsConstructor
@Slf4j
public class CodeOriginalityController {

    private final CodeOriginalityService codeOriginalityService;

    @PostMapping("/analyze")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> analyzeOriginality(
            @RequestBody CodeOriginalityRequestDto request) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("🔎 Code originality analysis requested for candidate {}", request.getCandidateId());
            CodeOriginalityResponseDto analysis = codeOriginalityService.analyzeOriginality(request);
            response.put("success", true);
            response.put("message", "Code originality analysis completed");
            response.put("data", analysis);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to analyze code originality", e);
            response.put("success", false);
            response.put("message", "Failed to analyze originality: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
