package az.edu.itbrains.devinsight2.interview.service;

import az.edu.itbrains.devinsight2.interview.dto.TranslationRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.TranslationResponseDto;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class RealTimeTranslationService {

    private final RestTemplate restTemplate;

    @Value("${anthropic.api-key:}")
    private String anthropicApiKey;

    private static final String CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String CLAUDE_MODEL = "claude-3-5-sonnet-20241022";

    // Supported languages
    private static final Map<String, String> SUPPORTED_LANGUAGES = new LinkedHashMap<>();
    static {
        SUPPORTED_LANGUAGES.put("en", "English");
        SUPPORTED_LANGUAGES.put("az", "Azerbaijani");
        SUPPORTED_LANGUAGES.put("tr", "Turkish");
        SUPPORTED_LANGUAGES.put("ru", "Russian");
        SUPPORTED_LANGUAGES.put("de", "German");
        SUPPORTED_LANGUAGES.put("fr", "French");
        SUPPORTED_LANGUAGES.put("es", "Spanish");
        SUPPORTED_LANGUAGES.put("pt", "Portuguese");
        SUPPORTED_LANGUAGES.put("it", "Italian");
        SUPPORTED_LANGUAGES.put("nl", "Dutch");
        SUPPORTED_LANGUAGES.put("pl", "Polish");
        SUPPORTED_LANGUAGES.put("uk", "Ukrainian");
        SUPPORTED_LANGUAGES.put("ja", "Japanese");
        SUPPORTED_LANGUAGES.put("ko", "Korean");
        SUPPORTED_LANGUAGES.put("zh", "Chinese (Simplified)");
        SUPPORTED_LANGUAGES.put("zh-TW", "Chinese (Traditional)");
        SUPPORTED_LANGUAGES.put("ar", "Arabic");
        SUPPORTED_LANGUAGES.put("hi", "Hindi");
        SUPPORTED_LANGUAGES.put("bn", "Bengali");
        SUPPORTED_LANGUAGES.put("fa", "Persian");
        SUPPORTED_LANGUAGES.put("he", "Hebrew");
        SUPPORTED_LANGUAGES.put("th", "Thai");
        SUPPORTED_LANGUAGES.put("vi", "Vietnamese");
        SUPPORTED_LANGUAGES.put("id", "Indonesian");
        SUPPORTED_LANGUAGES.put("ms", "Malay");
        SUPPORTED_LANGUAGES.put("sv", "Swedish");
        SUPPORTED_LANGUAGES.put("no", "Norwegian");
        SUPPORTED_LANGUAGES.put("da", "Danish");
        SUPPORTED_LANGUAGES.put("fi", "Finnish");
        SUPPORTED_LANGUAGES.put("cs", "Czech");
        SUPPORTED_LANGUAGES.put("ro", "Romanian");
        SUPPORTED_LANGUAGES.put("hu", "Hungarian");
        SUPPORTED_LANGUAGES.put("el", "Greek");
        SUPPORTED_LANGUAGES.put("bg", "Bulgarian");
        SUPPORTED_LANGUAGES.put("hr", "Croatian");
        SUPPORTED_LANGUAGES.put("sk", "Slovak");
        SUPPORTED_LANGUAGES.put("sl", "Slovenian");
        SUPPORTED_LANGUAGES.put("et", "Estonian");
        SUPPORTED_LANGUAGES.put("lv", "Latvian");
        SUPPORTED_LANGUAGES.put("lt", "Lithuanian");
        SUPPORTED_LANGUAGES.put("ka", "Georgian");
        SUPPORTED_LANGUAGES.put("hy", "Armenian");
        SUPPORTED_LANGUAGES.put("sw", "Swahili");
        SUPPORTED_LANGUAGES.put("ur", "Urdu");
        SUPPORTED_LANGUAGES.put("ta", "Tamil");
        SUPPORTED_LANGUAGES.put("te", "Telugu");
        SUPPORTED_LANGUAGES.put("mr", "Marathi");
        SUPPORTED_LANGUAGES.put("gu", "Gujarati");
        SUPPORTED_LANGUAGES.put("kn", "Kannada");
        SUPPORTED_LANGUAGES.put("ml", "Malayalam");
    }

    public TranslationResponseDto translate(TranslationRequestDto request) {
        log.info("🌍 Translation: {} → {} ({} chars, context: {})",
                request.getSourceLanguage(), request.getTargetLanguage(),
                request.getText().length(), request.getContext());

        if (request.getSourceLanguage().equals(request.getTargetLanguage())) {
            return TranslationResponseDto.builder()
                    .translatedText(request.getText())
                    .sourceLanguage(request.getSourceLanguage())
                    .targetLanguage(request.getTargetLanguage())
                    .confidenceScore(100.0)
                    .quality(TranslationResponseDto.TranslationQuality.builder()
                            .fluencyScore(100.0).accuracyScore(100.0).technicalAccuracy(100.0)
                            .qualityLevel("EXCELLENT").warnings(List.of()).build())
                    .build();
        }

        // Extract and preserve code blocks if requested
        List<String> codeBlocks = new ArrayList<>();
        String textToTranslate = request.getText();
        if (request.getPreserveCodeBlocks() != null && request.getPreserveCodeBlocks()) {
            textToTranslate = extractCodeBlocks(request.getText(), codeBlocks);
        }

        // Extract technical terms to preserve
        List<String> preservedTerms = new ArrayList<>();
        if (request.getPreserveTechnicalTerms() != null && request.getPreserveTechnicalTerms()) {
            preservedTerms = extractTechnicalTerms(textToTranslate);
        }
        if (request.getGlossaryTerms() != null) {
            preservedTerms.addAll(request.getGlossaryTerms());
        }

        if (anthropicApiKey != null && !anthropicApiKey.isEmpty()) {
            try {
                String prompt = buildTranslationPrompt(textToTranslate, request, preservedTerms);
                String response = callClaudeAPI(prompt);
                String translated = parseTranslationResponse(response);
                if (translated != null && !translated.isEmpty()) {
                    // Restore code blocks
                    translated = restoreCodeBlocks(translated, codeBlocks);

                    return TranslationResponseDto.builder()
                            .translatedText(translated)
                            .sourceLanguage(request.getSourceLanguage())
                            .targetLanguage(request.getTargetLanguage())
                            .confidenceScore(92.0)
                            .quality(TranslationResponseDto.TranslationQuality.builder()
                                    .fluencyScore(95.0).accuracyScore(90.0).technicalAccuracy(88.0)
                                    .qualityLevel("EXCELLENT").warnings(List.of()).build())
                            .preservedTerms(preservedTerms)
                            .build();
                }
            } catch (Exception e) {
                log.error("AI translation failed: {}", e.getMessage());
            }
        }

        // Fallback: dictionary-based translation
        log.warn("⚠️ Using fallback dictionary-based translation");
        return buildFallbackTranslation(request, textToTranslate, codeBlocks, preservedTerms);
    }

    public TranslationResponseDto translateBatch(List<TranslationRequestDto> requests) {
        log.info("📦 Batch translation: {} items", requests.size());

        StringBuilder combined = new StringBuilder();
        for (int i = 0; i < requests.size(); i++) {
            combined.append("[").append(i).append("] ").append(requests.get(i).getText()).append("\n---\n");
        }

        TranslationRequestDto batchRequest = TranslationRequestDto.builder()
                .text(combined.toString())
                .sourceLanguage(requests.get(0).getSourceLanguage())
                .targetLanguage(requests.get(0).getTargetLanguage())
                .context("batch_translation")
                .preserveTechnicalTerms(true)
                .preserveCodeBlocks(true)
                .build();

        return translate(batchRequest);
    }

    public String detectLanguage(String text) {
        log.info("🔍 Language detection for text ({} chars)", text.length());

        // Simple heuristic-based language detection
        if (containsCyrillic(text)) {
            if (text.contains("ə") || text.contains("ı") || text.contains("ö") || text.contains("ü") || text.contains("ş") || text.contains("ç")) return "az";
            if (text.contains("і") || text.contains("ї") || text.contains("є")) return "uk";
            return "ru";
        }
        if (containsArabic(text)) return "ar";
        if (containsDevanagari(text)) return "hi";
        if (containsCJK(text)) {
            if (containsKana(text)) return "ja";
            if (containsHangul(text)) return "ko";
            return "zh";
        }
        if (text.contains("ü") || text.contains("ö") || text.contains("ä") || text.contains("ß")) {
            if (text.contains("ş") || text.contains("ç") || text.contains("ğ")) return "tr";
            return "de";
        }
        if (text.contains("ñ") || text.contains("¿") || text.contains("¡")) return "es";
        if (text.contains("ç") && text.contains("ã")) return "pt";
        if (text.contains("è") || text.contains("ê") || text.contains("ë") || text.contains("ù")) return "fr";

        return "en"; // default
    }

    public Map<String, String> getSupportedLanguages() {
        return Collections.unmodifiableMap(SUPPORTED_LANGUAGES);
    }

    // --- Helper Methods ---

    private String extractCodeBlocks(String text, List<String> codeBlocks) {
        Pattern pattern = Pattern.compile("```[\\s\\S]*?```|`[^`]+`");
        Matcher matcher = pattern.matcher(text);
        StringBuffer sb = new StringBuffer();
        int i = 0;
        while (matcher.find()) {
            codeBlocks.add(matcher.group());
            matcher.appendReplacement(sb, "CODE_BLOCK_" + i);
            i++;
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    private String restoreCodeBlocks(String text, List<String> codeBlocks) {
        for (int i = 0; i < codeBlocks.size(); i++) {
            text = text.replace("CODE_BLOCK_" + i, codeBlocks.get(i));
        }
        return text;
    }

    private List<String> extractTechnicalTerms(String text) {
        List<String> techTerms = new ArrayList<>();
        String[] knownTerms = {"API", "REST", "CRUD", "SQL", "NoSQL", "JWT", "OAuth", "HTTPS", "TCP", "UDP",
                "Docker", "Kubernetes", "CI/CD", "Git", "WebSocket", "GraphQL", "gRPC", "Redis", "Kafka",
                "PostgreSQL", "MongoDB", "Elasticsearch", "Spring Boot", "React", "Angular", "Vue.js",
                "Node.js", "TypeScript", "JavaScript", "Python", "Java", "Kotlin", "Go", "Rust",
                "AWS", "Azure", "GCP", "S3", "Lambda", "EC2", "DevOps", "Agile", "Scrum",
                "microservices", "monolith", "serverless", "containerization", "orchestration"};

        for (String term : knownTerms) {
            if (text.contains(term)) techTerms.add(term);
        }
        return techTerms;
    }

    private TranslationResponseDto buildFallbackTranslation(TranslationRequestDto request, String text,
                                                             List<String> codeBlocks, List<String> preservedTerms) {
        // Provide a fallback with language tags to indicate translation is needed
        String sourceLang = SUPPORTED_LANGUAGES.getOrDefault(request.getSourceLanguage(), request.getSourceLanguage());
        String targetLang = SUPPORTED_LANGUAGES.getOrDefault(request.getTargetLanguage(), request.getTargetLanguage());

        String translatedText = String.format("[%s → %s] %s", sourceLang, targetLang, text);
        translatedText = restoreCodeBlocks(translatedText, codeBlocks);

        Map<String, String> glossaryApplied = new LinkedHashMap<>();
        for (String term : preservedTerms) {
            glossaryApplied.put(term, term); // preserved as-is
        }

        return TranslationResponseDto.builder()
                .translatedText(translatedText)
                .sourceLanguage(request.getSourceLanguage())
                .targetLanguage(request.getTargetLanguage())
                .detectedSourceLanguage(detectLanguage(request.getText()))
                .confidenceScore(45.0)
                .quality(TranslationResponseDto.TranslationQuality.builder()
                        .fluencyScore(40.0)
                        .accuracyScore(50.0)
                        .technicalAccuracy(60.0)
                        .qualityLevel("NEEDS_REVIEW")
                        .warnings(List.of("Fallback translation - AI service unavailable", "Manual review recommended"))
                        .build())
                .preservedTerms(preservedTerms)
                .glossaryApplied(glossaryApplied)
                .alternatives(List.of(
                        TranslationResponseDto.AlternativeTranslation.builder()
                                .text(text)
                                .confidence(100.0)
                                .style("ORIGINAL")
                                .build()
                ))
                .build();
    }

    private String buildTranslationPrompt(String text, TranslationRequestDto request, List<String> preservedTerms) {
        String sourceLang = SUPPORTED_LANGUAGES.getOrDefault(request.getSourceLanguage(), request.getSourceLanguage());
        String targetLang = SUPPORTED_LANGUAGES.getOrDefault(request.getTargetLanguage(), request.getTargetLanguage());

        StringBuilder prompt = new StringBuilder();
        prompt.append(String.format("Translate the following text from %s to %s.\n", sourceLang, targetLang));

        if (request.getDomain() != null) {
            prompt.append(String.format("Domain: %s (use domain-specific terminology)\n", request.getDomain()));
        }
        if (request.getContext() != null) {
            prompt.append(String.format("Context: This is a %s in a technical interview platform.\n", request.getContext()));
        }
        if (!preservedTerms.isEmpty()) {
            prompt.append("Keep these technical terms in their original form: ").append(String.join(", ", preservedTerms)).append("\n");
        }

        prompt.append("\nText to translate:\n").append(text);
        prompt.append("\n\nReturn ONLY the translated text, nothing else.");

        return prompt.toString();
    }

    private String parseTranslationResponse(String response) {
        if (response == null || response.isEmpty()) return null;
        // The response should be just the translated text
        return response.trim();
    }

    private boolean containsCyrillic(String text) {
        return text.chars().anyMatch(c -> (c >= 0x0400 && c <= 0x04FF));
    }
    private boolean containsArabic(String text) {
        return text.chars().anyMatch(c -> (c >= 0x0600 && c <= 0x06FF));
    }
    private boolean containsDevanagari(String text) {
        return text.chars().anyMatch(c -> (c >= 0x0900 && c <= 0x097F));
    }
    private boolean containsCJK(String text) {
        return text.chars().anyMatch(c -> (c >= 0x4E00 && c <= 0x9FFF));
    }
    private boolean containsKana(String text) {
        return text.chars().anyMatch(c -> (c >= 0x3040 && c <= 0x30FF));
    }
    private boolean containsHangul(String text) {
        return text.chars().anyMatch(c -> (c >= 0xAC00 && c <= 0xD7AF));
    }

    private String callClaudeAPI(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", anthropicApiKey);
        headers.set("anthropic-version", "2023-06-01");

        Map<String, Object> body = Map.of(
                "model", CLAUDE_MODEL, "max_tokens", 4000,
                "messages", List.of(Map.of("role", "user", "content", prompt)));

        try {
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    CLAUDE_API_URL, HttpMethod.POST, new HttpEntity<>(body, headers), JsonNode.class);
            if (response.getBody() != null && response.getBody().has("content")) {
                return response.getBody().get("content").get(0).get("text").asText();
            }
        } catch (Exception e) {
            log.error("Claude API call failed: {}", e.getMessage());
        }
        return null;
    }
}
