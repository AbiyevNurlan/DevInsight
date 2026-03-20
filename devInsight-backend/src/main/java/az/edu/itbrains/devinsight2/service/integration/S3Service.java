package az.edu.itbrains.devinsight2.service.integration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.audio-folder:audios}")
    private String audioFolder;

    @Value("${aws.s3.video-folder:videos}")
    private String videoFolder;

    @Value("${aws.s3.url-expiration:3600}")
    private Long urlExpirationSeconds;

    /**
     * Audio faylını S3'ə yüklə
     */
    public String uploadAudio(byte[] audioBytes, String fileName) {
        try {
            log.info("Uploading audio to S3: {}", fileName);

            if (audioBytes == null || audioBytes.length == 0) {
                throw new IllegalArgumentException("Audio bytes cannot be empty");
            }

            String key = audioFolder + "/" + UUID.randomUUID() + "_" + fileName;

            // Upload to S3
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType("audio/mp3")
                    .contentLength((long) audioBytes.length)
                    .build();

            s3Client.putObject(putObjectRequest,
                    RequestBody.fromBytes(audioBytes));

            log.info("Audio uploaded successfully to S3. Key: {}", key);

            // Generate presigned URL
            return generatePresignedUrl(key);

        } catch (Exception e) {
            log.error("Failed to upload audio to S3: ", e);
            throw new RuntimeException("S3 audio upload failed: " + e.getMessage());
        }
    }

    /**
     * Video faylını S3'ə yüklə
     */
    public String uploadVideo(byte[] videoBytes, String fileName) {
        try {
            log.info("Uploading video to S3: {}", fileName);

            if (videoBytes == null || videoBytes.length == 0) {
                throw new IllegalArgumentException("Video bytes cannot be empty");
            }

            String key = videoFolder + "/" + UUID.randomUUID() + "_" + fileName;

            // Upload to S3
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType("video/mp4")
                    .contentLength((long) videoBytes.length)
                    .build();

            s3Client.putObject(putObjectRequest,
                    RequestBody.fromBytes(videoBytes));

            log.info("Video uploaded successfully to S3. Key: {}", key);

            // Generate presigned URL
            return generatePresignedUrl(key);

        } catch (Exception e) {
            log.error("Failed to upload video to S3: ", e);
            throw new RuntimeException("S3 video upload failed: " + e.getMessage());
        }
    }

    /**
     * File'ı S3'ə yüklə (generic)
     */
    public String uploadFile(byte[] fileBytes, String fileName, String contentType, String folder) {
        try {
            log.info("Uploading file to S3: {}", fileName);

            if (fileBytes == null || fileBytes.length == 0) {
                throw new IllegalArgumentException("File bytes cannot be empty");
            }

            String key = folder + "/" + UUID.randomUUID() + "_" + fileName;

            // Upload to S3
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(contentType)
                    .contentLength((long) fileBytes.length)
                    .build();

            s3Client.putObject(putObjectRequest,
                    RequestBody.fromBytes(fileBytes));

            log.info("File uploaded successfully to S3. Key: {}", key);

            // Generate presigned URL
            return generatePresignedUrl(key);

        } catch (Exception e) {
            log.error("Failed to upload file to S3: ", e);
            throw new RuntimeException("S3 file upload failed: " + e.getMessage());
        }
    }

    /**
     * Presigned URL yaratdı (access üçün)
     */
    private String generatePresignedUrl(String key) {
        try {
            log.debug("Generating presigned URL for key: {}", key);

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofSeconds(urlExpirationSeconds))
                    .getObjectRequest(builder -> builder.bucket(bucketName).key(key))
                    .build();

            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
            String presignedUrl = presignedRequest.url().toString();

            log.debug("Presigned URL generated: {}", presignedUrl);

            return presignedUrl;

        } catch (Exception e) {
            log.error("Failed to generate presigned URL: ", e);
            throw new RuntimeException("Failed to generate presigned URL: " + e.getMessage());
        }
    }

    /**
     * S3'dən file'ı sil
     */
    public void deleteFile(String key) {
        try {
            log.info("Deleting file from S3: {}", key);

            s3Client.deleteObject(builder -> builder.bucket(bucketName).key(key));

            log.info("File deleted successfully from S3");

        } catch (Exception e) {
            log.error("Failed to delete file from S3: ", e);
            throw new RuntimeException("Failed to delete file: " + e.getMessage());
        }
    }

    /**
     * S3 connection test
     */
    public boolean testConnection() {
        try {
            log.info("Testing S3 connection");

            s3Client.headBucket(builder -> builder.bucket(bucketName));

            log.info("S3 connection successful");
            return true;

        } catch (Exception e) {
            log.error("S3 connection failed: ", e);
            return false;
        }
    }
}