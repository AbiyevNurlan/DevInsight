package az.edu.itbrains.devinsight2.model.interview;

import az.edu.itbrains.devinsight2.model.core.BaseEntity;
import az.edu.itbrains.devinsight2.model.question.TemplateQuestion;
import az.edu.itbrains.devinsight2.model.user.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interview_templates")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewTemplate extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private String difficulty;  // EASY, MEDIUM, HARD
    
    private String category;  // Frontend, Backend, Full-stack, DevOps, etc.
    
    @Column(nullable = false)
    private Integer totalDurationMinutes;
    
    @Column(nullable = false)
    private Integer maxScore;
    
    @Column(columnDefinition = "TEXT[]")
    private String[] tags;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;
    
    @Builder.Default
    private Integer usageCount = 0;
    
    private java.time.LocalDateTime lastUsedDate;
    
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    @JsonIgnore
    private User createdBy;
    
    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonIgnore
    private List<TemplateQuestion> questions = new ArrayList<>();
}
