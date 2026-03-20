package az.edu.itbrains.devinsight2.controller.question;

import az.edu.itbrains.devinsight2.dto.common.ApiResponse;
import az.edu.itbrains.devinsight2.dto.question.CreateQuestionRequest;
import az.edu.itbrains.devinsight2.dto.question.QuestionResponse;
import az.edu.itbrains.devinsight2.model.question.QuestionType;
import az.edu.itbrains.devinsight2.service.question.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/questions")
@RequiredArgsConstructor
@Slf4j
public class QuestionController {

    private final QuestionService questionService;

    /**
     * Create a new question - ADMIN, HR, and RECRUITER can create
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    public ResponseEntity<ApiResponse<QuestionResponse>> createQuestion(
            @Valid @RequestBody CreateQuestionRequest request
    ) {
        log.info("Creating new question: {}", request.getTitle());
        QuestionResponse question = questionService.createQuestion(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Question created successfully", question));
    }

    /**
     * Get all questions - All authenticated roles except CANDIDATE can access
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER', 'INTERVIEWER')")
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> getAllQuestions() {
        log.info("Fetching all questions");
        List<QuestionResponse> questions = questionService.getAllQuestions();
        return ResponseEntity.ok(ApiResponse.success(questions));
    }

    /**
     * Get question by ID - All authenticated roles except CANDIDATE can access
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER', 'INTERVIEWER')")
    public ResponseEntity<ApiResponse<QuestionResponse>> getQuestionById(@PathVariable Long id) {
        log.info("Fetching question with id: {}", id);
        QuestionResponse question = questionService.getQuestionById(id);
        return ResponseEntity.ok(ApiResponse.success(question));
    }

    /**
     * Update question - ADMIN, HR, and RECRUITER only
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    public ResponseEntity<ApiResponse<QuestionResponse>> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody CreateQuestionRequest request
    ) {
        log.info("Updating question with id: {}", id);
        QuestionResponse question = questionService.updateQuestion(id, request);
        return ResponseEntity.ok(ApiResponse.success("Question updated successfully", question));
    }

    /**
     * Delete question - ADMIN, HR, and RECRUITER only
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable Long id) {
        log.info("Deleting question with id: {}", id);
        questionService.deleteQuestion(id);
        return ResponseEntity.ok(ApiResponse.success("Question deleted successfully", null));
    }

    /**
     * Get questions by type - All authenticated roles except CANDIDATE can access
     */
    @GetMapping("/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER', 'INTERVIEWER')")
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> getQuestionsByType(
            @PathVariable QuestionType type
    ) {
        log.info("Fetching questions by type: {}", type);
        List<QuestionResponse> questions = questionService.getQuestionsByType(type);
        return ResponseEntity.ok(ApiResponse.success(questions));
    }
}
