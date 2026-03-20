package az.edu.itbrains.devinsight2.model.audio;

// ===== SessionStatus =====
public enum SessionStatus {
    ACTIVE("Session is active"),
    PAUSED("Session is paused"),
    COMPLETED("Session completed successfully"),
    FAILED("Session failed"),
    CANCELLED("Session was cancelled");

    private final String description;

    SessionStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
