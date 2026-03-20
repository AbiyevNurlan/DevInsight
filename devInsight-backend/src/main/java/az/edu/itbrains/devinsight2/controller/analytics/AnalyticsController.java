package az.edu.itbrains.devinsight2.controller.analytics;

import az.edu.itbrains.devinsight2.dto.analytics.*;
import az.edu.itbrains.devinsight2.dto.common.ApiResponse;
import az.edu.itbrains.devinsight2.service.analytics.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for analytics endpoints
 * Provides statistics and metrics for interview data
 */
@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Analytics", description = "Endpoints for analytics and statistics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * Get analytics overview with key metrics
     * GET /api/analytics/overview
     */
    @GetMapping("/overview")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    @Operation(
        summary = "Get analytics overview",
        description = "Returns key metrics including total interviews, completion rate, average score, and pass rate"
    )
    public ResponseEntity<ApiResponse<AnalyticsOverviewDto>> getOverview() {
        log.info("GET /api/analytics/overview");
        
        AnalyticsOverviewDto overview = analyticsService.getOverview();
        
        return ResponseEntity.ok(
            ApiResponse.success("Analytics overview retrieved successfully", overview)
        );
    }

    /**
     * Get interview trends for the last N days
     * GET /api/analytics/trends?days=30
     */
    @GetMapping("/trends")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    @Operation(
        summary = "Get interview trends",
        description = "Returns daily interview counts for the specified number of days"
    )
    public ResponseEntity<ApiResponse<List<InterviewTrendDto>>> getTrends(
            @RequestParam(defaultValue = "30") int days
    ) {
        log.info("GET /api/analytics/trends - days: {}", days);
        
        // Limit to max 365 days
        if (days > 365) {
            days = 365;
        }
        if (days < 1) {
            days = 30;
        }
        
        List<InterviewTrendDto> trends = analyticsService.getTrends(days);
        
        return ResponseEntity.ok(
            ApiResponse.success("Interview trends retrieved successfully", trends)
        );
    }

    /**
     * Get score distribution across ranges
     * GET /api/analytics/score-distribution
     */
    @GetMapping("/score-distribution")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    @Operation(
        summary = "Get score distribution",
        description = "Returns distribution of scores across predefined ranges (0-20, 21-40, 41-60, 61-80, 81-100)"
    )
    public ResponseEntity<ApiResponse<List<ScoreDistributionDto>>> getScoreDistribution() {
        log.info("GET /api/analytics/score-distribution");
        
        List<ScoreDistributionDto> distribution = analyticsService.getScoreDistribution();
        
        return ResponseEntity.ok(
            ApiResponse.success("Score distribution retrieved successfully", distribution)
        );
    }

    /**
     * Get pass/fail/pending ratio
     * GET /api/analytics/pass-fail-ratio
     */
    @GetMapping("/pass-fail-ratio")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    @Operation(
        summary = "Get pass/fail ratio",
        description = "Returns counts of passed, failed, and pending candidates"
    )
    public ResponseEntity<ApiResponse<PassFailRatioDto>> getPassFailRatio() {
        log.info("GET /api/analytics/pass-fail-ratio");
        
        PassFailRatioDto ratio = analyticsService.getPassFailRatio();
        
        return ResponseEntity.ok(
            ApiResponse.success("Pass/fail ratio retrieved successfully", ratio)
        );
    }

    /**
     * Get hiring statistics for Reports page
     * GET /api/analytics/hiring-stats
     */
    @GetMapping("/hiring-stats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    @Operation(
        summary = "Get hiring statistics",
        description = "Returns hiring stats including total hires, open positions, and time-to-hire"
    )
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHiringStats() {
        log.info("GET /api/analytics/hiring-stats");
        
        Map<String, Object> stats = analyticsService.getHiringStats();
        
        return ResponseEntity.ok(
            ApiResponse.success("Hiring stats retrieved successfully", stats)
        );
    }
}
