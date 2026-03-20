package az.edu.itbrains.devinsight2.repository.audit;

import az.edu.itbrains.devinsight2.model.core.Analysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnalysisRepository extends JpaRepository<Analysis , Long> {
    Optional<Analysis> findBySubmissionId(Long submissionId);
}
