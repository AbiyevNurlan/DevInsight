package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictiveHiringRequestDto {
    @NotNull
    private Long companyId;

    private Long candidateId;
    private Long interviewId;

    // Historical data for ML
    private Integer companyTenure;            // how long company has been hiring
    private String department;
    private String role;
    private String seniorityLevel;            // JUNIOR, MID, SENIOR, LEAD, DIRECTOR

    // Candidate signals
    private Double interviewScore;
    private Integer yearsOfExperience;
    private Integer numberOfJobChanges;
    private Double averageTenureMonths;       // avg months per past job
    private Boolean hasCompetingOffers;
    private Double salaryExpectation;
    private Double marketSalary;              // market average for this role
    private String educationLevel;            // HIGH_SCHOOL, BACHELOR, MASTER, PHD
    private String locationPreference;        // REMOTE, HYBRID, ONSITE
    private List<String> skills;

    // Pipeline context
    private Integer totalCandidatesInPipeline;
    private Integer daysInPipeline;
    private Integer interviewRoundsCompleted;
    private Integer totalInterviewRounds;
}
