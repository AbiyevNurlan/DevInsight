package az.edu.itbrains.devinsight2.exception;

/**
 * Standardized error codes for API responses.
 * These codes allow the frontend to display appropriate user-friendly messages.
 */
public enum ErrorCode {
    
    // General errors (1xxx)
    INTERNAL_ERROR("ERR_1000", "An unexpected error occurred"),
    DATA_LOAD_ERROR("ERR_1001", "Unable to load data"),
    DATA_SAVE_ERROR("ERR_1002", "Unable to save data"),
    SERVICE_UNAVAILABLE("ERR_1003", "Service temporarily unavailable"),
    
    // Authentication errors (2xxx)
    UNAUTHORIZED("ERR_2001", "Authentication required"),
    SESSION_EXPIRED("ERR_2002", "Your session has expired"),
    INVALID_CREDENTIALS("ERR_2003", "Invalid email or password"),
    ACCESS_DENIED("ERR_2004", "You don't have permission to access this resource"),
    
    // Validation errors (3xxx)
    VALIDATION_ERROR("ERR_3001", "Please check your input"),
    INVALID_FORMAT("ERR_3002", "Invalid data format"),
    MISSING_REQUIRED_FIELD("ERR_3003", "Required field is missing"),
    
    // Resource errors (4xxx)
    RESOURCE_NOT_FOUND("ERR_4001", "The requested resource was not found"),
    CANDIDATE_NOT_FOUND("ERR_4002", "Candidate not found"),
    INTERVIEW_NOT_FOUND("ERR_4003", "Interview not found"),
    SUBMISSION_NOT_FOUND("ERR_4004", "Submission not found"),
    USER_NOT_FOUND("ERR_4005", "User not found"),
    
    // Business logic errors (5xxx)
    DUPLICATE_ENTRY("ERR_5001", "This record already exists"),
    OPERATION_NOT_ALLOWED("ERR_5002", "This operation is not allowed"),
    INTERVIEW_EXPIRED("ERR_5003", "Interview session has expired"),
    SUBMISSION_ALREADY_COMPLETED("ERR_5004", "Submission has already been completed");

    private final String code;
    private final String defaultMessage;

    ErrorCode(String code, String defaultMessage) {
        this.code = code;
        this.defaultMessage = defaultMessage;
    }

    public String getCode() {
        return code;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}
