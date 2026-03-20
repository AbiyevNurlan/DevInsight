package az.edu.itbrains.devinsight2.controller.gamification;

import az.edu.itbrains.devinsight2.model.gamification.Badge;
import az.edu.itbrains.devinsight2.model.user.UserBadge;
import az.edu.itbrains.devinsight2.repository.gamification.BadgeRepository;
import az.edu.itbrains.devinsight2.repository.gamification.PointTransactionRepository;
import az.edu.itbrains.devinsight2.service.gamification.GamificationService;
import az.edu.itbrains.devinsight2.service.auth.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/gamification")
@RequiredArgsConstructor
@Tag(name = "Gamification", description = "Gamification APIs - points, badges, leaderboards")
public class GamificationController {
    
    private final GamificationService gamificationService;
    private final UserService userService;
    private final BadgeRepository badgeRepository;
    private final PointTransactionRepository transactionRepository;
    
    @GetMapping("/profile")
    @Operation(summary = "Get current user's gamification profile")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'HR', 'ADMIN')")
    public ResponseEntity<GamificationService.GamificationProfile> getMyProfile() {
        Long userId = userService.getCurrentUser().getId();
        return ResponseEntity.ok(gamificationService.getUserProfile(userId));
    }
    
    @GetMapping("/profile/{userId}")
    @Operation(summary = "Get user's gamification profile by ID")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<GamificationService.GamificationProfile> getUserProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(gamificationService.getUserProfile(userId));
    }
    
    @GetMapping("/leaderboard")
    @Operation(summary = "Get global leaderboard")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'HR', 'ADMIN')")
    public ResponseEntity<List<GamificationService.LeaderboardEntry>> getLeaderboard(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(gamificationService.getLeaderboard(limit));
    }
    
    @GetMapping("/leaderboard/company/{companyId}")
    @Operation(summary = "Get company leaderboard")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<GamificationService.LeaderboardEntry>> getCompanyLeaderboard(
            @PathVariable Long companyId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(gamificationService.getCompanyLeaderboard(companyId, limit));
    }
    
    @GetMapping("/badges")
    @Operation(summary = "Get all available badges")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'HR', 'ADMIN')")
    public ResponseEntity<List<Badge>> getAllBadges() {
        return ResponseEntity.ok(badgeRepository.findByIsActiveTrue());
    }
    
    @GetMapping("/my-badges")
    @Operation(summary = "Get current user's earned badges")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'HR', 'ADMIN')")
    public ResponseEntity<List<UserBadge>> getMyBadges() {
        Long userId = userService.getCurrentUser().getId();
        GamificationService.GamificationProfile profile = gamificationService.getUserProfile(userId);
        return ResponseEntity.ok(profile.getBadges());
    }
    
    @GetMapping("/transactions")
    @Operation(summary = "Get current user's point transactions")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'HR', 'ADMIN')")
    public ResponseEntity<?> getMyTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = userService.getCurrentUser().getId();
        return ResponseEntity.ok(
            transactionRepository.findByUserId(userId, PageRequest.of(page, size))
        );
    }
    
    @GetMapping("/stats")
    @Operation(summary = "Get gamification statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(Map.of(
            "totalBadges", badgeRepository.count(),
            "activeBadges", badgeRepository.findByIsActiveTrue().size()
        ));
    }
    
    // Admin endpoints for badge management
    @PostMapping("/badges")
    @Operation(summary = "Create a new badge (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Badge> createBadge(@RequestBody Badge badge) {
        badge.setIsActive(true);
        return ResponseEntity.ok(badgeRepository.save(badge));
    }
    
    @PutMapping("/badges/{id}")
    @Operation(summary = "Update a badge (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Badge> updateBadge(@PathVariable Long id, @RequestBody Badge badge) {
        Badge existing = badgeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Badge not found: " + id));
        
        existing.setName(badge.getName());
        existing.setDescription(badge.getDescription());
        existing.setIconUrl(badge.getIconUrl());
        existing.setPointsValue(badge.getPointsValue());
        existing.setCategory(badge.getCategory());
        existing.setRarity(badge.getRarity());
        existing.setCriteria(badge.getCriteria());
        
        return ResponseEntity.ok(badgeRepository.save(existing));
    }
    
    @DeleteMapping("/badges/{id}")
    @Operation(summary = "Deactivate a badge (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateBadge(@PathVariable Long id) {
        Badge badge = badgeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Badge not found: " + id));
        badge.setIsActive(false);
        badgeRepository.save(badge);
        return ResponseEntity.ok().build();
    }
}
