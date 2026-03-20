package az.edu.itbrains.devinsight2.model.gamification;

import az.edu.itbrains.devinsight2.model.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Track point transactions for audit and history
 */
@Entity
@Table(name = "point_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private Integer points;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PointTransactionType type;
    
    @Column(nullable = false)
    private String reason;
    
    // Reference to related entity (interview, submission, etc.)
    private String referenceType;
    private Long referenceId;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
