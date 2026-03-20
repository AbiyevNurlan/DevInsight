package az.edu.itbrains.devinsight2.repository.gamification;

import az.edu.itbrains.devinsight2.model.gamification.PointTransaction;
import az.edu.itbrains.devinsight2.model.gamification.PointTransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {
    
    Page<PointTransaction> findByUserId(Long userId, Pageable pageable);
    
    List<PointTransaction> findByUserIdAndType(Long userId, PointTransactionType type);
    
    @Query("SELECT SUM(pt.points) FROM PointTransaction pt WHERE pt.user.id = :userId AND pt.createdAt >= :since")
    Integer sumPointsSince(@Param("userId") Long userId, @Param("since") LocalDateTime since);
    
    @Query("SELECT pt FROM PointTransaction pt WHERE pt.user.id = :userId ORDER BY pt.createdAt DESC")
    List<PointTransaction> findRecentTransactions(@Param("userId") Long userId, Pageable pageable);
}
