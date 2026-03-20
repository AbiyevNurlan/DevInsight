package az.edu.itbrains.devinsight2.repository.question;

import az.edu.itbrains.devinsight2.model.question.Question;
import az.edu.itbrains.devinsight2.model.question.QuestionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByType(QuestionType type);
    
    @Query("SELECT q FROM Question q LEFT JOIN FETCH q.createdBy WHERE q.createdBy.id = :userId")
    List<Question> findByCreatedById(@Param("userId") Long userId);
    
    @Query("SELECT q FROM Question q LEFT JOIN FETCH q.createdBy")
    List<Question> findAllWithCreatedBy();
    
    @Query("SELECT q FROM Question q LEFT JOIN FETCH q.createdBy WHERE q.id = :id")
    Optional<Question> findByIdWithCreatedBy(@Param("id") Long id);
}
