package az.edu.itbrains.devinsight2.repository.chat;

import az.edu.itbrains.devinsight2.model.chat.ChatConversation;
import az.edu.itbrains.devinsight2.model.chat.ChatStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {
    
    /**
     * Find conversation by candidate and interview
     */
    @Query("SELECT cc FROM ChatConversation cc WHERE cc.candidate.id = :candidateId AND cc.interview.id = :interviewId")
    Optional<ChatConversation> findByCandidateAndInterview(@Param("candidateId") Long candidateId, @Param("interviewId") Long interviewId);
    
    /**
     * Find all conversations for a candidate
     */
    @Query("SELECT cc FROM ChatConversation cc WHERE cc.candidate.id = :candidateId ORDER BY cc.createdAt DESC")
    List<ChatConversation> findByCandidateIdOrderByCreatedAtDesc(@Param("candidateId") Long candidateId);
    
    /**
     * Find active conversations for a candidate
     */
    @Query("SELECT cc FROM ChatConversation cc WHERE cc.candidate.id = :candidateId AND cc.status = :status ORDER BY cc.createdAt DESC")
    List<ChatConversation> findByCandidateIdAndStatus(@Param("candidateId") Long candidateId, @Param("status") ChatStatus status);
    
    /**
     * Find conversations for an interview (for HR to review)
     */
    @Query("SELECT cc FROM ChatConversation cc WHERE cc.interview.id = :interviewId ORDER BY cc.createdAt DESC")
    List<ChatConversation> findByInterviewIdOrderByCreatedAtDesc(@Param("interviewId") Long interviewId);
    
    /**
     * Check if conversation already exists for candidate and interview
     */
    @Query("SELECT COUNT(cc) > 0 FROM ChatConversation cc WHERE cc.candidate.id = :candidateId AND cc.interview.id = :interviewId")
    boolean existsByCandidateAndInterview(@Param("candidateId") Long candidateId, @Param("interviewId") Long interviewId);
}