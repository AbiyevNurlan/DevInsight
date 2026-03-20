package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultimodalAnswerDto {
    private Long id;
    private Long sessionId;
    private Long questionId;
    private String questionText;
    
    // Text Answer
    private String textAnswer;
    
    // Voice Answer
    private String audioUrl;
    private String audioTranscript;
    private Integer audioDuration; // in seconds
    private AudioMetricsDto audioMetrics;
    
    // Video Answer
    private String videoUrl;
    private String videoTranscript;
    private Integer videoDuration; // in seconds
    private VideoMetricsDto videoMetrics;
    
    // Timestamps
    private String answeredAt;
    private String submittedAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AudioMetricsDto {
        private String tone; // CONFIDENT, NERVOUS, CALM, STRESSED
        private Double speechRate; // words per minute
        private Integer pauseCount;
        private Double averagePauseDuration; // in seconds
        private Boolean clearArticulation;
        private Double volumeLevel; // 0-100
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VideoMetricsDto {
        private String eyeContact; // GOOD, MODERATE, POOR
        private String facialExpression; // CONFIDENT, NERVOUS, NEUTRAL, ENGAGED
        private String bodyLanguage; // OPEN, CLOSED, FIDGETING, CALM
        private Integer gestureCount;
        private Boolean professionalAppearance;
        private String backgroundQuality; // PROFESSIONAL, ACCEPTABLE, DISTRACTING
    }
}
