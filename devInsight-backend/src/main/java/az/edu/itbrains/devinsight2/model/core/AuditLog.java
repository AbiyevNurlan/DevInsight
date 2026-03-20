package az.edu.itbrains.devinsight2.model.core;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String entityType; // USER, INTERVIEW, COMPANY, SUBMISSION

    @Column(nullable = false)
    private Long entityId;

    @Column(nullable = false)
    private String action; // CREATE, UPDATE, DELETE

    @Column(columnDefinition = "TEXT")
    private String oldValue; // JSON of old state

    @Column(columnDefinition = "TEXT")
    private String newValue; // JSON of new state

    @Column(nullable = false)
    private String performedBy; // Email of user who made the change

    private String ipAddress;

    @Column(nullable = false)
    private LocalDateTime performedAt;

    @PrePersist
    protected void onCreate() {
        performedAt = LocalDateTime.now();
    }
}
