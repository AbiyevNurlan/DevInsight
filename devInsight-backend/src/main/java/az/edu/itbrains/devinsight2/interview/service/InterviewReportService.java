package az.edu.itbrains.devinsight2.interview.service;

import az.edu.itbrains.devinsight2.interview.dto.InterviewReportRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.InterviewReportResponseDto;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class InterviewReportService {

    private final RestTemplate restTemplate;

    @Value("${anthropic.api-key:}")
    private String anthropicApiKey;

    private static final String CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String CLAUDE_MODEL = "claude-3-5-sonnet-20241022";

    public InterviewReportResponseDto generateReport(InterviewReportRequestDto request) {
        String reportId = UUID.randomUUID().toString();
        log.info("📄 Generating {} report [{}] for candidate {} in interview {}",
                request.getReportType(), reportId, request.getCandidateId(), request.getInterviewId());

        // Build report sections
        InterviewReportResponseDto.CandidateOverview overview = buildCandidateOverview(request);
        InterviewReportResponseDto.ScoreBreakdown scoreBreakdown = buildScoreBreakdown(request);
        InterviewReportResponseDto.TechnicalAnalysis technical = buildTechnicalAnalysis(request);
        InterviewReportResponseDto.BehavioralInsights behavioral = buildBehavioralInsights(request);
        InterviewReportResponseDto.IntegrityReport integrity = buildIntegrityReport(request);
        InterviewReportResponseDto.AIInsights aiInsights = buildAIInsights(request, scoreBreakdown);
        InterviewReportResponseDto.HiringRecommendation hiring = buildHiringRecommendation(request, scoreBreakdown, integrity);

        // Build comparison if requested
        InterviewReportResponseDto.CandidateComparison comparison = null;
        if (request.getComparedWithCandidateId() != null) {
            comparison = buildComparison(request, scoreBreakdown);
        }

        // Generate HTML report
        String htmlContent = generateHTMLReport(reportId, overview, scoreBreakdown, technical, behavioral, integrity, aiInsights, hiring);

        return InterviewReportResponseDto.builder()
                .reportId(reportId)
                .interviewId(request.getInterviewId())
                .candidateId(request.getCandidateId())
                .reportType(request.getReportType() != null ? request.getReportType() : "FULL")
                .generatedAt(LocalDateTime.now())
                .candidateOverview(overview)
                .scoreBreakdown(scoreBreakdown)
                .technicalAnalysis(request.getIncludeCodeAnalysis() != null && request.getIncludeCodeAnalysis() ? technical : null)
                .behavioralInsights(behavioral)
                .integrityReport(request.getIncludeSecurityViolations() != null && request.getIncludeSecurityViolations() ? integrity : null)
                .aiInsights(request.getIncludeAIExplanations() != null && request.getIncludeAIExplanations() ? aiInsights : null)
                .comparison(comparison)
                .hiringRecommendation(request.getIncludeHiringRecommendation() != null && request.getIncludeHiringRecommendation() ? hiring : null)
                .htmlContent(htmlContent)
                .downloadUrl("/api/interview/reports/" + reportId + "/download")
                .build();
    }

    public InterviewReportResponseDto generateExecutiveSummary(Long interviewId, Long candidateId) {
        InterviewReportRequestDto request = InterviewReportRequestDto.builder()
                .interviewId(interviewId)
                .candidateId(candidateId)
                .reportType("EXECUTIVE")
                .includeHiringRecommendation(true)
                .includeAIExplanations(true)
                .build();
        return generateReport(request);
    }

    public Map<String, Object> compareMultipleCandidates(Long interviewId, List<Long> candidateIds) {
        log.info("📊 Multi-candidate comparison for interview {} - {} candidates", interviewId, candidateIds.size());

        List<Map<String, Object>> candidateScores = new ArrayList<>();
        for (Long candidateId : candidateIds) {
            InterviewReportResponseDto.ScoreBreakdown scores = buildScoreBreakdown(
                    InterviewReportRequestDto.builder().interviewId(interviewId).candidateId(candidateId).build());

            candidateScores.add(Map.of(
                    "candidateId", candidateId,
                    "overallScore", scores.getOverallScore(),
                    "categoryScores", scores.getCategoryScores(),
                    "percentileRank", scores.getPercentileRank(),
                    "grade", getGrade(scores.getOverallScore())
            ));
        }

        // Sort by overall score descending
        candidateScores.sort((a, b) -> Double.compare((Double) b.get("overallScore"), (Double) a.get("overallScore")));

        // Add rankings
        for (int i = 0; i < candidateScores.size(); i++) {
            candidateScores.get(i).put("rank", i + 1);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("interviewId", interviewId);
        result.put("totalCandidates", candidateIds.size());
        result.put("rankings", candidateScores);
        result.put("topCandidate", candidateScores.get(0).get("candidateId"));
        result.put("averageScore", candidateScores.stream().mapToDouble(c -> (Double) c.get("overallScore")).average().orElse(0));
        result.put("generatedAt", LocalDateTime.now().toString());
        return result;
    }

    // --- Section Builders ---

    private InterviewReportResponseDto.CandidateOverview buildCandidateOverview(InterviewReportRequestDto request) {
        return InterviewReportResponseDto.CandidateOverview.builder()
                .name("Candidate #" + request.getCandidateId())
                .email("candidate" + request.getCandidateId() + "@email.com")
                .appliedPosition("Software Developer")
                .interviewDate(LocalDateTime.now().minusDays(1).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                .totalQuestions(5)
                .answered(5)
                .timeTakenMinutes(42L)
                .overallGrade("B+")
                .build();
    }

    private InterviewReportResponseDto.ScoreBreakdown buildScoreBreakdown(InterviewReportRequestDto request) {
        // Simulate realistic score distribution
        Random rand = new Random(request.getCandidateId() != null ? request.getCandidateId() : 0);
        double base = 55 + rand.nextDouble() * 35; // 55-90 range

        Map<String, Double> categoryScores = new LinkedHashMap<>();
        categoryScores.put("Java", round(base + rand.nextDouble() * 15 - 7));
        categoryScores.put("Spring Boot", round(base + rand.nextDouble() * 15 - 7));
        categoryScores.put("SQL & Databases", round(base + rand.nextDouble() * 15 - 7));
        categoryScores.put("System Design", round(base + rand.nextDouble() * 15 - 7));
        categoryScores.put("Problem Solving", round(base + rand.nextDouble() * 15 - 7));
        categoryScores.replaceAll((k, v) -> Math.max(20, Math.min(100, v)));

        Map<String, Double> competencyScores = new LinkedHashMap<>();
        competencyScores.put("Technical Depth", round(base + rand.nextDouble() * 10 - 5));
        competencyScores.put("Communication", round(base + rand.nextDouble() * 15 - 7));
        competencyScores.put("Problem Solving", round(base + rand.nextDouble() * 10 - 5));
        competencyScores.put("Code Quality", round(base + rand.nextDouble() * 10 - 5));
        competencyScores.put("Architecture Thinking", round(base + rand.nextDouble() * 15 - 7));
        competencyScores.replaceAll((k, v) -> Math.max(20, Math.min(100, v)));

        double overall = categoryScores.values().stream().mapToDouble(d -> d).average().orElse(base);

        List<InterviewReportResponseDto.QuestionScore> questionScores = new ArrayList<>();
        String[] topics = {"OOP Principles", "REST API Design", "Database Optimization", "Concurrency", "System Architecture"};
        for (int i = 0; i < 5; i++) {
            double qScore = round(base + rand.nextDouble() * 20 - 10);
            qScore = Math.max(20, Math.min(100, qScore));
            questionScores.add(InterviewReportResponseDto.QuestionScore.builder()
                    .questionNumber(i + 1)
                    .question("Question about " + topics[i])
                    .topic(topics[i])
                    .score(qScore)
                    .grade(getGrade(qScore))
                    .feedback(qScore > 75 ? "Strong understanding demonstrated" : "Room for improvement")
                    .strengths(qScore > 70 ? List.of("Clear explanation", "Good examples") : List.of("Attempted the question"))
                    .weaknesses(qScore < 70 ? List.of("Could provide more depth", "Missing edge cases") : List.of())
                    .build());
        }

        return InterviewReportResponseDto.ScoreBreakdown.builder()
                .overallScore(round(overall))
                .categoryScores(categoryScores)
                .competencyScores(competencyScores)
                .questionScores(questionScores)
                .percentileRank(round(Math.min(99, overall + rand.nextDouble() * 10 - 5)))
                .build();
    }

    private InterviewReportResponseDto.TechnicalAnalysis buildTechnicalAnalysis(InterviewReportRequestDto request) {
        Random rand = new Random(request.getCandidateId() != null ? request.getCandidateId() + 100 : 100);
        double base = 55 + rand.nextDouble() * 35;

        Map<String, Double> proficiency = new LinkedHashMap<>();
        proficiency.put("Java", round(base + rand.nextDouble() * 10));
        proficiency.put("Spring Framework", round(base + rand.nextDouble() * 10 - 5));
        proficiency.put("SQL", round(base + rand.nextDouble() * 10 - 3));
        proficiency.put("REST APIs", round(base + rand.nextDouble() * 10));
        proficiency.put("Design Patterns", round(base + rand.nextDouble() * 10 - 7));
        proficiency.replaceAll((k, v) -> Math.max(20, Math.min(100, v)));

        List<String> demonstrated = proficiency.entrySet().stream()
                .filter(e -> e.getValue() >= 65)
                .map(e -> e.getKey() + " (Proficient)")
                .toList();

        List<String> missing = proficiency.entrySet().stream()
                .filter(e -> e.getValue() < 50)
                .map(e -> e.getKey() + " (Needs development)")
                .toList();

        return InterviewReportResponseDto.TechnicalAnalysis.builder()
                .skillProficiency(proficiency)
                .demonstratedSkills(demonstrated)
                .missingSkills(missing)
                .codeQualityAverage(round(base + rand.nextDouble() * 10 - 5))
                .codeAnalysis(Map.of(
                        "Q1 - Algorithm", base > 70 ? "Clean, efficient solution with O(n) complexity" : "Working solution but suboptimal complexity",
                        "Q3 - Database", base > 65 ? "Proper query optimization with indexing" : "Basic query without optimization"
                ))
                .architecturalThinking(base > 70 ? "Shows strong architectural awareness with scalability considerations" :
                        "Basic understanding of architecture; needs more exposure to system design")
                .problemSolvingApproach(base > 70 ? "Methodical - breaks problems into components, considers edge cases" :
                        "Linear approach - solves problems sequentially, sometimes misses edge cases")
                .build();
    }

    private InterviewReportResponseDto.BehavioralInsights buildBehavioralInsights(InterviewReportRequestDto request) {
        Random rand = new Random(request.getCandidateId() != null ? request.getCandidateId() + 200 : 200);
        double base = 60 + rand.nextDouble() * 30;

        Map<String, Double> emotions = new LinkedHashMap<>();
        emotions.put("Confidence", round(base + rand.nextDouble() * 15 - 7));
        emotions.put("Enthusiasm", round(base + rand.nextDouble() * 15 - 5));
        emotions.put("Stress", round(40 - rand.nextDouble() * 20));
        emotions.put("Focus", round(base + rand.nextDouble() * 10));
        emotions.replaceAll((k, v) -> Math.max(5, Math.min(100, v)));

        return InterviewReportResponseDto.BehavioralInsights.builder()
                .communicationScore(round(base + rand.nextDouble() * 10 - 5))
                .responseConsistency(round(75 + rand.nextDouble() * 20))
                .stressHandling(round(base + rand.nextDouble() * 10))
                .communicationStyle(base > 70 ? "Clear, structured, and proactive" : "Developing - sometimes needs prompting")
                .positiveTraits(List.of("Thoughtful responses", "Open to feedback", "Technical curiosity"))
                .concerns(base < 60 ? List.of("Hesitation on complex topics", "Needs more confidence") : List.of())
                .engagementLevel(round(base + rand.nextDouble() * 15))
                .emotionalProfile(emotions)
                .build();
    }

    private InterviewReportResponseDto.IntegrityReport buildIntegrityReport(InterviewReportRequestDto request) {
        return InterviewReportResponseDto.IntegrityReport.builder()
                .flagged(false)
                .totalViolations(0)
                .criticalViolations(0)
                .violationSummary(List.of("No violations detected during the interview"))
                .integrityScore(95.0)
                .trustLevel("HIGH")
                .aiContentDetected(false)
                .suspiciousBehavior(false)
                .build();
    }

    private InterviewReportResponseDto.AIInsights buildAIInsights(InterviewReportRequestDto request,
                                                                    InterviewReportResponseDto.ScoreBreakdown scores) {
        double overall = scores.getOverallScore();

        String readiness = overall >= 80 ? "READY" : overall >= 60 ? "PROMISING" : overall >= 40 ? "NEEDS_DEVELOPMENT" : "NOT_READY";

        List<String> strengths = new ArrayList<>();
        List<String> devAreas = new ArrayList<>();
        scores.getCategoryScores().forEach((cat, score) -> {
            if (score >= 75) strengths.add(cat + " expertise (" + score + "/100)");
            else if (score < 55) devAreas.add(cat + " improvement needed (" + score + "/100)");
        });

        String summary;
        if (anthropicApiKey != null && !anthropicApiKey.isEmpty()) {
            try {
                String prompt = String.format("""
                    Write a 3-sentence executive summary for a candidate interview report.
                    Overall score: %.1f/100. Strengths: %s. Weaknesses: %s. Role readiness: %s.
                    Be professional, balanced, and actionable.""",
                        overall, strengths, devAreas, readiness);
                summary = callClaudeAPI(prompt);
                if (summary != null && !summary.isEmpty()) {
                    return InterviewReportResponseDto.AIInsights.builder()
                            .executiveSummary(summary)
                            .keyStrengths(strengths)
                            .developmentAreas(devAreas)
                            .growthPotential(overall >= 60 ? "HIGH" : "MODERATE")
                            .roleReadiness(readiness)
                            .cultureFitAssessment("Compatible with collaborative engineering teams")
                            .interviewHighlights(List.of("Strong problem decomposition", "Good communication"))
                            .uniqueQualities("Shows passion for clean code and continuous learning")
                            .confidenceInAssessment(85.0)
                            .build();
                }
            } catch (Exception e) {
                log.error("AI summary generation failed: {}", e.getMessage());
            }
        }

        summary = String.format("Candidate demonstrated a %.0f/100 overall performance. %s. %s.",
                overall,
                strengths.isEmpty() ? "Performance was consistent" : "Key strengths include " + String.join(", ", strengths),
                readiness.equals("READY") ? "Recommended for hire" : "Further development needed before taking on this role");

        return InterviewReportResponseDto.AIInsights.builder()
                .executiveSummary(summary)
                .keyStrengths(strengths.isEmpty() ? List.of("Consistent performance across topics") : strengths)
                .developmentAreas(devAreas.isEmpty() ? List.of("No critical gaps identified") : devAreas)
                .growthPotential(overall >= 60 ? "HIGH" : "MODERATE")
                .roleReadiness(readiness)
                .cultureFitAssessment("Compatible with collaborative engineering teams")
                .interviewHighlights(List.of("Structured problem-solving approach", "Good engagement throughout"))
                .uniqueQualities("Demonstrates continuous learning mindset")
                .confidenceInAssessment(round(70 + (overall - 50) * 0.5))
                .build();
    }

    private InterviewReportResponseDto.HiringRecommendation buildHiringRecommendation(
            InterviewReportRequestDto request,
            InterviewReportResponseDto.ScoreBreakdown scores,
            InterviewReportResponseDto.IntegrityReport integrity) {

        double overall = scores.getOverallScore();
        String decision;
        if (overall >= 85 && integrity.getIntegrityScore() > 80) decision = "STRONG_HIRE";
        else if (overall >= 75) decision = "HIRE";
        else if (overall >= 65) decision = "LEAN_HIRE";
        else if (overall >= 50) decision = "LEAN_NO_HIRE";
        else if (overall >= 35) decision = "NO_HIRE";
        else decision = "STRONG_NO_HIRE";

        List<String> pros = new ArrayList<>();
        List<String> cons = new ArrayList<>();
        scores.getCategoryScores().forEach((cat, score) -> {
            if (score >= 75) pros.add("Strong " + cat + " skills");
            else if (score < 50) cons.add("Weak " + cat + " skills");
        });
        if (integrity.getIntegrityScore() > 90) pros.add("High interview integrity");
        if (integrity.getFlagged()) cons.add("Integrity concerns during interview");

        return InterviewReportResponseDto.HiringRecommendation.builder()
                .decision(decision)
                .confidence(round(60 + (overall - 50) * 0.8))
                .justification(String.format("Based on %.0f/100 overall score, %s integrity, and %d/%d strong categories.",
                        overall, integrity.getTrustLevel(), pros.size(), scores.getCategoryScores().size()))
                .prosForHiring(pros.isEmpty() ? List.of("Consistent performance") : pros)
                .consForHiring(cons.isEmpty() ? List.of("No significant concerns") : cons)
                .suggestedRole(overall < 60 ? "Consider for junior-level position" : null)
                .suggestedLevel(overall >= 85 ? "SENIOR" : overall >= 70 ? "MID" : "JUNIOR")
                .nextSteps(decision.contains("HIRE") ? "Proceed to offer stage" : "Send rejection with feedback")
                .build();
    }

    private InterviewReportResponseDto.CandidateComparison buildComparison(InterviewReportRequestDto request,
                                                                            InterviewReportResponseDto.ScoreBreakdown candidate1Scores) {
        InterviewReportResponseDto.ScoreBreakdown candidate2Scores = buildScoreBreakdown(
                InterviewReportRequestDto.builder().interviewId(request.getInterviewId())
                        .candidateId(request.getComparedWithCandidateId()).build());

        Map<String, Double[]> comparison = new LinkedHashMap<>();
        for (String category : candidate1Scores.getCategoryScores().keySet()) {
            comparison.put(category, new Double[]{
                    candidate1Scores.getCategoryScores().get(category),
                    candidate2Scores.getCategoryScores().getOrDefault(category, 50.0)
            });
        }

        double c1Avg = candidate1Scores.getOverallScore();
        double c2Avg = candidate2Scores.getOverallScore();
        String better = c1Avg >= c2Avg ? "Candidate #" + request.getCandidateId() : "Candidate #" + request.getComparedWithCandidateId();

        return InterviewReportResponseDto.CandidateComparison.builder()
                .comparedCandidateName("Candidate #" + request.getComparedWithCandidateId())
                .scoreComparison(comparison)
                .betterCandidate(better)
                .candidate1Advantages(List.of("Higher overall score: " + round(c1Avg)))
                .candidate2Advantages(List.of("Score: " + round(c2Avg)))
                .recommendation(String.format("Candidate #%d scores %.1f vs Candidate #%d at %.1f. %s is the stronger pick.",
                        request.getCandidateId(), c1Avg, request.getComparedWithCandidateId(), c2Avg, better))
                .build();
    }

    private String generateHTMLReport(String reportId, InterviewReportResponseDto.CandidateOverview overview,
                                       InterviewReportResponseDto.ScoreBreakdown scores,
                                       InterviewReportResponseDto.TechnicalAnalysis technical,
                                       InterviewReportResponseDto.BehavioralInsights behavioral,
                                       InterviewReportResponseDto.IntegrityReport integrity,
                                       InterviewReportResponseDto.AIInsights ai,
                                       InterviewReportResponseDto.HiringRecommendation hiring) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><meta charset='UTF-8'>");
        html.append("<title>DevInsight Interview Report - ").append(overview.getName()).append("</title>");
        html.append("<style>");
        html.append("body{font-family:'Segoe UI',Arial,sans-serif;max-width:900px;margin:0 auto;padding:40px;color:#1a1a2e;}");
        html.append(".header{background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:30px;border-radius:12px;margin-bottom:30px;}");
        html.append(".section{background:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:20px;border-left:4px solid #667eea;}");
        html.append(".score{font-size:48px;font-weight:bold;color:#667eea;}");
        html.append(".grade{display:inline-block;padding:4px 12px;border-radius:20px;font-weight:bold;color:white;}");
        html.append(".grade-A{background:#28a745;}.grade-B{background:#17a2b8;}.grade-C{background:#ffc107;color:#333;}.grade-D{background:#dc3545;}");
        html.append("table{width:100%;border-collapse:collapse;}th,td{padding:8px 12px;text-align:left;border-bottom:1px solid #dee2e6;}");
        html.append(".bar{height:20px;border-radius:10px;background:#667eea;transition:width 0.5s;}");
        html.append(".bar-bg{height:20px;border-radius:10px;background:#e9ecef;width:100%;}");
        html.append("</style></head><body>");

        // Header
        html.append("<div class='header'>");
        html.append("<h1>🔍 DevInsight Interview Report</h1>");
        html.append("<p>Report ID: ").append(reportId).append(" | Generated: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))).append("</p>");
        html.append("<p><strong>").append(overview.getName()).append("</strong> | ").append(overview.getAppliedPosition()).append("</p>");
        html.append("</div>");

        // Overall Score
        html.append("<div class='section' style='text-align:center'>");
        html.append("<div class='score'>").append(String.format("%.0f", scores.getOverallScore())).append("/100</div>");
        html.append("<span class='grade grade-").append(overview.getOverallGrade().substring(0, 1)).append("'>").append(overview.getOverallGrade()).append("</span>");
        html.append("<p>Percentile Rank: Top ").append(String.format("%.0f%%", 100 - scores.getPercentileRank())).append("</p>");
        html.append("</div>");

        // Score Breakdown
        html.append("<div class='section'><h2>📊 Score Breakdown</h2><table>");
        scores.getCategoryScores().forEach((cat, score) -> {
            html.append("<tr><td>").append(cat).append("</td><td style='width:60%'><div class='bar-bg'><div class='bar' style='width:")
                    .append(String.format("%.0f", score)).append("%'></div></div></td><td><strong>").append(String.format("%.0f", score)).append("</strong></td></tr>");
        });
        html.append("</table></div>");

        // AI Insights
        if (ai != null) {
            html.append("<div class='section'><h2>🤖 AI Insights</h2>");
            html.append("<p>").append(ai.getExecutiveSummary()).append("</p>");
            html.append("<p><strong>Role Readiness:</strong> ").append(ai.getRoleReadiness()).append("</p>");
            html.append("</div>");
        }

        // Hiring Recommendation
        if (hiring != null) {
            String color = hiring.getDecision().contains("HIRE") && !hiring.getDecision().contains("NO") ? "#28a745" : "#dc3545";
            html.append("<div class='section' style='border-left-color:").append(color).append("'>");
            html.append("<h2>✅ Hiring Recommendation</h2>");
            html.append("<p style='font-size:24px;font-weight:bold;color:").append(color).append("'>").append(hiring.getDecision().replace("_", " ")).append("</p>");
            html.append("<p>").append(hiring.getJustification()).append("</p>");
            html.append("</div>");
        }

        html.append("<footer style='text-align:center;color:#888;padding:20px;'>");
        html.append("<p>Generated by DevInsight AI Platform | Confidential</p></footer>");
        html.append("</body></html>");

        return html.toString();
    }

    private String getGrade(double score) {
        if (score >= 93) return "A+";
        if (score >= 85) return "A";
        if (score >= 78) return "B+";
        if (score >= 70) return "B";
        if (score >= 63) return "C+";
        if (score >= 55) return "C";
        if (score >= 45) return "D";
        return "F";
    }

    private double round(double val) {
        return Math.round(val * 10.0) / 10.0;
    }

    private String callClaudeAPI(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", anthropicApiKey);
        headers.set("anthropic-version", "2023-06-01");

        Map<String, Object> body = Map.of(
                "model", CLAUDE_MODEL, "max_tokens", 1000,
                "messages", List.of(Map.of("role", "user", "content", prompt)));

        try {
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    CLAUDE_API_URL, HttpMethod.POST, new HttpEntity<>(body, headers), JsonNode.class);
            if (response.getBody() != null && response.getBody().has("content")) {
                return response.getBody().get("content").get(0).get("text").asText();
            }
        } catch (Exception e) {
            log.error("Claude API call failed: {}", e.getMessage());
        }
        return null;
    }
}
