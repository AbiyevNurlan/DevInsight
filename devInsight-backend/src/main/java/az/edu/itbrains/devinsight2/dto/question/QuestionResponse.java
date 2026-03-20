package az.edu.itbrains.devinsight2.dto.question;

import az.edu.itbrains.devinsight2.model.question.QuestionDifficulty;
import az.edu.itbrains.devinsight2.model.question.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionResponse {

    private Long id;
    private String title;
    private String description;
    private QuestionType type;
    private QuestionDifficulty difficulty;
    private List<String> tags;
    
    // For CODING questions
    private String programmingLanguage;
    private String starterCode;
    
    // For MULTIPLE_CHOICE questions
    private List<String> options;
    private String correctAnswer;
    
    // For BEHAVIORAL questions
    private String evaluationCriteria;
    
    private Integer maxPoints;
    private Integer timeLimit;
    
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
