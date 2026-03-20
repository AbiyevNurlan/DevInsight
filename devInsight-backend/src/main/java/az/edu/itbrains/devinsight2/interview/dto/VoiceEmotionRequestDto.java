package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoiceEmotionRequestDto {
    private Long candidateId;
    private Long interviewId;
    private String transcript;
    private Double averagePitch;       // Hz
    private Double pitchVariance;
    private Double speakingRate;       // words per minute
    private Double pauseFrequency;    // pauses per minute
    private Double averagePauseDuration; // seconds
    private Double volumeLevel;       // dB normalized 0-1
    private Double volumeVariance;
    private List<Double> pitchTimeline;   // pitch values over time
    private List<Double> energyTimeline;  // energy values over time
    private Integer totalDurationSeconds;
    private String questionContext;
}
