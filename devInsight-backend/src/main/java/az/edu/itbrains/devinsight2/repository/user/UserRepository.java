package az.edu.itbrains.devinsight2.repository.user;

import az.edu.itbrains.devinsight2.model.user.User;
import az.edu.itbrains.devinsight2.model.user.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByEmailAndRole(String email, UserRole role);
    
    // Find users by role with pagination (without skills - use for listings where skills not needed)
    Page<User> findByRole(UserRole role, Pageable pageable);
    
    /**
     * Find users by role with skills eagerly loaded.
     * Uses @EntityGraph to avoid N+1 queries and ensure skills are loaded within transaction.
     * Note: For pagination with collections, we fetch IDs first then load with skills.
     */
    @EntityGraph(attributePaths = {"skills", "company"})
    @Query("SELECT u FROM User u WHERE u.role = :role")
    List<User> findByRoleWithSkills(@Param("role") UserRole role);
    
    /**
     * Count users by role (for pagination metadata)
     */
    long countByRole(UserRole role);
    
    /**
     * Find users by role with skills using paginated IDs.
     * This approach avoids Hibernate's pagination warning with FETCH JOIN on collections.
     */
    @EntityGraph(attributePaths = {"skills", "company"})
    @Query("SELECT u FROM User u WHERE u.id IN :ids")
    List<User> findByIdsWithSkills(@Param("ids") List<Long> ids);
    
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.skills WHERE u.email = :email")
    Optional<User> findByEmailWithSkills(@Param("email") String email);
    
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.skills LEFT JOIN FETCH u.company WHERE u.id = :id")
    Optional<User> findByIdWithSkills(@Param("id") Long id);
}