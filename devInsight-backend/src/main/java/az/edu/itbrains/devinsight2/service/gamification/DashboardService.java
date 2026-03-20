package az.edu.itbrains.devinsight2.service.gamification;

import az.edu.itbrains.devinsight2.dto.dashboard.DashboardSummaryDto;
import az.edu.itbrains.devinsight2.dto.dashboard.DashboardSummaryDto.*;
import az.edu.itbrains.devinsight2.model.interview.Interview;
import az.edu.itbrains.devinsight2.model.interview.InterviewStatus;
import az.edu.itbrains.devinsight2.model.submission.Submission;
import az.edu.itbrains.devinsight2.repository.interview.InterviewRepository;
import az.edu.itbrains.devinsight2.repository.submission.SubmissionRepository;
import az.edu.itbrains.devinsight2.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for aggregating dashboard statistics.
 * All queries are optimized for PostgreSQL using Spring Data JPA.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {
    
    private final UserRepository userRepository;
    private final InterviewRepository interviewRepository;
    private final SubmissionRepository submissionRepository;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    private static final int RECENT_ITEMS_LIMIT = 5;
    
    /**
     * Get comprehensive dashboard summary with all statistics.
     * Uses optimized queries to minimize database round trips.
     */
    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary() {
        log.debug("Fetching dashboard summary statistics");
        
        // Counters
        long totalUsers = userRepository.count();
        long totalInterviews = interviewRepository.count();
        long activeInterviews = interviewRepository.countByStatus(InterviewStatus.ACTIVE);
        long totalSubmissions = submissionRepository.count();
        
        // Interview status breakdown
        InterviewStatusBreakdown interviewStatusBreakdown = getInterviewStatusBreakdown();
        
        // Submission type breakdown
        SubmissionTypeBreakdown submissionTypeBreakdown = getSubmissionTypeBreakdown();
        
        // Recent active interviews
        List<RecentInterviewDto> recentActiveInterviews = getRecentActiveInterviews();
        
        // Recent submissions
        List<RecentSubmissionDto> recentSubmissions = getRecentSubmissions();
        
        return DashboardSummaryDto.builder()
                .totalUsers(totalUsers)
                .totalInterviews(totalInterviews)
                .activeInterviews(activeInterviews)
                .totalSubmissions(totalSubmissions)
                .interviewStatusBreakdown(interviewStatusBreakdown)
                .submissionTypeBreakdown(submissionTypeBreakdown)
                .recentActiveInterviews(recentActiveInterviews)
                .recentSubmissions(recentSubmissions)
                .build();
    }
    
    /**
     * Get breakdown of interviews by status (draft/published/archived).
     */
    private InterviewStatusBreakdown getInterviewStatusBreakdown() {
        long draft = interviewRepository.countByStatus(InterviewStatus.DRAFT);
        long published = interviewRepository.countByStatus(InterviewStatus.ACTIVE);
        long archived = interviewRepository.countByStatus(InterviewStatus.ARCHIVED);
        
        return InterviewStatusBreakdown.builder()
                .draft(draft)
                .published(published)
                .archived(archived)
                .build();
    }
    
    /**
     * Get breakdown of submissions by type (video/code/text).
     */
    private SubmissionTypeBreakdown getSubmissionTypeBreakdown() {
        long videoSubmissions = submissionRepository.countVideoSubmissions();
        long codeSubmissions = submissionRepository.countCodeSubmissions();
        long textSubmissions = submissionRepository.countTextSubmissions();
        
        return SubmissionTypeBreakdown.builder()
                .videoSubmissions(videoSubmissions)
                .codeSubmissions(codeSubmissions)
                .textSubmissions(textSubmissions)
                .build();
    }
    
    /**
     * Get last 5 active interviews with company details.
     */
    private List<RecentInterviewDto> getRecentActiveInterviews() {
        PageRequest pageRequest = PageRequest.of(0, RECENT_ITEMS_LIMIT);
        List<Interview> interviews = interviewRepository.findRecentByStatus(
                InterviewStatus.ACTIVE, pageRequest);
        
        return interviews.stream()
                .map(this::mapToRecentInterviewDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get last 5 submissions with interview and user details.
     */
    private List<RecentSubmissionDto> getRecentSubmissions() {
        PageRequest pageRequest = PageRequest.of(0, RECENT_ITEMS_LIMIT);
        List<Submission> submissions = submissionRepository.findRecentSubmissions(pageRequest);
        
        return submissions.stream()
                .map(this::mapToRecentSubmissionDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Map Interview entity to RecentInterviewDto.
     */
    private RecentInterviewDto mapToRecentInterviewDto(Interview interview) {
        return RecentInterviewDto.builder()
                .id(interview.getId())
                .title(interview.getTitle())
                .companyId(interview.getCompany() != null ? interview.getCompany().getId() : null)
                .companyName(interview.getCompany() != null ? interview.getCompany().getName() : null)
                .status(interview.getStatus() != null ? interview.getStatus().name() : null)
                .createdAt(interview.getCreatedAt() != null ? 
                          interview.getCreatedAt().format(DATE_FORMATTER) : null)
                .build();
    }
    
    /**
     * Map Submission entity to RecentSubmissionDto.
     * Determines submission type based on which field is populated.
     */
    private RecentSubmissionDto mapToRecentSubmissionDto(Submission submission) {
        String type = determineSubmissionType(submission);
        
        return RecentSubmissionDto.builder()
                .id(submission.getId())
                .interviewId(submission.getInterview() != null ? 
                            submission.getInterview().getId() : null)
                .interviewTitle(submission.getInterview() != null ? 
                               submission.getInterview().getTitle() : null)
                .userId(submission.getCandidate() != null ? 
                       submission.getCandidate().getId() : null)
                .userName(submission.getCandidate() != null ? 
                         submission.getCandidate().getFullName() : null)
                .type(type)
                .status(submission.getStatus() != null ? submission.getStatus().name() : null)
                .createdAt(submission.getCreatedAt() != null ? 
                          submission.getCreatedAt().format(DATE_FORMATTER) : null)
                .build();
    }
    
    /**
     * Determine submission type based on populated fields.
     * Priority: VIDEO > CODE > TEXT
     */
    private String determineSubmissionType(Submission submission) {
        if (submission.getVideoUrl() != null && !submission.getVideoUrl().isEmpty()) {
            return "VIDEO";
        }
        if (submission.getCodeSubmission() != null && !submission.getCodeSubmission().isEmpty()) {
            return "CODE";
        }
        if (submission.getTextAnswer() != null && !submission.getTextAnswer().isEmpty()) {
            return "TEXT";
        }
        return "UNKNOWN";
    }
}
