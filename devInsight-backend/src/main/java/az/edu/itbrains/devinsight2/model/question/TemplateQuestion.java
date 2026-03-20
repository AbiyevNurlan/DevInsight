package az.edu.itbrains.devinsight2.model.question;

import az.edu.itbrains.devinsight2.model.interview.InterviewTemplate;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "template_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemplateQuestion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private InterviewTemplate template;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private QuestionBank question;
    
    @Column(nullable = false)
    private Integer questionOrder;
    
    @Column(nullable = false)
    private Integer maxScore;
    
    @Column
    private Integer timeLimitMinutes;
}
