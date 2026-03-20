package az.edu.itbrains.devinsight2.model.submission;

public enum SubmissionStatus {
    DRAFT("Draft"),
    SUBMITTED("Submitted"),
    EVALUATED("Evaluated"),
    IN_PROGRESS("In Progress"),
    ANALYZING("Analyzing"),
    ANALYZED("Analyzed"),
    FAILED("Failed");

    private final String label;

    SubmissionStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
