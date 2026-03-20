package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranslationRequestDto {
    @NotBlank
    private String text;

    @NotBlank
    private String sourceLanguage;             // ISO 639-1: "en", "az", "tr", "ru", "de", "fr", "zh", "ja", "ko", "ar", "hi", "es", "pt"

    @NotBlank
    private String targetLanguage;

    private String context;                    // "interview_question", "candidate_answer", "feedback", "general"
    private String domain;                     // "technical", "behavioral", "system_design" — for domain-specific accuracy
    private Boolean preserveCodeBlocks;        // don't translate code blocks
    private Boolean preserveTechnicalTerms;    // keep technical terms in English
    private List<String> glossaryTerms;        // custom terms to keep untranslated
}
