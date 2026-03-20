package az.edu.itbrains.devinsight2.repository.question;

import az.edu.itbrains.devinsight2.model.question.QuestionFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionFeedbackRepository extends JpaRepository<QuestionFeedback, Long> {
    
    List<QuestionFeedback> findByInterviewFeedbackId(Long interviewFeedbackId);
    
    List<QuestionFeedback> findBySubmissionId(Long submissionId);
}
