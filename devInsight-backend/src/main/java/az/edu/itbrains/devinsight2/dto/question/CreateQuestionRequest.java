package az.edu.itbrains.devinsight2.dto.question;

import az.edu.itbrains.devinsight2.model.question.QuestionDifficulty;
import az.edu.itbrains.devinsight2.model.question.QuestionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateQuestionRequest {

    @NotBlank(message = "Question title is required")
    private String title;

    @NotBlank(message = "Question description is required")
    private String description;

    @NotNull(message = "Question type is required")
    private QuestionType type; // CODING, BEHAVIORAL, MULTIPLE_CHOICE, SYSTEM_DESIGN

    private QuestionDifficulty difficulty; // EASY, MEDIUM, HARD

    private List<String> tags;

    // For CODING questions
    private String programmingLanguage;
    private String starterCode;
    private String solution;
    private String testCases;

    // For MULTIPLE_CHOICE questions
    private List<String> options;
    private String correctAnswer;

    // For BEHAVIORAL questions
    private String evaluationCriteria;

    // Scoring
    private Integer maxPoints;
    private Integer timeLimit; // in seconds

    // Interview association
    private Long interviewId;
}
