package az.edu.itbrains.devinsight2.dto.common;

import az.edu.itbrains.devinsight2.exception.ErrorCode;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standardized error response for API errors.
 * Provides both technical details (for logging) and user-friendly messages (for UI).
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    
    /** HTTP status code */
    private int status;
    
    /** HTTP status text (e.g., "Not Found", "Internal Server Error") */
    private String error;
    
    /** Technical error message (for developers/logging) */
    private String message;
    
    /** Machine-readable error code for frontend mapping */
    private String errorCode;
    
    /** User-friendly message suitable for display in UI */
    private String userMessage;
    
    /** Request path that caused the error */
    private String path;
    
    /** Unique trace ID for support/debugging (optional) */
    private String traceId;
    
    /** Field-level validation errors (optional) */
    private Map<String, String> fieldErrors;
    
    /**
     * Create ErrorResponse from ErrorCode enum
     */
    public static ErrorResponse of(int status, String error, ErrorCode errorCode, String path) {
        return ErrorResponse.builder()
                .status(status)
                .error(error)
                .errorCode(errorCode.getCode())
                .message(errorCode.getDefaultMessage())
                .userMessage(errorCode.getDefaultMessage())
                .path(path)
                .build();
    }
    
    /**
     * Create ErrorResponse with custom messages
     */
    public static ErrorResponse of(int status, String error, ErrorCode errorCode, 
                                   String technicalMessage, String userMessage, String path) {
        return ErrorResponse.builder()
                .status(status)
                .error(error)
                .errorCode(errorCode.getCode())
                .message(technicalMessage)
                .userMessage(userMessage)
                .path(path)
                .build();
    }
}
