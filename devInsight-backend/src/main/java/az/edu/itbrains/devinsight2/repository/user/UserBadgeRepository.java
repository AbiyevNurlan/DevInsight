package az.edu.itbrains.devinsight2.repository.user;

import az.edu.itbrains.devinsight2.model.user.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    
    List<UserBadge> findByUserId(Long userId);
    
    Optional<UserBadge> findByUserIdAndBadgeId(Long userId, Long badgeId);
    
    boolean existsByUserIdAndBadgeId(Long userId, Long badgeId);
    
    @Query("SELECT COUNT(ub) FROM UserBadge ub WHERE ub.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT ub FROM UserBadge ub WHERE ub.user.id = :userId ORDER BY ub.earnedAt DESC")
    List<UserBadge> findRecentBadges(@Param("userId") Long userId);
}
