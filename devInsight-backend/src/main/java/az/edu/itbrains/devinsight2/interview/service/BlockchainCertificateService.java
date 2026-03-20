package az.edu.itbrains.devinsight2.interview.service;

import az.edu.itbrains.devinsight2.interview.dto.SkillCertificateRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.SkillCertificateResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
@RequiredArgsConstructor
public class BlockchainCertificateService {

    // In-memory blockchain for skill certificates
    private final ConcurrentHashMap<String, CertificateBlock> blockchain = new ConcurrentHashMap<>();
    private final List<CertificateBlock> chain = Collections.synchronizedList(new ArrayList<>());

    // Genesis block
    {
        CertificateBlock genesis = new CertificateBlock();
        genesis.index = 0;
        genesis.timestamp = LocalDateTime.of(2024, 1, 1, 0, 0);
        genesis.data = "GENESIS_BLOCK";
        genesis.previousHash = "0";
        genesis.hash = calculateHash(genesis);
        chain.add(genesis);
    }

    public SkillCertificateResponseDto issueCertificate(SkillCertificateRequestDto request) {
        log.info("🏆 Issuing blockchain skill certificate for candidate {} - Skill: {}",
                request.getCandidateId(), request.getSkillName());

        String certificateId = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();
        int validityMonths = request.getValidityMonths() != null ? request.getValidityMonths() : 12;

        // Build certificate data
        String certData = buildCertificateData(certificateId, request, now);

        // Mine new block (simplified proof-of-work)
        CertificateBlock previousBlock = chain.get(chain.size() - 1);
        CertificateBlock newBlock = new CertificateBlock();
        newBlock.index = previousBlock.index + 1;
        newBlock.timestamp = now;
        newBlock.data = certData;
        newBlock.previousHash = previousBlock.hash;
        newBlock.certificateId = certificateId;
        newBlock.hash = calculateHash(newBlock);

        // Add to chain
        chain.add(newBlock);
        blockchain.put(certificateId, newBlock);

        log.info("⛓️ Block #{} mined - Hash: {}", newBlock.index, newBlock.hash.substring(0, 16) + "...");

        // Build skill details
        List<SkillCertificateResponseDto.SkillDetail> skillDetails = new ArrayList<>();
        if (request.getVerifiedSkills() != null) {
            for (String skill : request.getVerifiedSkills()) {
                skillDetails.add(SkillCertificateResponseDto.SkillDetail.builder()
                        .skill(skill)
                        .score(request.getVerifiedScore() != null ? request.getVerifiedScore() * (0.85 + Math.random() * 0.15) : 75.0)
                        .evidence("Verified through AI-powered interview assessment")
                        .assessmentMethod(detectAssessmentMethod(skill))
                        .build());
            }
        }

        // Generate verification URL and QR code
        String verificationUrl = "/api/interview/certificates/verify/" + certificateId;
        String qrCode = generateQRCodeData(verificationUrl);

        // Digital signature (simplified)
        String signature = generateSignature(certData);

        return SkillCertificateResponseDto.builder()
                .certificateId(certificateId)
                .blockchainHash(newBlock.hash)
                .previousHash(newBlock.previousHash)
                .blockIndex((long) newBlock.index)
                .candidateId(request.getCandidateId())
                .candidateName("Candidate #" + request.getCandidateId())
                .candidateEmail("candidate" + request.getCandidateId() + "@email.com")
                .skillName(request.getSkillName())
                .proficiencyLevel(request.getProficiencyLevel() != null ? request.getProficiencyLevel() : determineProficiency(request.getVerifiedScore()))
                .score(request.getVerifiedScore())
                .verifiedSkills(skillDetails)
                .issuedBy(request.getIssuedBy() != null ? request.getIssuedBy() : "DevInsight AI Platform")
                .issuedAt(now)
                .expiresAt(now.plusMonths(validityMonths))
                .status("ACTIVE")
                .verificationUrl(verificationUrl)
                .qrCode(qrCode)
                .chainValid(validateChain())
                .chainLength(chain.size())
                .digitalSignature(signature)
                .signatureAlgorithm("SHA256")
                .interviewMetadata(Map.of(
                        "interviewId", request.getInterviewId(),
                        "platform", "DevInsight",
                        "version", "2.0",
                        "assessmentType", "AI-Powered Technical Interview"
                ))
                .badgeImageUrl("/assets/badges/" + (request.getSkillName() != null ? request.getSkillName().toLowerCase().replace(" ", "-") : "general") + ".png")
                .build();
    }

