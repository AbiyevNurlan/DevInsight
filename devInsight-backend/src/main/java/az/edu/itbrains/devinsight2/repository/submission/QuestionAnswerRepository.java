package az.edu.itbrains.devinsight2.repository.submission;

import az.edu.itbrains.devinsight2.model.submission.QuestionAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionAnswerRepository extends JpaRepository<QuestionAnswer, Long> {

    @Query("SELECT qa FROM QuestionAnswer qa LEFT JOIN FETCH qa.question WHERE qa.submission.id = :submissionId")
    List<QuestionAnswer> findBySubmissionId(@Param("submissionId") Long submissionId);

    @Query("SELECT qa FROM QuestionAnswer qa WHERE qa.submission.id = :submissionId AND qa.question.id = :questionId")
    Optional<QuestionAnswer> findBySubmissionAndQuestion(
            @Param("submissionId") Long submissionId,
            @Param("questionId") Long questionId
    );

    List<QuestionAnswer> findByQuestion_Id(@Param("id") Long questionId);
}
