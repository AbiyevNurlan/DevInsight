package az.edu.itbrains.devinsight2.model.gamification;

public enum BadgeRarity {
    COMMON(1),
    RARE(2),
    EPIC(3),
    LEGENDARY(4);
    
    private final int level;
    
    BadgeRarity(int level) {
        this.level = level;
    }
    
    public int getLevel() {
        return level;
    }
}
