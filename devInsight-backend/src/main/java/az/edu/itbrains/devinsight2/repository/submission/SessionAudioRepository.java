package az.edu.itbrains.devinsight2.repository.submission;

import az.edu.itbrains.devinsight2.model.audio.AudioType;
import az.edu.itbrains.devinsight2.model.audio.SessionAudio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionAudioRepository extends JpaRepository<SessionAudio, Long> {

    List<SessionAudio> findBySessionId(Long sessionId);

    List<SessionAudio> findByQuestionId(Long questionId);

    Optional<SessionAudio> findByQuestionIdAndAudioType(Long questionId, AudioType type);

    List<SessionAudio> findBySessionIdAndAudioType(Long sessionId, AudioType type);

    @Query("SELECT a FROM SessionAudio a WHERE a.processingStatus = 'FAILED'")
    List<SessionAudio> findFailedProcessing();

    @Query("SELECT a FROM SessionAudio a WHERE a.processingStatus = 'PENDING' ORDER BY a.createdAt ASC")
    List<SessionAudio> findPendingProcessing();
}