package az.edu.itbrains.devinsight2.model.user;

import az.edu.itbrains.devinsight2.model.gamification.Badge;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Junction table for User-Badge relationship
 * Tracks when users earn badges
 */
@Entity
@Table(name = "user_badges", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "badge_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBadge {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "badge_id", nullable = false)
    private Badge badge;
    
    @Column(nullable = false)
    private LocalDateTime earnedAt;
    
    // Context about how the badge was earned
    @Column(columnDefinition = "TEXT")
    private String context;
    
    @PrePersist
    protected void onCreate() {
        earnedAt = LocalDateTime.now();
    }
}
