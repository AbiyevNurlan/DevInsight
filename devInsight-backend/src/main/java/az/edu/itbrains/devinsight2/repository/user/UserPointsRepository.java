package az.edu.itbrains.devinsight2.repository.user;

import az.edu.itbrains.devinsight2.model.user.UserPoints;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserPointsRepository extends JpaRepository<UserPoints, Long> {
    
    Optional<UserPoints> findByUserId(Long userId);
    
    @Query("SELECT up FROM UserPoints up ORDER BY up.totalPoints DESC")
    List<UserPoints> findTopByOrderByTotalPointsDesc(Pageable pageable);
    
    @Query("SELECT up FROM UserPoints up WHERE up.user.company.id = :companyId ORDER BY up.totalPoints DESC")
    List<UserPoints> findTopByCompanyOrderByTotalPointsDesc(@Param("companyId") Long companyId, Pageable pageable);
    
    @Query("SELECT COUNT(up) + 1 FROM UserPoints up WHERE up.totalPoints > :points")
    long getRankByPoints(@Param("points") Integer points);
    
    @Query("SELECT AVG(up.totalPoints) FROM UserPoints up")
    Double getAveragePoints();
}
