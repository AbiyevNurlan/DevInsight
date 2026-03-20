package az.edu.itbrains.devinsight2.service.analytics;

import az.edu.itbrains.devinsight2.dto.analytics.*;
import az.edu.itbrains.devinsight2.model.interview.Interview;
import az.edu.itbrains.devinsight2.model.interview.InterviewStatus;
import az.edu.itbrains.devinsight2.model.submission.Submission;
import az.edu.itbrains.devinsight2.model.submission.SubmissionStatus;
import az.edu.itbrains.devinsight2.repository.interview.InterviewRepository;
import az.edu.itbrains.devinsight2.repository.submission.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final InterviewRepository interviewRepository;
    private final SubmissionRepository submissionRepository;

    /**
     * Get analytics overview with key metrics
     */
    public AnalyticsOverviewDto getOverview() {
        log.info("Calculating analytics overview");

        // Total interviews count
        long totalInterviews = interviewRepository.count();

        // Get all submissions for calculations
        List<Submission> allSubmissions = submissionRepository.findAll();

        // Completion rate: submitted or analyzed submissions / total submissions
        long totalSubmissions = allSubmissions.size();
        long completedSubmissions = allSubmissions.stream()
                .filter(s -> s.getStatus() == SubmissionStatus.SUBMITTED || 
                             s.getStatus() == SubmissionStatus.ANALYZED ||
                             s.getStatus() == SubmissionStatus.EVALUATED)
                .count();
        double completionRate = totalSubmissions > 0 
                ? (completedSubmissions * 100.0) / totalSubmissions 
                : 0.0;

        // Average score from analyses
        double averageScore = allSubmissions.stream()
                .filter(s -> s.getAnalysis() != null && s.getAnalysis().getOverallScore() != null)
                .mapToInt(s -> s.getAnalysis().getOverallScore())
                .average()
                .orElse(0.0);

        // Pass rate: candidates who scored >= interview passing score
        long evaluatedCount = 0;
        long passedCount = 0;
        
        for (Submission submission : allSubmissions) {
            if (submission.getAnalysis() != null && submission.getAnalysis().getOverallScore() != null) {
                evaluatedCount++;
                Integer passingScore = submission.getInterview() != null && submission.getInterview().getPassingScore() != null
                        ? submission.getInterview().getPassingScore()
                        : 70; // Default passing score
                if (submission.getAnalysis().getOverallScore() >= passingScore) {
                    passedCount++;
                }
            }
        }
        double passRate = evaluatedCount > 0 ? (passedCount * 100.0) / evaluatedCount : 0.0;

        return AnalyticsOverviewDto.builder()
                .totalInterviews(totalInterviews)
                .completionRate(Math.round(completionRate * 100.0) / 100.0)
                .averageScore(Math.round(averageScore * 100.0) / 100.0)
                .passRate(Math.round(passRate * 100.0) / 100.0)
                .build();
    }

    /**
     * Get interview trends for the last N days
     */
    public List<InterviewTrendDto> getTrends(int days) {
        log.info("Getting interview trends for last {} days", days);

        LocalDateTime startDate = LocalDate.now().minusDays(days - 1).atStartOfDay();
        List<Interview> interviews = interviewRepository.findAll();

        // Group interviews by date
        Map<LocalDate, Long> interviewsByDate = interviews.stream()
                .filter(i -> i.getCreatedAt() != null && i.getCreatedAt().isAfter(startDate))
                .collect(Collectors.groupingBy(
                        i -> i.getCreatedAt().toLocalDate(),
                        Collectors.counting()
                ));

        // Create entries for all days in range (even those with 0 interviews)
        List<InterviewTrendDto> trends = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            Long count = interviewsByDate.getOrDefault(date, 0L);
            trends.add(InterviewTrendDto.builder()
                    .date(date)
                    .count(count)
                    .build());
        }

        return trends;
    }

    /**
     * Get score distribution across predefined ranges
     */
    public List<ScoreDistributionDto> getScoreDistribution() {
        log.info("Calculating score distribution");

        List<Submission> allSubmissions = submissionRepository.findAll();

        // Define score ranges
        Map<String, Long> distribution = new LinkedHashMap<>();
        distribution.put("0-20", 0L);
        distribution.put("21-40", 0L);
        distribution.put("41-60", 0L);
        distribution.put("61-80", 0L);
        distribution.put("81-100", 0L);

        // Count submissions in each range
        for (Submission submission : allSubmissions) {
            if (submission.getAnalysis() != null && submission.getAnalysis().getOverallScore() != null) {
                int score = submission.getAnalysis().getOverallScore();
                String range = getScoreRange(score);
                Long currentCount = distribution.get(range);
                distribution.put(range, (currentCount != null ? currentCount : 0L) + 1L);
            }
        }

        return distribution.entrySet().stream()
                .map(e -> ScoreDistributionDto.builder()
                        .scoreRange(e.getKey())
                        .count(e.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Get pass/fail/pending ratio
     */
    public PassFailRatioDto getPassFailRatio() {
        log.info("Calculating pass/fail ratio");

        List<Submission> allSubmissions = submissionRepository.findAll();

        long passed = 0;
        long failed = 0;
        long pending = 0;

        for (Submission submission : allSubmissions) {
            if (submission.getStatus() == SubmissionStatus.IN_PROGRESS || 
                submission.getStatus() == SubmissionStatus.DRAFT ||
                submission.getStatus() == SubmissionStatus.ANALYZING) {
                pending++;
            } else if (submission.getAnalysis() != null && submission.getAnalysis().getOverallScore() != null) {
                Integer passingScore = submission.getInterview() != null && submission.getInterview().getPassingScore() != null
                        ? submission.getInterview().getPassingScore()
                        : 70; // Default passing score
                if (submission.getAnalysis().getOverallScore() >= passingScore) {
                    passed++;
                } else {
                    failed++;
                }
            } else {
                // Submitted but not yet analyzed
                pending++;
            }
        }

        return PassFailRatioDto.builder()
                .passed(passed)
                .failed(failed)
                .pending(pending)
                .build();
    }

    /**
     * Helper method to determine score range
     */
    private String getScoreRange(int score) {
        if (score <= 20) return "0-20";
        if (score <= 40) return "21-40";
        if (score <= 60) return "41-60";
        if (score <= 80) return "61-80";
        return "81-100";
    }

    /**
     * Get hiring statistics for reports page
     */
    public Map<String, Object> getHiringStats() {
        log.info("Calculating hiring statistics");
        
        Map<String, Object> stats = new HashMap<>();
        
        List<Submission> allSubmissions = submissionRepository.findAll();
        List<Interview> allInterviews = interviewRepository.findAll();
        
        // Total hires (passed candidates)
        long totalHires = allSubmissions.stream()
            .filter(s -> s.getAnalysis() != null && s.getAnalysis().getOverallScore() != null)
            .filter(s -> {
                int passingScore = s.getInterview() != null && s.getInterview().getPassingScore() != null
                    ? s.getInterview().getPassingScore() : 70;
                return s.getAnalysis().getOverallScore() >= passingScore;
            })
            .count();
        
        // Total applications
        long totalApplications = allSubmissions.size();
        
        // Active interviews (open positions)
        long openPositions = allInterviews.stream()
            .filter(i -> i.getStatus() == InterviewStatus.ACTIVE)
            .count();
        
        // Average time to completion (days between creation and submission)
        double avgCompletionDays = allSubmissions.stream()
            .filter(s -> s.getCreatedAt() != null && s.getSubmittedAt() != null)
            .mapToLong(s -> java.time.Duration.between(s.getCreatedAt(), s.getSubmittedAt()).toDays())
            .average()
            .orElse(0.0);
        
        // Monthly trends
        Map<String, Map<String, Long>> monthlyData = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate month = LocalDate.now().minusMonths(i).withDayOfMonth(1);
            String monthKey = month.getMonth().toString().substring(0, 3);
            
            long monthHires = allSubmissions.stream()
                .filter(s -> s.getSubmittedAt() != null)
                .filter(s -> s.getSubmittedAt().toLocalDate().getMonth() == month.getMonth() 
                    && s.getSubmittedAt().toLocalDate().getYear() == month.getYear())
                .filter(s -> s.getAnalysis() != null && s.getAnalysis().getOverallScore() != null 
                    && s.getAnalysis().getOverallScore() >= 70)
                .count();
            
            long monthApps = allSubmissions.stream()
                .filter(s -> s.getCreatedAt() != null)
                .filter(s -> s.getCreatedAt().toLocalDate().getMonth() == month.getMonth()
                    && s.getCreatedAt().toLocalDate().getYear() == month.getYear())
                .count();
            
            Map<String, Long> monthStats = new HashMap<>();
            monthStats.put("hired", monthHires);
            monthStats.put("applications", monthApps);
            monthlyData.put(monthKey, monthStats);
        }
        
        stats.put("totalHires", totalHires);
        stats.put("totalApplications", totalApplications);
        stats.put("openPositions", openPositions);
        stats.put("avgCompletionDays", Math.round(avgCompletionDays));
        stats.put("monthlyTrends", monthlyData);
        
        return stats;
    }
}
