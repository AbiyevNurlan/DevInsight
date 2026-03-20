package az.edu.itbrains.devinsight2.model.core;

public enum FeedbackRecommendation {
    STRONG_HIRE("Strong Hire", "Highly recommended for the position"),
    HIRE("Hire", "Recommended for the position"),
    LEAN_HIRE("Lean Hire", "Slightly positive, may need more evaluation"),
    LEAN_NO_HIRE("Lean No Hire", "Slightly negative, concerns exist"),
    NO_HIRE("No Hire", "Not recommended for the position"),
    STRONG_NO_HIRE("Strong No Hire", "Definitely not recommended");
    
    private final String displayName;
    private final String description;
    
    FeedbackRecommendation(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
}
