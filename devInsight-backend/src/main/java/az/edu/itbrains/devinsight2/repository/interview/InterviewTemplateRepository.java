package az.edu.itbrains.devinsight2.repository.interview;

import az.edu.itbrains.devinsight2.model.interview.InterviewTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewTemplateRepository extends JpaRepository<InterviewTemplate, Long> {
    
    @Query("SELECT it FROM InterviewTemplate it WHERE it.companyId = ?#{T(az.edu.itbrains.devinsight2.config.TenantContext).getCurrentTenant()} ORDER BY it.createdAt DESC")
    List<InterviewTemplate> findAll();
    
    @Query("SELECT it FROM InterviewTemplate it WHERE it.companyId = ?#{T(az.edu.itbrains.devinsight2.config.TenantContext).getCurrentTenant()} AND it.id = ?1")
    Optional<InterviewTemplate> findById(Long id);
    
    @Query("SELECT it FROM InterviewTemplate it WHERE it.companyId = ?#{T(az.edu.itbrains.devinsight2.config.TenantContext).getCurrentTenant()} AND it.name = ?1")
    Optional<InterviewTemplate> findByName(String name);
    
    @Query("SELECT it FROM InterviewTemplate it WHERE it.companyId = ?#{T(az.edu.itbrains.devinsight2.config.TenantContext).getCurrentTenant()} AND it.difficulty = ?1")
    List<InterviewTemplate> findByDifficulty(String difficulty);
    
    @Query("SELECT it FROM InterviewTemplate it WHERE it.companyId = ?#{T(az.edu.itbrains.devinsight2.config.TenantContext).getCurrentTenant()} AND it.isActive = true")
    List<InterviewTemplate> findAllActive();
}
