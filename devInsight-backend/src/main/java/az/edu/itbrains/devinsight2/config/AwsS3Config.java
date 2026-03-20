package az.edu.itbrains.devinsight2.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

    @Configuration
    @RequiredArgsConstructor
    @Slf4j
public class AwsS3Config {

    @Value("${aws.credentials.access-key}")
    private String accessKey;

    @Value("${aws.credentials.secret-key}")
    private String secretKey;

    @Value("${aws.region:us-east-1}")
    private String region;


    @Bean
    public S3Client s3Client() {
        try {
            log.info("Initializing S3Client with region: {}", region);


            if (accessKey == null || accessKey.isEmpty() ||
                    secretKey == null || secretKey.isEmpty()) {
                log.warn("AWS credentials not configured. S3 operations may fail.");

                return S3Client.builder()
                        .region(Region.of(region))
                        .build();
            }

            AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(
                    accessKey,
                    secretKey
            );

            S3Client s3Client = S3Client.builder()
                    .region(Region.of(region))
                    .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                    .build();

            log.info("S3Client initialized successfully");

            return s3Client;

        } catch (Exception e) {
            log.error("Failed to initialize S3Client: ", e);
            throw new RuntimeException("S3Client initialization failed: " + e.getMessage());
        }
    }

    @Bean
    public S3Presigner s3Presigner() {
        try {
            log.info("Initializing S3Presigner");


            if (accessKey == null || accessKey.isEmpty() ||
                    secretKey == null || secretKey.isEmpty()) {
                log.warn("AWS credentials not configured. Presigner may fail.");
                // Return default presigner for development
                return S3Presigner.builder()
                        .region(Region.of(region))
                        .build();
            }


            AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(
                    accessKey,
                    secretKey
            );

            S3Presigner s3Presigner = S3Presigner.builder()
                    .region(Region.of(region))
                    .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                    .build();

            log.info("S3Presigner initialized successfully");

            return s3Presigner;

        } catch (Exception e) {
            log.error("Failed to initialize S3Presigner: ", e);
            throw new RuntimeException("S3Presigner initialization failed: " + e.getMessage());
        }
    }
}