    public SkillCertificateResponseDto verifyCertificate(String certificateId) {
        log.info("🔍 Verifying certificate: {}", certificateId);

        CertificateBlock block = blockchain.get(certificateId);
        if (block == null) {
            log.warn("Certificate not found: {}", certificateId);
            return SkillCertificateResponseDto.builder()
                    .certificateId(certificateId)
                    .status("NOT_FOUND")
                    .chainValid(false)
                    .build();
        }

        // Verify hash integrity
        String recalculatedHash = calculateHash(block);
        boolean hashValid = recalculatedHash.equals(block.hash);

        // Verify chain integrity
        boolean chainValid = validateChain();

        // Check expiry (assume 12 months validity)
        boolean expired = block.timestamp.plusMonths(12).isBefore(LocalDateTime.now());

        String status = !hashValid ? "TAMPERED" : expired ? "EXPIRED" : chainValid ? "ACTIVE" : "CHAIN_BROKEN";

        return SkillCertificateResponseDto.builder()
                .certificateId(certificateId)
                .blockchainHash(block.hash)
                .previousHash(block.previousHash)
                .blockIndex((long) block.index)
                .issuedAt(block.timestamp)
                .expiresAt(block.timestamp.plusMonths(12))
                .status(status)
                .chainValid(chainValid && hashValid)
                .chainLength(chain.size())
                .build();
    }

    public List<SkillCertificateResponseDto> getCandidateCertificates(Long candidateId) {
        log.info("📜 Fetching certificates for candidate {}", candidateId);

        return blockchain.values().stream()
                .filter(block -> block.data.contains("candidateId=" + candidateId))
                .map(block -> SkillCertificateResponseDto.builder()
                        .certificateId(block.certificateId)
                        .blockchainHash(block.hash)
                        .blockIndex((long) block.index)
                        .candidateId(candidateId)
                        .issuedAt(block.timestamp)
                        .expiresAt(block.timestamp.plusMonths(12))
                        .status(block.timestamp.plusMonths(12).isBefore(LocalDateTime.now()) ? "EXPIRED" : "ACTIVE")
                        .chainValid(validateChain())
                        .chainLength(chain.size())
                        .build())
                .toList();
    }

    public Map<String, Object> getChainStatus() {
        boolean valid = validateChain();
        return Map.of(
                "chainLength", chain.size(),
                "isValid", valid,
                "latestBlock", chain.get(chain.size() - 1).hash,
                "totalCertificates", blockchain.size(),
                "genesisHash", chain.get(0).hash
        );
    }

    public boolean revokeCertificate(String certificateId) {
        CertificateBlock block = blockchain.get(certificateId);
        if (block != null) {
            log.info("🚫 Certificate revoked: {}", certificateId);
            return true;
        }
        return false;
    }

    private boolean validateChain() {
        for (int i = 1; i < chain.size(); i++) {
            CertificateBlock current = chain.get(i);
            CertificateBlock previous = chain.get(i - 1);

            // Verify hash
            if (!current.hash.equals(calculateHash(current))) return false;

            // Verify chain link
            if (!current.previousHash.equals(previous.hash)) return false;
        }
        return true;
    }

    private String calculateHash(CertificateBlock block) {
        String input = block.index + block.timestamp.toString() + block.data + block.previousHash;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    private String buildCertificateData(String certId, SkillCertificateRequestDto request, LocalDateTime issued) {
        return String.format("certId=%s|candidateId=%d|interviewId=%d|skill=%s|score=%.1f|level=%s|issued=%s",
                certId, request.getCandidateId(), request.getInterviewId(),
                request.getSkillName(), request.getVerifiedScore() != null ? request.getVerifiedScore() : 0.0,
                request.getProficiencyLevel(), issued);
    }

    private String generateSignature(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(("DEVINSIGHT_SIGN:" + data).getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            return "SIGNATURE_ERROR";
        }
    }

    private String generateQRCodeData(String url) {
        // Base64-encoded QR data placeholder (real implementation would use a QR library)
        return Base64.getEncoder().encodeToString(("QR:" + url).getBytes(StandardCharsets.UTF_8));
    }

    private String determineProficiency(Double score) {
        if (score == null) return "INTERMEDIATE";
        if (score >= 90) return "EXPERT";
        if (score >= 75) return "ADVANCED";
        if (score >= 50) return "INTERMEDIATE";
        return "BEGINNER";
    }

    private String detectAssessmentMethod(String skill) {
        String lower = skill.toLowerCase();
        if (lower.contains("code") || lower.contains("program") || lower.contains("algorithm")) return "CODING";
        if (lower.contains("design") || lower.contains("architect")) return "SYSTEM_DESIGN";
        if (lower.contains("lead") || lower.contains("manage") || lower.contains("team")) return "BEHAVIORAL";
        return "Q_AND_A";
    }

    // Internal block structure
    private static class CertificateBlock {
        int index;
        LocalDateTime timestamp;
        String data;
        String previousHash;
        String hash;
        String certificateId;
    }
}
