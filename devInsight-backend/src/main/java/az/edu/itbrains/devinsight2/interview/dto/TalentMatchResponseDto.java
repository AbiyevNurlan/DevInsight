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
public class TalentMatchResponseDto {
    private Long jobId;
    private String jobTitle;
    private Integer totalCandidates;
    private Integer matchedCandidates;
    
    private List<CandidateMatchDto> topMatches;
    private List<CandidateMatchDto> goodMatches;
    private List<CandidateMatchDto> potentialMatches;
    
    // Global Distribution
    private LocationDistribution locationDistribution;
    private List<TimezoneGroup> timezoneGroups;
    
    // Insights
    private String marketInsight;
    private List<String> recommendations;
    private Double averageMatchScore;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocationDistribution {
        private Integer localCandidates;
        private Integer regionalCandidates;
        private Integer internationalCandidates;
        private Integer remoteCandidates;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimezoneGroup {
        private String timezone;
        private Integer candidateCount;
        private Integer offsetHours;
        private String compatibility; // EXCELLENT, GOOD, MODERATE, POOR
    }
}
