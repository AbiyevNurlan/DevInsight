package az.edu.itbrains.devinsight2.repository.question;

import az.edu.itbrains.devinsight2.model.question.QuestionBank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionBankRepository extends JpaRepository<QuestionBank, Long> {
    
    @Query("SELECT qb FROM QuestionBank qb WHERE qb.companyId = ?#{T(az.edu.itbrains.devinsight2.config.TenantContext).getCurrentTenant()} ORDER BY qb.rating DESC NULLS LAST")
    List<QuestionBank> findAll();
    
    @Query("SELECT qb FROM QuestionBank qb WHERE qb.companyId = ?#{T(az.edu.itbrains.devinsight2.config.TenantContext).getCurrentTenant()} AND qb.id = ?1")
    Optional<QuestionBank> findById(Long id);
    
    @Query("SELECT qb FROM QuestionBank qb WHERE qb.companyId = ?#{T(az.edu.itbrains.devinsight2.config.TenantContext).getCurrentTenant()} AND qb.category = ?1")
    List<QuestionBank> findByCategory(String category);
    
    @Query("SELECT qb FROM QuestionBank qb WHERE qb.companyId = ?#{T(az.edu.itbrains.devinsight2.config.TenantContext).getCurrentTenant()} AND LOWER(qb.questionText) LIKE LOWER(CONCAT('%', ?1, '%'))")
    List<QuestionBank> searchByText(String query);
    
    @Query("SELECT qb FROM QuestionBank qb WHERE qb.companyId = ?#{T(az.edu.itbrains.devinsight2.config.TenantContext).getCurrentTenant()} AND qb.difficulty = ?1 ORDER BY qb.createdAt DESC")
    List<QuestionBank> findByDifficulty(String difficulty);
    
    @Query("SELECT qb FROM QuestionBank qb WHERE qb.companyId = ?#{T(az.edu.itbrains.devinsight2.config.TenantContext).getCurrentTenant()} AND qb.subcategory = ?1")
    List<QuestionBank> findBySubcategory(String subcategory);
}
