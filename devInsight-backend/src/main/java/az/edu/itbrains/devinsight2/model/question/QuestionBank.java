package az.edu.itbrains.devinsight2.model.question;

import az.edu.itbrains.devinsight2.model.core.BaseEntity;
import az.edu.itbrains.devinsight2.model.user.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "question_bank")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionBank extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String category;  // BEHAVIORAL, TECHNICAL, CASE_STUDY, SITUATIONAL
    
    @Column(nullable = false)
    private String subcategory;  // Java, Python, Leadership
    
    @Column(nullable = false)
    private String difficulty;  // EASY, MEDIUM, HARD
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String questionText;
    
    @Column(columnDefinition = "TEXT")
    private String expectedKeywords;
    
    @Column
    private Integer suggestedDurationMinutes;
    
    @Column(columnDefinition = "TEXT[]")
    private String[] tags;
    
    @Column
    private BigDecimal rating;  // 1-5
    
    @Column(nullable = false)
    private Integer usageCount;
    
    @Column(name = "company_id", nullable = false)
    private Long companyId;
    
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    @JsonIgnoreProperties({"password", "submissions", "authorities", "hibernateLazyInitializer", "handler"})
    private User createdBy;
}
