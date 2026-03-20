package az.edu.itbrains.devinsight2.repository.chat;

import az.edu.itbrains.devinsight2.model.chat.ChatMessage;
import az.edu.itbrains.devinsight2.model.chat.MessageType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    /**
     * Find all messages for a conversation ordered by timestamp
     */
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.conversation.id = :conversationId ORDER BY cm.timestamp ASC")
    List<ChatMessage> findByConversationIdOrderByTimestampAsc(@Param("conversationId") Long conversationId);
    
    /**
     * Find messages by type for a conversation
     */
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.conversation.id = :conversationId AND cm.type = :messageType ORDER BY cm.timestamp ASC")
    List<ChatMessage> findByConversationIdAndType(@Param("conversationId") Long conversationId, @Param("messageType") MessageType messageType);
    
    /**
     * Get latest messages for a conversation (for pagination)
     */
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.conversation.id = :conversationId ORDER BY cm.timestamp DESC")
    List<ChatMessage> findLatestMessagesByConversationId(@Param("conversationId") Long conversationId);
    
    /**
     * Count messages in a conversation
     */
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.conversation.id = :conversationId")
    Long countByConversationId(@Param("conversationId") Long conversationId);
    
    /**
     * Count user messages in a conversation
     */
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.conversation.id = :conversationId AND cm.type = 'USER'")
    Long countUserMessagesByConversationId(@Param("conversationId") Long conversationId);
}