package az.edu.itbrains.devinsight2.controller.gamification;

import az.edu.itbrains.devinsight2.dto.common.ApiResponse;
import az.edu.itbrains.devinsight2.dto.dashboard.DashboardSummaryDto;
import az.edu.itbrains.devinsight2.service.gamification.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for admin dashboard statistics.
 * Provides aggregated data for dashboard widgets, charts, and tables.
 */
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Dashboard", description = "Admin dashboard statistics and analytics")
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    /** 
     * Get comprehensive dashboard summary with all statistics.
     * 
     * Response includes:
     * - Total counts (users, interviews, submissions)
     * - Interview status breakdown (draft/published/archived) for charts
     * - Submission type breakdown (video/code/text) for charts  
     * - Last 5 active interviews for recent activity table
     * - Last 5 submissions for recent activity table
     *
     * @return DashboardSummaryDto with aggregated statistics
     */
    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    @Operation(
        summary = "Get dashboard summary", 
        description = "Returns aggregated statistics for the admin panel including " +
                      "counts, breakdowns, and recent activity data optimized for " +
                      "dashboard widgets (counters, charts, tables)"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Dashboard summary retrieved successfully",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Unauthorized - authentication required"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403",   
            description = "Forbidden - admin or company role required"
        )
    })
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getDashboardSummary() {
        log.info("Dashboard summary requested");
        
        DashboardSummaryDto summary = dashboardService.getDashboardSummary();
        
        return ResponseEntity.ok(
            ApiResponse.success("Dashboard summary retrieved successfully", summary)
        );
    }
}
