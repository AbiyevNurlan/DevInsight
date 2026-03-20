package az.edu.itbrains.devinsight2.service.candidate;

import az.edu.itbrains.devinsight2.dto.candidate.CandidateInterviewHistoryDto;
import az.edu.itbrains.devinsight2.dto.candidate.CandidateProfileDto;
import az.edu.itbrains.devinsight2.exception.ResourceNotFoundException;
import az.edu.itbrains.devinsight2.model.interview.Interview;
import az.edu.itbrains.devinsight2.model.submission.InterviewSubmission;
import az.edu.itbrains.devinsight2.model.submission.QuestionAnswer;
import az.edu.itbrains.devinsight2.model.submission.SubmissionStatus;
import az.edu.itbrains.devinsight2.model.user.User;
import az.edu.itbrains.devinsight2.model.user.UserRole;
import az.edu.itbrains.devinsight2.repository.submission.InterviewSubmissionRepository;
import az.edu.itbrains.devinsight2.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CandidateService {

    private final UserRepository userRepository;
    private final InterviewSubmissionRepository interviewSubmissionRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /**
     * Get all candidates with optional filters
     * Uses pagination-safe approach: fetch IDs first, then load with skills
     */
    @Transactional(readOnly = true)
    public Page<CandidateProfileDto> getAllCandidates(
            Pageable pageable,
            String search,
            String status,
            LocalDate startDate,
            LocalDate endDate,
            String skills
    ) {
        log.info("Getting candidates - page: {}, search: {}, status: {}", 
                pageable.getPageNumber(), search, status);

        try {
            // Step 1: Get paginated IDs only (efficient for large datasets)
            Page<User> candidatePage = userRepository.findByRole(UserRole.CANDIDATE, pageable);
            
            if (candidatePage.isEmpty()) {
                log.info("No candidates found in database");
                return new PageImpl<>(List.of(), pageable, 0);
            }

            // Step 2: Extract IDs from the page
            List<Long> candidateIds = candidatePage.getContent().stream()
                    .map(User::getId)
                    .collect(Collectors.toList());

            // Step 3: Fetch full entities WITH skills eagerly loaded (avoids N+1)
            List<User> candidatesWithSkills = userRepository.findByIdsWithSkills(candidateIds);

            // Step 4: Map to DTOs (skills are now initialized within transaction)
            List<CandidateProfileDto> candidateDtos = candidatesWithSkills.stream()
                    .map(user -> {
                        try {
                            return mapToCandidateProfileDto(user);
                        } catch (Exception e) {
                            log.error("Error mapping candidate {}: {}", user.getId(), e.getMessage());
                            return null;
                        }
                    })
                    .filter(dto -> dto != null && matchesFilters(dto, search, status, startDate, endDate, skills))
                    .collect(Collectors.toList());

            return new PageImpl<>(candidateDtos, pageable, candidatePage.getTotalElements());
        } catch (Exception e) {
            log.error("Error getting candidates: ", e);
            throw new RuntimeException("Failed to load candidates. Please try again.", e);
        }
    }

    /**
     * Get candidate profile by ID with skills eagerly loaded
     */
    @Transactional(readOnly = true)
    public CandidateProfileDto getCandidateById(Long id) {
        log.info("Getting candidate profile for user: {}", id);
        
        // Use the repository method that fetches skills within the transaction
        User user = userRepository.findByIdWithSkills(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));

        if (user.getRole() != UserRole.CANDIDATE) {
            throw new ResourceNotFoundException("User is not a candidate");
        }

        return mapToCandidateProfileDto(user);
    }

    /**
     * Get interview history for candidate
     */
    @Transactional(readOnly = true)
    public List<CandidateInterviewHistoryDto> getCandidateHistory(Long candidateId) {
        log.info("Getting interview history for candidate: {}", candidateId);

        // Verify candidate exists
        userRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

        // Get all interview submissions by this candidate
        List<InterviewSubmission> interviewSubmissions = interviewSubmissionRepository.findByUserId(candidateId);

        return interviewSubmissions.stream()
                .map(this::mapToHistoryDto)
                .sorted((a, b) -> {
                    if (a.getStartedAt() == null) return 1;
                    if (b.getStartedAt() == null) return -1;
                    return b.getStartedAt().compareTo(a.getStartedAt());
                })
                .collect(Collectors.toList());
    }

    /**
     * Update candidate status with skills eagerly loaded
     */
    @Transactional
    public CandidateProfileDto updateCandidateStatus(Long candidateId, String status, String notes) {
        log.info("Updating candidate {} status to: {}", candidateId, status);

        // Use repository method that fetches skills within transaction
        User candidate = userRepository.findByIdWithSkills(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

        // Note: Since we don't have a separate status field in User entity,
        // we're tracking this through submissions. In a real scenario, you might want to
        // add a candidateStatus field to the User entity.
        
        // For now, we'll just return the updated profile
        return mapToCandidateProfileDto(candidate);
    }

    /**
     * Map User entity to CandidateProfileDto with statistics.
     * IMPORTANT: This method assumes skills are already initialized (fetched via @EntityGraph or FETCH JOIN).
     * Call this only within a @Transactional context after proper data fetching.
     */
    private CandidateProfileDto mapToCandidateProfileDto(User user) {
        // Get interview submission statistics
        List<InterviewSubmission> interviewSubmissions = interviewSubmissionRepository.findByUserId(user.getId());
        
        int totalInterviews = interviewSubmissions.size();
        int completedInterviews = (int) interviewSubmissions.stream()
                .filter(s -> s.getStatus() == SubmissionStatus.SUBMITTED || 
                           s.getStatus() == SubmissionStatus.EVALUATED)
                .count();
        int pendingInterviews = (int) interviewSubmissions.stream()
                .filter(s -> s.getStatus() == SubmissionStatus.IN_PROGRESS || 
                           s.getStatus() == SubmissionStatus.DRAFT)
                .count();

        // Calculate average score from percentageScore field
        double avgScore = interviewSubmissions.stream()
                .filter(s -> s.getPercentageScore() != null && s.getPercentageScore() > 0)
                .mapToDouble(InterviewSubmission::getPercentageScore)
                .average()
                .orElse(0.0);

        // Get last interview date
        String lastInterviewDate = interviewSubmissions.stream()
                .map(InterviewSubmission::getCreatedAt)
                .filter(date -> date != null)
                .max(LocalDateTime::compareTo)
                .map(date -> date.format(DATE_FORMATTER))
                .orElse(null);

        // Determine candidate status based on interview submissions
        String candidateStatus = determineCandidateStatus(interviewSubmissions);

        // Safely access skills (should be initialized by caller)
        Set<String> userSkills = user.getSkills() != null ? new HashSet<>(user.getSkills()) : new HashSet<>();

        return CandidateProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .skills(userSkills)
                .linkedinUrl(user.getLinkedinUrl())
                .githubUrl(user.getGithubUrl())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .totalInterviews(totalInterviews)
                .completedInterviews(completedInterviews)
                .pendingInterviews(pendingInterviews)
                .averageScore(Math.round(avgScore * 100.0) / 100.0)
                .lastInterviewDate(lastInterviewDate)
                .candidateStatus(candidateStatus)
                .companyId(user.getCompany() != null ? user.getCompany().getId() : null)
                .companyName(user.getCompany() != null ? user.getCompany().getName() : null)
                .build();
    }

    /**InterviewSubmission to interview history DTO
     */
    private CandidateInterviewHistoryDto mapToHistoryDto(InterviewSubmission interviewSubmission) {
        Interview interview = interviewSubmission.getInterview();
        
        // Calculate duration
        Integer duration = null;
        if (interviewSubmission.getCreatedAt() != null && interviewSubmission.getSubmittedAt() != null) {
            duration = (int) ChronoUnit.MINUTES.between(
                    interviewSubmission.getCreatedAt(), 
                    interviewSubmission.getSubmittedAt());
        }

        // Get question stats from answers
        List<QuestionAnswer> answers = interviewSubmission.getAnswers();
        
        int totalQuestions = interviewSubmission.getTotalQuestions();
        int answeredQuestions = interviewSubmission.getAnsweredQuestions();
        double completionRate = totalQuestions > 0 ? 
                (answeredQuestions * 100.0 / totalQuestions) : 0.0;

        // Get feedback - could be from latest answer or aggregate
        String feedback = null;
        if (answers != null && !answers.isEmpty()) {
            feedback = answers.stream()
                    .filter(a -> a.getFeedback() != null && !a.getFeedback().isEmpty())
                    .map(QuestionAnswer::getFeedback)
                    .findFirst()
                    .orElse(null);
        }

        return CandidateInterviewHistoryDto.builder()
                .interviewId(interview != null ? interview.getId() : null)
                .interviewTitle(interview != null ? interview.getTitle() : "Unknown")
                .interviewType(interview != null && interview.getType() != null ? 
                        interview.getType().name() : null)
                .companyName(interview != null && interview.getCompany() != null ? 
                        interview.getCompany().getName() : null)
                .submissionId(interviewSubmission.getId())
                .submissionStatus(interviewSubmission.getStatus() != null ? 
                        interviewSubmission.getStatus().name() : null)
                .score(interviewSubmission.getPercentageScore())
                .feedback(feedback)
                .startedAt(interviewSubmission.getCreatedAt())
                .completedAt(interviewSubmission.getSubmittedAt())
                .durationMinutes(duration)
                .totalQuestions(totalQuestions)
                .answeredQuestions(answeredQuestions)
                .completionRate(Math.round(completionRate * 100.0) / 100.0)
                .build();
    }

    /**
     * Determine candidate status based on interview submissions
     */
    private String determineCandidateStatus(List<InterviewSubmission> interviewSubmissions) {
        if (interviewSubmissions.isEmpty()) {
            return "NEW";
        }

        // Check for in-progress submissions
        boolean hasInProgress = interviewSubmissions.stream()
                .anyMatch(s -> s.getStatus() == SubmissionStatus.IN_PROGRESS || 
                             s.getStatus() == SubmissionStatus.DRAFT);
        if (hasInProgress) {
            return "SCHEDULED";
        }

        // Check completed interviews
        List<InterviewSubmission> completed = interviewSubmissions.stream()
                .filter(s -> s.getStatus() == SubmissionStatus.SUBMITTED || 
                           s.getStatus() == SubmissionStatus.EVALUATED)
                .collect(Collectors.toList());

        if (completed.isEmpty()) {
            return "NEW";
        }

        // Check last interview result based on percentageScore
        InterviewSubmission lastSubmission = completed.stream()
                .max((a, b) -> {
                    LocalDateTime aTime = a.getSubmittedAt() != null ? a.getSubmittedAt() : a.getCreatedAt();
                    LocalDateTime bTime = b.getSubmittedAt() != null ? b.getSubmittedAt() : b.getCreatedAt();
                    return aTime.compareTo(bTime);
                })
                .orElse(null);

        if (lastSubmission != null && lastSubmission.getPercentageScore() != null) {
            double score = lastSubmission.getPercentageScore();
            if (score >= 70.0) {
                return "PASSED";
            } else if (score >= 50.0) {
                return "INTERVIEWED";
            } else {
                return "FAILED";
            }
        }

        return "INTERVIEWED";
    }

    /**
     * Check if candidate matches filters
     */
    private boolean matchesFilters(CandidateProfileDto dto, String search, String status,
                                   LocalDate startDate, LocalDate endDate, String skills) {
        // Search filter
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            boolean matchesSearch = 
                    (dto.getFullName() != null && dto.getFullName().toLowerCase().contains(searchLower)) ||
                    (dto.getEmail() != null && dto.getEmail().toLowerCase().contains(searchLower));
            if (!matchesSearch) return false;
        }

        // Status filter
        if (status != null && !status.isEmpty() && !status.equalsIgnoreCase("ALL")) {
            if (!status.equalsIgnoreCase(dto.getCandidateStatus())) {
                return false;
            }
        }

        // Skills filter
        if (skills != null && !skills.isEmpty()) {
            if (dto.getSkills() == null || dto.getSkills().stream()
                    .noneMatch(skill -> skill.toLowerCase().contains(skills.toLowerCase()))) {
                return false;
            }
        }

        // Date range filter (based on last interview date)
        if (startDate != null || endDate != null) {
            if (dto.getLastInterviewDate() == null) return false;
            
            try {
                LocalDateTime lastInterview = LocalDateTime.parse(dto.getLastInterviewDate(), DATE_FORMATTER);
                LocalDate lastDate = lastInterview.toLocalDate();
                
                if (startDate != null && lastDate.isBefore(startDate)) return false;
                if (endDate != null && lastDate.isAfter(endDate)) return false;
            } catch (Exception e) {
                log.warn("Failed to parse date: {}", dto.getLastInterviewDate());
            }
        }

        return true;
    }
}
