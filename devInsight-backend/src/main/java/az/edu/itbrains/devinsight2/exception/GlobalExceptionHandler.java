package az.edu.itbrains.devinsight2.exception;

import org.hibernate.LazyInitializationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import az.edu.itbrains.devinsight2.dto.common.ErrorResponse;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Handle validation errors from @Valid annotation
     * Returns 400 Bad Request with field-level error details
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex, WebRequest request
    ) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.put(error.getField(), error.getDefaultMessage())
        );

        String path = request.getDescription(false).replace("uri=", "");
        
        ErrorResponse response = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Failed")
                .errorCode(ErrorCode.VALIDATION_ERROR.getCode())
                .message("Input validation failed")
                .userMessage("Please check your input and correct the highlighted fields.")
                .fieldErrors(fieldErrors)
                .path(path)
                .build();

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, WebRequest request
    ) {
        String path = request.getDescription(false).replace("uri=", "");
        
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("Not Found")
                .errorCode(ErrorCode.RESOURCE_NOT_FOUND.getCode())
                .message(ex.getMessage())
                .userMessage("The requested information could not be found. It may have been moved or deleted.")
                .path(path)
                .build();

        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(
            BadRequestException ex, WebRequest request
    ) {
        String path = request.getDescription(false).replace("uri=", "");
        
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .errorCode(ErrorCode.VALIDATION_ERROR.getCode())
                .message(ex.getMessage())
                .userMessage("There was a problem with your request. Please check your input and try again.")
                .path(path)
                .build();

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(
            UnauthorizedException ex, WebRequest request
    ) {
        String path = request.getDescription(false).replace("uri=", "");
        
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .error("Unauthorized")
                .errorCode(ErrorCode.UNAUTHORIZED.getCode())
                .message(ex.getMessage())
                .userMessage("Please log in to access this resource.")
                .path(path)
                .build();

        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Handle LazyInitializationException - occurs when trying to access lazy-loaded
     * collections outside of a Hibernate session (e.g., during JSON serialization).
     * This is a programming error but we return a user-friendly message.
     */
    @ExceptionHandler(LazyInitializationException.class)
    public ResponseEntity<ErrorResponse> handleLazyInitializationException(
            LazyInitializationException ex, WebRequest request
    ) {
        String traceId = UUID.randomUUID().toString().substring(0, 8);
        String path = request.getDescription(false).replace("uri=", "");
        
        // Log the full technical details for debugging
        log.error("LazyInitializationException [traceId={}] at path {}: {}", 
                traceId, path, ex.getMessage(), ex);

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Data Loading Error")
                .errorCode(ErrorCode.DATA_LOAD_ERROR.getCode())
                .message("Failed to load associated data: " + ex.getMessage())
                .userMessage("We're having trouble loading some information. Please refresh the page and try again.")
                .path(path)
                .traceId(traceId)
                .build();

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle all other uncaught exceptions.
     * Logs the full error but returns a safe, user-friendly message.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(
            Exception ex, WebRequest request
    ) {
        String traceId = UUID.randomUUID().toString().substring(0, 8);
        String path = request.getDescription(false).replace("uri=", "");
        
        // Log the full error with trace ID for debugging
        log.error("Unhandled exception [traceId={}] at path {}: {}", 
                traceId, path, ex.getMessage(), ex);

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .errorCode(ErrorCode.INTERNAL_ERROR.getCode())
                .message(ex.getMessage())
                .userMessage("Something went wrong on our end. Please try again later. If the problem persists, contact support with reference: " + traceId)
                .path(path)
                .traceId(traceId)
                .build();

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
