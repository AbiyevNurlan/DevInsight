package az.edu.itbrains.devinsight2.cv.repository;

import az.edu.itbrains.devinsight2.cv.entity.CandidateCV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CandidateCVRepository extends JpaRepository<CandidateCV, Long> {
    
    Optional<CandidateCV> findByUserId(Long userId);
    
    boolean existsByUserId(Long userId);
    
    void deleteByUserId(Long userId);
}
