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
public class VoiceEmotionResponseDto {
    private String dominantEmotion;        // CONFIDENT, NERVOUS, CALM, EXCITED, STRESSED, NEUTRAL
    private Double confidenceScore;         // 0-100
    private Double stressLevel;             // 0-100
    private Double authenticityScore;       // 0-100 (genuine vs rehearsed)
    private Double engagementLevel;         // 0-100
    private Double clarityScore;            // 0-100

    // Detailed emotion breakdown
    private Map<String, Double> emotionBreakdown; // {confident: 0.7, nervous: 0.1, ...}

    // Voice characteristics
    private String speechPace;              // SLOW, MODERATE, FAST, VARIABLE
    private Boolean hasExcessiveFillers;     // um, uh, like
    private Integer fillerWordCount;
    private Boolean hasLongPauses;
    private Double averageResponseTime;     // seconds before answering

    // Timeline analysis
    private List<EmotionTimepoint> emotionTimeline;
    private String stressTrend;            // INCREASING, DECREASING, STABLE, FLUCTUATING

    // AI insights
    private String overallAssessment;
    private List<String> strengths;
    private List<String> concerns;
    private List<String> recommendations;
    private String interviewerTip;          // Real-time tip for interviewer

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmotionTimepoint {
        private Integer secondMark;
        private String emotion;
        private Double intensity;
        private String trigger;  // what caused the emotion shift
    }
}
