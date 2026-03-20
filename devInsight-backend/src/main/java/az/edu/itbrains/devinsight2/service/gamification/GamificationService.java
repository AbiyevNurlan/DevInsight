package az.edu.itbrains.devinsight2.service.gamification;

import az.edu.itbrains.devinsight2.model.gamification.PointTransaction;
import az.edu.itbrains.devinsight2.model.gamification.PointTransactionType;
import az.edu.itbrains.devinsight2.model.user.User;
import az.edu.itbrains.devinsight2.model.user.UserBadge;
import az.edu.itbrains.devinsight2.model.user.UserPoints;
import az.edu.itbrains.devinsight2.repository.gamification.BadgeRepository;
import az.edu.itbrains.devinsight2.repository.gamification.PointTransactionRepository;
import az.edu.itbrains.devinsight2.repository.user.UserBadgeRepository;
import az.edu.itbrains.devinsight2.repository.user.UserPointsRepository;
import az.edu.itbrains.devinsight2.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Gamification service for managing points, badges, and leaderboards
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class GamificationService {
    
    private final UserPointsRepository userPointsRepository;
    private final PointTransactionRepository transactionRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserRepository userRepository;
    
    /**
     * Award points to a user
     */
    public UserPoints awardPoints(Long userId, int points, PointTransactionType type, String reason) {
        return awardPoints(userId, points, type, reason, null, null);
    }
    
    public UserPoints awardPoints(Long userId, int points, PointTransactionType type, String reason,
                                   String referenceType, Long referenceId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        UserPoints userPoints = userPointsRepository.findByUserId(userId)
            .orElseGet(() -> createUserPoints(user));
        
        // Create transaction
        PointTransaction transaction = PointTransaction.builder()
            .user(user)
            .points(points)
            .type(type)
            .reason(reason)
            .referenceType(referenceType)
            .referenceId(referenceId)
            .build();
        transactionRepository.save(transaction);
        
        // Update points
        userPoints.setTotalPoints(userPoints.getTotalPoints() + points);
        userPoints.setLastActivityDate(LocalDateTime.now());
        userPoints.recalculateLevel();
        
        log.info("Awarded {} points to user {} for {}", points, userId, reason);
        
        return userPointsRepository.save(userPoints);
    }
    
    /**
     * Record interview completion
     */
    public void recordInterviewCompletion(Long userId, Long interviewId, double scorePercentage) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        UserPoints userPoints = userPointsRepository.findByUserId(userId)
            .orElseGet(() -> createUserPoints(user));
        
        // Update stats
        userPoints.setInterviewsCompleted(userPoints.getInterviewsCompleted() + 1);
        
        // Award points for completion
        awardPoints(userId, PointTransactionType.INTERVIEW_COMPLETED.getDefaultPoints(),
            PointTransactionType.INTERVIEW_COMPLETED, "Completed interview", "INTERVIEW", interviewId);
        
        // Check for perfect score
        if (scorePercentage >= 100) {
            userPoints.setPerfectScores(userPoints.getPerfectScores() + 1);
            awardPoints(userId, PointTransactionType.PERFECT_SCORE.getDefaultPoints(),
                PointTransactionType.PERFECT_SCORE, "Perfect score!", "INTERVIEW", interviewId);
            checkAndAwardBadge(userId, "PERFECT_SCORE");
        } else if (scorePercentage >= 80) {
            awardPoints(userId, PointTransactionType.HIGH_SCORE.getDefaultPoints(),
                PointTransactionType.HIGH_SCORE, "High score (80%+)", "INTERVIEW", interviewId);
        }
        
        // Check for first interview badge
        if (userPoints.getInterviewsCompleted() == 1) {
            awardPoints(userId, PointTransactionType.FIRST_INTERVIEW.getDefaultPoints(),
                PointTransactionType.FIRST_INTERVIEW, "First interview completed!", "INTERVIEW", interviewId);
            checkAndAwardBadge(userId, "FIRST_INTERVIEW");
        }
        
        // Update streak
        updateStreak(userPoints);
        
        userPointsRepository.save(userPoints);
        
        // Check for other badges
        checkMilestones(userId, userPoints);
    }
    
    /**
     * Update daily streak
     */
    private void updateStreak(UserPoints userPoints) {
        LocalDate today = LocalDate.now();
        LocalDate lastActivity = userPoints.getLastActivityDate() != null 
            ? userPoints.getLastActivityDate().toLocalDate() 
            : null;
        
        if (lastActivity == null || lastActivity.isBefore(today.minusDays(1))) {
            // Streak broken
            userPoints.setCurrentStreak(1);
        } else if (lastActivity.equals(today.minusDays(1))) {
            // Continue streak
            userPoints.setCurrentStreak(userPoints.getCurrentStreak() + 1);
            
            // Award streak bonus
            awardPoints(userPoints.getUser().getId(), 
                PointTransactionType.STREAK_BONUS.getDefaultPoints() * userPoints.getCurrentStreak(),
                PointTransactionType.STREAK_BONUS, 
                "Streak day " + userPoints.getCurrentStreak() + " bonus!");
        }
        // Same day - no streak change
        
        // Update longest streak
        if (userPoints.getCurrentStreak() > userPoints.getLongestStreak()) {
            userPoints.setLongestStreak(userPoints.getCurrentStreak());
        }
    }
    
    /**
     * Check and award milestone badges
     */
    private void checkMilestones(Long userId, UserPoints userPoints) {
        // Interview milestones
        if (userPoints.getInterviewsCompleted() == 5) {
            checkAndAwardBadge(userId, "FIVE_INTERVIEWS");
        } else if (userPoints.getInterviewsCompleted() == 10) {
            checkAndAwardBadge(userId, "TEN_INTERVIEWS");
        } else if (userPoints.getInterviewsCompleted() == 25) {
            checkAndAwardBadge(userId, "TWENTY_FIVE_INTERVIEWS");
        }
        
        // Streak milestones
        if (userPoints.getCurrentStreak() == 7) {
            checkAndAwardBadge(userId, "WEEK_STREAK");
        } else if (userPoints.getCurrentStreak() == 30) {
            checkAndAwardBadge(userId, "MONTH_STREAK");
        }
        
        // Level milestones
        if (userPoints.getLevel() == 5) {
            checkAndAwardBadge(userId, "LEVEL_5");
        } else if (userPoints.getLevel() == 10) {
            checkAndAwardBadge(userId, "LEVEL_10");
        }
    }
    
    /**
     * Check and award a specific badge
     */
    public void checkAndAwardBadge(Long userId, String badgeCode) {
        badgeRepository.findByCode(badgeCode).ifPresent(badge -> {
            if (!userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId())) {
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));
                
                UserBadge userBadge = UserBadge.builder()
                    .user(user)
                    .badge(badge)
                    .context("Automatically awarded")
                    .build();
                userBadgeRepository.save(userBadge);
                
                // Award badge points
                if (badge.getPointsValue() > 0) {
                    awardPoints(userId, badge.getPointsValue(), 
                        PointTransactionType.BADGE_EARNED,
                        "Badge earned: " + badge.getName(),
                        "BADGE", badge.getId());
                }
                
                log.info("User {} earned badge: {}", userId, badge.getName());
            }
        });
    }
    
    /**
     * Get user's gamification profile
     */
    @Transactional(readOnly = true)
    public GamificationProfile getUserProfile(Long userId) {
        UserPoints userPoints = userPointsRepository.findByUserId(userId)
            .orElse(null);
        
        if (userPoints == null) {
            return GamificationProfile.empty();
        }
        
        List<UserBadge> badges = userBadgeRepository.findByUserId(userId);
        long rank = userPointsRepository.getRankByPoints(userPoints.getTotalPoints());
        
        return GamificationProfile.builder()
            .totalPoints(userPoints.getTotalPoints())
            .level(userPoints.getLevel())
            .currentLevelPoints(userPoints.getCurrentLevelPoints())
            .pointsToNextLevel(userPoints.getPointsToNextLevel())
            .interviewsCompleted(userPoints.getInterviewsCompleted())
            .perfectScores(userPoints.getPerfectScores())
            .currentStreak(userPoints.getCurrentStreak())
            .longestStreak(userPoints.getLongestStreak())
            .rank(rank)
            .badges(badges)
            .build();
    }
    
    /**
     * Get leaderboard
     */
    @Transactional(readOnly = true)
    public List<LeaderboardEntry> getLeaderboard(int limit) {
        return userPointsRepository.findTopByOrderByTotalPointsDesc(PageRequest.of(0, limit))
            .stream()
            .map(up -> LeaderboardEntry.builder()
                .userId(up.getUser().getId())
                .userName(up.getUser().getFullName())
                .avatarUrl(up.getUser().getAvatarUrl())
                .totalPoints(up.getTotalPoints())
                .level(up.getLevel())
                .interviewsCompleted(up.getInterviewsCompleted())
                .build())
            .toList();
    }
    
    /**
     * Get company leaderboard
     */
    @Transactional(readOnly = true)
    public List<LeaderboardEntry> getCompanyLeaderboard(Long companyId, int limit) {
        return userPointsRepository.findTopByCompanyOrderByTotalPointsDesc(companyId, PageRequest.of(0, limit))
            .stream()
            .map(up -> LeaderboardEntry.builder()
                .userId(up.getUser().getId())
                .userName(up.getUser().getFullName())
                .avatarUrl(up.getUser().getAvatarUrl())
                .totalPoints(up.getTotalPoints())
                .level(up.getLevel())
                .interviewsCompleted(up.getInterviewsCompleted())
                .build())
            .toList();
    }
    
    private UserPoints createUserPoints(User user) {
        UserPoints userPoints = UserPoints.builder()
            .user(user)
            .totalPoints(0)
            .currentLevelPoints(0)
            .level(1)
            .interviewsCompleted(0)
            .perfectScores(0)
            .currentStreak(0)
            .longestStreak(0)
            .build();
        return userPointsRepository.save(userPoints);
    }
    
    // Inner classes for DTOs
    @lombok.Data
    @lombok.Builder
    public static class GamificationProfile {
        private Integer totalPoints;
        private Integer level;
        private Integer currentLevelPoints;
        private Integer pointsToNextLevel;
        private Integer interviewsCompleted;
        private Integer perfectScores;
        private Integer currentStreak;
        private Integer longestStreak;
        private Long rank;
        private List<UserBadge> badges;
        
        public static GamificationProfile empty() {
            return GamificationProfile.builder()
                .totalPoints(0)
                .level(1)
                .currentLevelPoints(0)
                .pointsToNextLevel(100)
                .interviewsCompleted(0)
                .perfectScores(0)
                .currentStreak(0)
                .longestStreak(0)
                .rank(0L)
                .badges(List.of())
                .build();
        }
    }
    
    @lombok.Data
    @lombok.Builder
    public static class LeaderboardEntry {
        private Long userId;
        private String userName;
        private String avatarUrl;
        private Integer totalPoints;
        private Integer level;
        private Integer interviewsCompleted;
    }
}
