package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmartSchedulerRequestDto {
    @NotNull
    private Long interviewId;
    @NotNull
    private Long candidateId;
    private List<Long> interviewerIds;

    // Candidate availability
    private List<TimeSlot> candidateAvailability;
    private String candidateTimezone;          // e.g., "Asia/Baku", "America/New_York"
    private String preferredTimeOfDay;         // MORNING, AFTERNOON, EVENING, ANY

    // Interview requirements
    private Integer durationMinutes;           // e.g., 60
    private String interviewType;              // TECHNICAL, BEHAVIORAL, SYSTEM_DESIGN, CODING
    private Integer panelSize;                 // number of interviewers needed
    private Boolean requiresVideoCall;
    private String priority;                   // URGENT, HIGH, NORMAL, LOW

    // Constraints
    private LocalDateTime deadlineDate;        // must be scheduled before this
    private Integer bufferMinutesBetween;      // gap between interviews (default 15)
    private List<LocalDateTime> excludedDates; // dates to avoid

    // Optimization preferences
    private Boolean optimizeForCandidate;      // prioritize candidate convenience
    private Boolean minimizeInterviewerConflicts;
    private Boolean avoidBackToBack;           // no consecutive interviews for interviewers
    private Map<String, String> interviewerTimezones; // userId -> timezone

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSlot {
        private LocalDateTime start;
        private LocalDateTime end;
        private String preference;             // PREFERRED, AVAILABLE, LAST_RESORT
    }
}
