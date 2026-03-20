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
public class TranscriptionResponseDto {
    private String transcript;
    private String language;
    private Double confidence; // 0.0-1.0
    private Integer duration; // in seconds
    private List<TimestampedSegment> segments;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimestampedSegment {
        private Integer startTime; // in milliseconds
        private Integer endTime;
        private String text;
        private String speaker;
        private Double confidence;
    }
}
