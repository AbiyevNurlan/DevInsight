package az.edu.itbrains.devinsight2.repository.interview;

import az.edu.itbrains.devinsight2.model.interview.Interview;
import az.edu.itbrains.devinsight2.model.interview.InterviewStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    
    // Fetch with eager loading to prevent LazyInitializationException
    @Query("SELECT DISTINCT i FROM Interview i LEFT JOIN FETCH i.company LEFT JOIN FETCH i.createdBy LEFT JOIN FETCH i.questions")
    List<Interview> findAllWithCompanyAndCreator();
    
    @Query("SELECT i FROM Interview i LEFT JOIN FETCH i.company LEFT JOIN FETCH i.createdBy LEFT JOIN FETCH i.questions WHERE i.id = :id")
    Optional<Interview> findByIdWithCompanyAndCreator(@Param("id") Long id);
    
    @Query("SELECT DISTINCT i FROM Interview i LEFT JOIN FETCH i.company LEFT JOIN FETCH i.createdBy LEFT JOIN FETCH i.questions WHERE i.status = :status")
    List<Interview> findByStatusWithCompany(@Param("status") InterviewStatus status);
    
    @Query("SELECT DISTINCT i FROM Interview i LEFT JOIN FETCH i.company LEFT JOIN FETCH i.createdBy LEFT JOIN FETCH i.questions WHERE i.isPublic = true")
    List<Interview> findByIsPublicTrueWithCompany();
    
    @Query("SELECT DISTINCT i FROM Interview i LEFT JOIN FETCH i.company LEFT JOIN FETCH i.createdBy LEFT JOIN FETCH i.questions WHERE i.company.id = :companyId")
    List<Interview> findByCompanyIdWithCompany(@Param("companyId") Long companyId);
    
    // Fetch interview with questions only (lighter query)
    @Query("SELECT i FROM Interview i LEFT JOIN FETCH i.questions WHERE i.id = :id")
    Optional<Interview> findByIdWithQuestions(@Param("id") Long id);
    
    @Query("SELECT DISTINCT i FROM Interview i LEFT JOIN FETCH i.questions")
    List<Interview> findAllWithQuestions();
    
    // Original methods for backward compatibility
    List<Interview> findByStatus(InterviewStatus status);
    List<Interview> findByIsPublicTrue();
    List<Interview> findByCompanyId(Long companyId);
    
    // Dashboard statistics queries
    long countByStatus(InterviewStatus status);
    
    @Query("SELECT i FROM Interview i LEFT JOIN FETCH i.company WHERE i.status = :status ORDER BY i.createdAt DESC")
    List<Interview> findRecentByStatus(@Param("status") InterviewStatus status, Pageable pageable);
    
    @Query("SELECT i FROM Interview i LEFT JOIN FETCH i.company ORDER BY i.createdAt DESC")
    List<Interview> findRecentInterviews(Pageable pageable);
}