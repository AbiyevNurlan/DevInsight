package az.edu.itbrains.devinsight2.repository.interview;

import az.edu.itbrains.devinsight2.model.question.TemplateQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TemplateQuestionRepository extends JpaRepository<TemplateQuestion, Long> {
    
    @Query("SELECT tq FROM TemplateQuestion tq WHERE tq.template.id = ?1 ORDER BY tq.questionOrder ASC")
    List<TemplateQuestion> findByTemplateId(Long templateId);
    
    @Query("SELECT COUNT(tq) FROM TemplateQuestion tq WHERE tq.template.id = ?1")
    Integer countByTemplateId(Long templateId);
}
