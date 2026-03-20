package az.edu.itbrains.devinsight2.interview.controller;

import az.edu.itbrains.devinsight2.interview.dto.VoiceEmotionRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.VoiceEmotionResponseDto;
import az.edu.itbrains.devinsight2.interview.service.VoiceEmotionAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/interview/voice-emotion")
@RequiredArgsConstructor
@Slf4j
public class VoiceEmotionController {

    private final VoiceEmotionAnalysisService voiceEmotionAnalysisService;

    @PostMapping("/analyze")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> analyzeVoiceEmotion(
            @RequestBody VoiceEmotionRequestDto request) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("🎙️ Voice emotion analysis requested for candidate {}", request.getCandidateId());
            VoiceEmotionResponseDto analysis = voiceEmotionAnalysisService.analyzeVoiceEmotion(request);
            response.put("success", true);
            response.put("message", "Voice emotion analysis completed");
            response.put("data", analysis);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to analyze voice emotion", e);
            response.put("success", false);
            response.put("message", "Failed to analyze voice emotion: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
