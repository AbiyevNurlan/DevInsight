package az.edu.itbrains.devinsight2.service.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TextToSpeechService {

    private final S3Service s3Service;
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${google.cloud.tts.api-key}")
    private String googleApiKey;

    @Value("${google.cloud.tts.language-code:az-AZ}")
    private String languageCode;

    @Value("${google.cloud.tts.voice-name:az-AZ-Standard-A}")
    private String voiceName;

    /**
     * Textni sözə çevirir (Google Cloud REST API istifadə edib)
     */
    public String synthesizeAndUpload(String text) {
        try {
            log.info("Starting text-to-speech synthesis for text: {}",
                    text.substring(0, Math.min(50, text.length())) + "...");

            if (text == null || text.trim().isEmpty()) {
                throw new IllegalArgumentException("Text cannot be empty");
            }

            if (text.length() > 5000) {
                throw new IllegalArgumentException("Text too long. Max 5000 characters");
            }

            // Call Google Cloud TTS REST API
            byte[] audioBytes = synthesizeViaRest(text);

            // Upload to S3
            String s3Url = uploadToS3(audioBytes);

            log.info("Text-to-speech completed successfully. S3 URL: {}", s3Url);
            return s3Url;

        } catch (Exception e) {
            log.error("Text-to-speech synthesis failed: ", e);
            throw new RuntimeException("Failed to synthesize text: " + e.getMessage());
        }
    }

    /**
     * Google Cloud TTS REST API'yi çağır
     */
    private byte[] synthesizeViaRest(String text) {
        try {
            log.debug("Calling Google Cloud TTS REST API");

            // Request body
            Map<String, Object> input = new HashMap<>();
            input.put("text", text);

            Map<String, Object> voice = new HashMap<>();
            voice.put("languageCode", languageCode);
            voice.put("name", voiceName);

            Map<String, Object> audioConfig = new HashMap<>();
            audioConfig.put("audioEncoding", "MP3");

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("input", input);
            requestBody.put("voice", voice);
            requestBody.put("audioConfig", audioConfig);

            // Call Google Cloud API
            String response = webClientBuilder.build()
                    .post()
                    .uri("https://texttospeech.googleapis.com/v1/text:synthesize?key={apiKey}")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            if (response == null) {
                throw new RuntimeException("Empty response from TTS API");
            }

            // Extract audio content
            JsonNode responseJson = objectMapper.readTree(response);
            String audioContent = responseJson.get("audioContent").asText();

            log.debug("Audio synthesis completed");

            // Decode base64 to bytes
            return Base64.getDecoder().decode(audioContent);

        } catch (Exception e) {
            log.error("Failed to call TTS REST API: ", e);
            throw new RuntimeException("TTS API error: " + e.getMessage());
        }
    }

    /**
     * Audio bytes'ı S3'ə yüklə
     */
    private String uploadToS3(byte[] audioBytes) {
        try {
            String fileName = "interview_questions/" + UUID.randomUUID() + ".mp3";

            log.debug("Uploading audio to S3 with filename: {}", fileName);
            String s3Url = s3Service.uploadAudio(audioBytes, fileName);

            log.debug("Successfully uploaded to S3: {}", s3Url);
            return s3Url;

        } catch (Exception e) {
            log.error("Failed to upload audio to S3: ", e);
            throw new RuntimeException("S3 upload failed: " + e.getMessage());
        }
    }

    /**
     * Test method
     */
    public boolean testSynthesis(String testText) {
        try {
            log.info("Testing text-to-speech with text: {}", testText);

            byte[] audioBytes = synthesizeViaRest(testText);

            if (audioBytes == null || audioBytes.length == 0) {
                log.error("Synthesis returned empty audio");
                return false;
            }

            if (!isValidMp3(audioBytes)) {
                log.error("Invalid MP3 format");
                return false;
            }

            log.info("Text-to-speech test passed! Audio size: {} bytes", audioBytes.length);
            return true;

        } catch (Exception e) {
            log.error("Text-to-speech test failed: ", e);
            return false;
        }
    }

    /**
     * MP3 validity check
     */
    private boolean isValidMp3(byte[] audioBytes) {
        if (audioBytes == null || audioBytes.length < 2) {
            return false;
        }

        return (audioBytes[0] == (byte) 0xFF &&
                (audioBytes[1] == (byte) 0xFB || audioBytes[1] == (byte) 0xFA));
    }
}