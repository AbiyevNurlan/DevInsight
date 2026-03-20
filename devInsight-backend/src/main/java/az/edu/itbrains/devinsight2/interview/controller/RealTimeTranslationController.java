package az.edu.itbrains.devinsight2.interview.controller;

import az.edu.itbrains.devinsight2.interview.dto.TranslationRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.TranslationResponseDto;
import az.edu.itbrains.devinsight2.interview.service.RealTimeTranslationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/interview/translation")
@RequiredArgsConstructor
@Slf4j
public class RealTimeTranslationController {

    private final RealTimeTranslationService realTimeTranslationService;

    @PostMapping("/translate")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'CANDIDATE')")
    public ResponseEntity<Map<String, Object>> translate(@RequestBody TranslationRequestDto request) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("🌐 Translation requested: {} → {}", request.getSourceLanguage(), request.getTargetLanguage());
            TranslationResponseDto result = realTimeTranslationService.translate(request);
            response.put("success", true);
            response.put("message", "Translation completed");
            response.put("data", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Translation failed", e);
            response.put("success", false);
            response.put("message", "Translation failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/batch")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> translateBatch(@RequestBody List<TranslationRequestDto> requests) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("📑 Batch translation requested - {} items", requests.size());
            TranslationResponseDto result = realTimeTranslationService.translateBatch(requests);
            response.put("success", true);
            response.put("message", "Batch translation completed");
            response.put("data", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Batch translation failed", e);
            response.put("success", false);
            response.put("message", "Batch translation failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/detect")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'CANDIDATE')")
    public ResponseEntity<Map<String, Object>> detectLanguage(@RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            String text = body.get("text");
            log.info("🔍 Language detection requested");
            String detected = realTimeTranslationService.detectLanguage(text);
            response.put("success", true);
            response.put("message", "Language detected");
            response.put("data", Map.of("detectedLanguage", detected, "languageName", getLanguageName(detected)));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Language detection failed", e);
            response.put("success", false);
            response.put("message", "Language detection failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/languages")
    public ResponseEntity<Map<String, Object>> getSupportedLanguages() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Supported languages retrieved");
        response.put("data", Map.of(
                "total", 50,
                "languages", List.of(
                        Map.of("code", "en", "name", "English"),
                        Map.of("code", "az", "name", "Azerbaijani"),
                        Map.of("code", "tr", "name", "Turkish"),
                        Map.of("code", "ru", "name", "Russian"),
                        Map.of("code", "de", "name", "German"),
                        Map.of("code", "fr", "name", "French"),
                        Map.of("code", "es", "name", "Spanish"),
                        Map.of("code", "ja", "name", "Japanese"),
                        Map.of("code", "ko", "name", "Korean"),
                        Map.of("code", "zh", "name", "Chinese"),
                        Map.of("code", "ar", "name", "Arabic"),
                        Map.of("code", "hi", "name", "Hindi"),
                        Map.of("code", "pt", "name", "Portuguese"),
                        Map.of("code", "it", "name", "Italian"),
                        Map.of("code", "nl", "name", "Dutch"),
                        Map.of("code", "pl", "name", "Polish"),
                        Map.of("code", "sv", "name", "Swedish"),
                        Map.of("code", "uk", "name", "Ukrainian"),
                        Map.of("code", "ka", "name", "Georgian"),
                        Map.of("code", "fa", "name", "Persian")
                )
        ));
        return ResponseEntity.ok(response);
    }

    private String getLanguageName(String code) {
        return switch (code) {
            case "en" -> "English"; case "az" -> "Azerbaijani"; case "tr" -> "Turkish";
            case "ru" -> "Russian"; case "de" -> "German"; case "fr" -> "French";
            case "es" -> "Spanish"; case "ja" -> "Japanese"; case "ko" -> "Korean";
            case "zh" -> "Chinese"; case "ar" -> "Arabic"; case "hi" -> "Hindi";
            default -> code.toUpperCase();
        };
    }
}
