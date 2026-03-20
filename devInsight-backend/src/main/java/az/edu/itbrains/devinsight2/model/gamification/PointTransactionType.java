package az.edu.itbrains.devinsight2.model.gamification;

public enum PointTransactionType {
    INTERVIEW_COMPLETED(100, "Completed an interview"),
    PERFECT_SCORE(200, "Achieved perfect score"),
    HIGH_SCORE(50, "Achieved high score (80%+)"),
    FIRST_INTERVIEW(150, "Completed first interview"),
    STREAK_BONUS(25, "Daily streak bonus"),
    BADGE_EARNED(0, "Badge earned bonus"),  // Points come from badge
    QUICK_COMPLETION(75, "Quick interview completion"),
    REFERRAL_BONUS(100, "Referral bonus"),
    ADMIN_ADJUSTMENT(0, "Admin adjustment");
    
    private final int defaultPoints;
    private final String description;
    
    PointTransactionType(int defaultPoints, String description) {
        this.defaultPoints = defaultPoints;
        this.description = description;
    }
    
    public int getDefaultPoints() {
        return defaultPoints;
    }
    
    public String getDescription() {
        return description;
    }
}
