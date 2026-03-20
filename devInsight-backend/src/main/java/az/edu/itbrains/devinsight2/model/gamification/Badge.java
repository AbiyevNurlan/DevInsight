package az.edu.itbrains.devinsight2.model.gamification;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Badge model for gamification system
 * Candidates earn badges based on achievements
 */
@Entity
@Table(name = "badges")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String code;  // FIRST_INTERVIEW, PERFECT_SCORE, SPEED_DEMON, etc.
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private String iconUrl;
    
    @Column(nullable = false)
    private Integer pointsValue;  // Points awarded when badge is earned
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BadgeCategory category;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BadgeRarity rarity;  // COMMON, RARE, EPIC, LEGENDARY
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;
    
    // Criteria for earning this badge (JSON format)
    @Column(columnDefinition = "TEXT")
    private String criteria;
    
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
