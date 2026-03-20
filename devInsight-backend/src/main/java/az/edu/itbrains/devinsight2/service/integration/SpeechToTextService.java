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

@Service
@RequiredArgsConstructor
@Slf4j
public class SpeechToTextService {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${google.cloud.speech.api-key}")
    private String googleApiKey;

    @Value("${google.cloud.speech.language-code:az-AZ}")
    private String languageCode;


    public String transcribeAudio(String audioUrl) {
        try {
            log.info("Starting speech-to-text transcription for URL: {}", audioUrl);

            if (audioUrl == null || audioUrl.trim().isEmpty()) {
                throw new IllegalArgumentException("Audio URL cannot be empty");
            }

            byte[] audioBytes = downloadAudioFromUrl(audioUrl);

            String transcript = transcribeViaRest(audioBytes);

            if (transcript == null || transcript.trim().isEmpty()) {
                log.warn("Speech-to-text returned empty transcript");
                transcript = "[No speech detected]";
            }

            log.info("Transcription completed. Text: {}",
                    transcript.substring(0, Math.min(100, transcript.length())) + "...");

            return transcript;

        } catch (Exception e) {
            log.error("Speech-to-text transcription failed: ", e);
            throw new RuntimeException("Failed to transcribe audio: " + e.getMessage());
        }
    }


    private String transcribeViaRest(byte[] audioBytes) {
        try {
            log.debug("Calling Google Cloud Speech-to-Text REST API");

            // Encode audio to base64
            String encodedAudio = Base64.getEncoder().encodeToString(audioBytes);

            // Request body
            Map<String, Object> audio = new HashMap<>();
            audio.put("content", encodedAudio);

            Map<String, Object> config = new HashMap<>();
            config.put("encoding", "LINEAR16");
            config.put("sampleRateHertz", 48000);
            config.put("languageCode", languageCode);
            config.put("enableAutomaticPunctuation", true);
            config.put("useEnhanced", true);
            config.put("model", "latest_long");

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("audio", audio);
            requestBody.put("config", config);

            // Call Google Cloud API
            String response = webClientBuilder.build()
                    .post()
                    .uri("https://speech.googleapis.com/v1/speech:recognize?key={apiKey}")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(60))
                    .block();

            if (response == null) {
                throw new RuntimeException("Empty response from STT API");
            }

            // Parse response and extract transcript
            JsonNode responseJson = objectMapper.readTree(response);
            StringBuilder transcript = new StringBuilder();

            JsonNode results = responseJson.get("results");
            if (results != null && results.isArray()) {
                for (JsonNode result : results) {
                    JsonNode alternatives = result.get("alternatives");
                    if (alternatives != null && alternatives.isArray()) {
                        for (JsonNode alternative : alternatives) {
                            String text = alternative.get("transcript").asText();
                            transcript.append(text).append(" ");
                        }
                    }
                }
            }

            log.debug("Transcription completed");
            return transcript.toString().trim();

        } catch (Exception e) {
            log.error("Failed to call STT REST API: ", e);
            throw new RuntimeException("STT API error: " + e.getMessage());
        }
    }


    private byte[] downloadAudioFromUrl(String audioUrl) {
        try {
            log.debug("Downloading audio from URL: {}", audioUrl);

            byte[] audioBytes = webClientBuilder.build()
                    .get()
                    .uri(audioUrl)
                    .retrieve()
                    .bodyToMono(byte[].class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            if (audioBytes == null || audioBytes.length == 0) {
                throw new RuntimeException("Downloaded audio is empty");
            }

            log.debug("Downloaded {} bytes from S3", audioBytes.length);
            return audioBytes;

        } catch (Exception e) {
            log.error("Failed to download audio from URL: ", e);
            throw new RuntimeException("Failed to download audio: " + e.getMessage());
        }
    }


    public boolean testTranscription(String audioUrl) {
        try {
            log.info("Testing speech-to-text with audio URL: {}", audioUrl);

            String transcript = transcribeAudio(audioUrl);

            if (transcript == null || transcript.isEmpty() ||
                    transcript.equals("[No speech detected]")) {
                log.warn("Test transcription returned no speech");
                return false;
            }

            log.info("Speech-to-text test passed! Transcript: {}", transcript);
            return true;

        } catch (Exception e) {
            log.error("Speech-to-text test failed: ", e);
            return false;
        }
    }
}