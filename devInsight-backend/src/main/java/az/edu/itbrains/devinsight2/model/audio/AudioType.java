package az.edu.itbrains.devinsight2.model.audio;

public enum AudioType {
    QUESTION("AI-generated question audio"),
    ANSWER("User-recorded answer audio");

    private final String description;

    AudioType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
