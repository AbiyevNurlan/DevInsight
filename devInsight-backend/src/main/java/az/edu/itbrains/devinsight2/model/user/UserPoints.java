package az.edu.itbrains.devinsight2.model.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Track user points for gamification
 */
@Entity
@Table(name = "user_points")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPoints {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer totalPoints = 0;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer currentLevelPoints = 0;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer level = 1;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer interviewsCompleted = 0;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer perfectScores = 0;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer currentStreak = 0;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer longestStreak = 0;
    
    private LocalDateTime lastActivityDate;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Calculate level based on points
    public void recalculateLevel() {
        // Level formula: Level = floor(sqrt(totalPoints / 100)) + 1
        this.level = (int) Math.floor(Math.sqrt(totalPoints / 100.0)) + 1;
        // Points needed for next level
        int pointsForCurrentLevel = (level - 1) * (level - 1) * 100;
        this.currentLevelPoints = totalPoints - pointsForCurrentLevel;
    }
    
    public int getPointsToNextLevel() {
        int nextLevelPoints = level * level * 100;
        int currentLevelStart = (level - 1) * (level - 1) * 100;
        return nextLevelPoints - currentLevelStart - currentLevelPoints;
    }
}
