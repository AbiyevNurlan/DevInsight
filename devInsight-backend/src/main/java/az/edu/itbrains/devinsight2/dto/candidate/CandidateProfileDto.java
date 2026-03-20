package az.edu.itbrains.devinsight2.dto.candidate;

import az.edu.itbrains.devinsight2.model.core.AccountStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * DTO for candidate profile with aggregated statistics
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateProfileDto {
    
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private String bio;
    private Set<String> skills;
    
    // LinkedIn and GitHub profiles
    private String linkedinUrl;
    private String githubUrl;
    
    // Account info
    private AccountStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    
    // Aggregated statistics
    private Integer totalInterviews;
    private Integer completedInterviews;
    private Integer pendingInterviews;
    private Double averageScore;
    private String lastInterviewDate;
    private String candidateStatus; // SCHEDULED, INTERVIEWED, PASSED, FAILED, NEW
    
    // Company info (if applicable)
    private Long companyId;
    private String companyName;
}
