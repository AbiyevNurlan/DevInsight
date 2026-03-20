package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranslationResponseDto {
    private String translatedText;
    private String sourceLanguage;
    private String targetLanguage;
    private Double confidenceScore;            // 0-100
    private String detectedSourceLanguage;     // if auto-detected

    // Quality metrics
    private TranslationQuality quality;

    // Alternative translations
    private List<AlternativeTranslation> alternatives;

    // Technical terms preserved
    private List<String> preservedTerms;
    private Map<String, String> glossaryApplied; // original -> kept as-is

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TranslationQuality {
        private Double fluencyScore;           // 0-100
        private Double accuracyScore;          // 0-100
        private Double technicalAccuracy;      // 0-100 (domain-specific)
        private String qualityLevel;           // EXCELLENT, GOOD, ACCEPTABLE, NEEDS_REVIEW
        private List<String> warnings;         // potential issues
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlternativeTranslation {
        private String text;
        private Double confidence;
        private String style;                  // FORMAL, INFORMAL, TECHNICAL
    }
}
