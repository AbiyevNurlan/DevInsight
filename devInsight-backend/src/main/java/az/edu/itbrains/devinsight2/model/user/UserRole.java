package az.edu.itbrains.devinsight2.model.user;

/**
 * User roles in the DevInsight2 system
 * - ADMIN: System administrator with full access
 * - HR: Human Resources - manages interviews, questions, candidates
 * - RECRUITER: Recruiter - can create questions and manage interviews
 * - INTERVIEWER: Interviewer - can view questions and interview results
 * - CANDIDATE: Job candidates taking interviews
 */
public enum UserRole {
    CANDIDATE("Candidate", "Job candidate taking interviews"),
    HR("HR Manager", "Human Resources manager"),
    RECRUITER("Recruiter", "Recruiter - manages interview processes"),
    INTERVIEWER("Interviewer", "Interviewer - conducts and evaluates interviews"),
    ADMIN("Administrator", "System administrator");
    
    private final String displayName;
    private final String description;
    
    UserRole(String displayName, String description) {
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
