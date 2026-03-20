package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmartSchedulerResponseDto {
    private Long interviewId;
    private Long candidateId;
    private String status;                     // SCHEDULED, NO_SLOTS_FOUND, CONFLICT, PENDING_CONFIRMATION

    // AI-recommended slots (ranked)
    private List<RecommendedSlot> recommendedSlots;

    // Scheduling analytics
    private SchedulingAnalytics analytics;

    // Calendar integration
    private String calendarEventId;
    private String meetingLink;                // Zoom/Teams/Meet link
    private String icalData;                   // iCal format for import

    // Notifications
    private List<String> notifiedParties;
    private LocalDateTime reminderScheduled;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecommendedSlot {
        private Integer rank;                  // 1 = best
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Double aiScore;                // 0-100 (how optimal)
        private String reason;                 // why this slot is good
        private List<String> availableInterviewers;
        private Map<String, String> timezoneDisplays; // timezone -> formatted time
        private Boolean candidatePreferred;
        private Integer interviewerConflicts;
        private String energyLevel;            // PEAK, GOOD, MODERATE, LOW (based on time of day)
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SchedulingAnalytics {
        private Double schedulingDifficulty;   // 0-100 (how hard to find slot)
        private Integer totalSlotsAnalyzed;
        private Integer viableSlots;
        private Double averageInterviewerLoad; // interviews per day
        private String busiestDay;
        private String recommendedDay;
        private String timezoneOverlap;        // common working hours
        private Integer estimatedResponseTimeHours; // when candidate likely confirms
    }
}
