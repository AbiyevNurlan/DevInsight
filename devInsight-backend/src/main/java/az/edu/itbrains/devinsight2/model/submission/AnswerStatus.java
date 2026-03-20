package az.edu.itbrains.devinsight2.model.submission;

public enum AnswerStatus {
    CORRECT("Correct"),
    PARTIAL("Partially Correct"),
    INCORRECT("Incorrect"),
    PENDING("Pending Evaluation"),
    EVALUATED("Evaluated");

    private final String description;

    AnswerStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}