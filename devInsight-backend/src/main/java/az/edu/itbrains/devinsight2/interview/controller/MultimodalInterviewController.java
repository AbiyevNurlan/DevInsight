package az.edu.itbrains.devinsight2.interview.controller;

import az.edu.itbrains.devinsight2.interview.dto.*;
import az.edu.itbrains.devinsight2.interview.service.MultimodalAnalysisService;
import az.edu.itbrains.devinsight2.interview.service.TranscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/interview/multimodal")
@RequiredArgsConstructor
@Slf4j
public class MultimodalInterviewController {
    
    private final TranscriptionService transcriptionService;
    private final MultimodalAnalysisService multimodalAnalysisService;
    
    /**
     * Transcribe audio/video to text
     */
    @PostMapping("/transcribe")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'CANDIDATE')")
    public ResponseEntity<Map<String, Object>> transcribe(
            @RequestBody TranscriptionRequestDto request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Transcription requested");
            
            TranscriptionResponseDto transcription = 
                transcriptionService.transcribe(request);
            
            response.put("success", true);
            response.put("message", "Transcription completed");
            response.put("transcription", transcription);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to transcribe", e);
            response.put("success", false);
            response.put("message", "Transcription failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Analyze audio metrics
     */
    @PostMapping("/analyze-audio")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> analyzeAudio(
            @RequestParam String audioUrl,
            @RequestParam String transcript) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Analyzing audio metrics");
            
            Map<String, Object> metrics = 
                transcriptionService.analyzeAudioMetrics(audioUrl, transcript);
            
            response.put("success", true);
            response.put("message", "Audio analysis completed");
            response.put("metrics", metrics);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to analyze audio", e);
            response.put("success", false);
            response.put("message", "Audio analysis failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Analyze video metrics
     */
    @PostMapping("/analyze-video")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> analyzeVideo(
            @RequestParam String videoUrl,
            @RequestParam String transcript) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Analyzing video metrics");
            
            Map<String, Object> metrics = 
                transcriptionService.analyzeVideoMetrics(videoUrl, transcript);
            
            response.put("success", true);
            response.put("message", "Video analysis completed");
            response.put("metrics", metrics);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to analyze video", e);
            response.put("success", false);
            response.put("message", "Video analysis failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Analyze multimodal answer (text + voice + video)
     */
    @PostMapping("/analyze-multimodal")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> analyzeMultimodal(
            @RequestBody MultimodalAnswerDto answer) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Analyzing multimodal answer");
            
            MultimodalAnalysisDto analysis = 
                multimodalAnalysisService.analyzeMultimodal(answer);
            
            response.put("success", true);
            response.put("message", "Multimodal analysis completed");
            response.put("analysis", analysis);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to analyze multimodal answer", e);
            response.put("success", false);
            response.put("message", "Multimodal analysis failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
