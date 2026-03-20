package az.edu.itbrains.devinsight2.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Dashboard summary DTO containing aggregated statistics for the admin panel.
 * Optimized for frontend dashboard widgets (tables, charts, counters).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {
    
    // Counters for dashboard widgets
    private Long totalUsers;
    private Long totalInterviews;
    private Long activeInterviews;
    private Long totalSubmissions;
    
    // Interview status breakdown for pie/bar charts
    private InterviewStatusBreakdown interviewStatusBreakdown;
    
    // Submission type breakdown for pie/bar charts
    private SubmissionTypeBreakdown submissionTypeBreakdown;
    
    // Recent data for tables/lists
    private List<RecentInterviewDto> recentActiveInterviews;
    private List<RecentSubmissionDto> recentSubmissions;
    
    /**
     * Breakdown of interviews by status (published vs archived vs draft)
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InterviewStatusBreakdown {
        private Long draft;
        private Long published;  // ACTIVE status
        private Long archived;
    }
    
    /**
     * Breakdown of submissions by type (video vs code)
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmissionTypeBreakdown {
        private Long videoSubmissions;
        private Long codeSubmissions;
        private Long textSubmissions;
    }
    
    /**
     * DTO for recent active interviews displayed in dashboard table
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentInterviewDto {
        private Long id;
        private String title;
        private Long companyId;
        private String companyName;
        private String status;
        private String createdAt;
    }
    
    /**
     * DTO for recent submissions displayed in dashboard table
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentSubmissionDto {
        private Long id;
        private Long interviewId;
        private String interviewTitle;
        private Long userId;
        private String userName;
        private String type;  // VIDEO, CODE, TEXT
        private String status;
        private String createdAt;
    }
}
