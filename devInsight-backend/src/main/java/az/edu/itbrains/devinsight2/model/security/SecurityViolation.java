package az.edu.itbrains.devinsight2.model.security;

import az.edu.itbrains.devinsight2.model.user.User;
import az.edu.itbrains.devinsight2.model.interview.Interview;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "security_violations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityViolation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id")
    private Interview interview;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ViolationType type;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String details;

    @Column(name = "severity")
    @Enumerated(EnumType.STRING)
    private ViolationSeverity severity;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "screenshot_url")
    private String screenshotUrl;

    @Column(name = "video_timestamp")
    private Long videoTimestamp;

    @Column(name = "resolved")
    @Builder.Default
    private Boolean resolved = false;

    @Column(name = "hr_notified")
    @Builder.Default
    private Boolean hrNotified = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum ViolationType {
        TAB_SWITCH,
        WINDOW_BLUR,
        COPY_ATTEMPT,
        PASTE_ATTEMPT,
        CUT_ATTEMPT,
        RIGHT_CLICK,
        KEYBOARD_SHORTCUT,
        DEVTOOLS_ATTEMPT,
        DEVTOOLS_OPEN,
        INSPECT_ATTEMPT,
        FULLSCREEN_EXIT,
        FULLSCREEN_DENIED,
        CAMERA_DENIED,
        SCREEN_SHARE_STOPPED,
        MULTIPLE_FACES,
        NO_FACE_DETECTED,
        FACE_MISMATCH,
        AI_CONTENT_DETECTED,
        SUSPICIOUS_TYPING,
        BROWSER_EXTENSION_DETECTED
    }

    public enum ViolationSeverity {
        LOW,      // Warning level
        MEDIUM,   // Suspicious
        HIGH,     // Critical
        CRITICAL  // Auto-reject
    }
}
