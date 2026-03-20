package az.edu.itbrains.devinsight2.interview.controller;

import az.edu.itbrains.devinsight2.interview.dto.SkillCertificateRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.SkillCertificateResponseDto;
import az.edu.itbrains.devinsight2.interview.service.BlockchainCertificateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/interview/blockchain-certificates")
@RequiredArgsConstructor
@Slf4j
public class BlockchainCertificateController {

    private final BlockchainCertificateService blockchainCertificateService;

    @PostMapping("/issue")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> issueCertificate(@RequestBody SkillCertificateRequestDto request) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("🏆 Issuing blockchain certificate for candidate {} - skill: {}", 
                    request.getCandidateId(), request.getSkillName());
            SkillCertificateResponseDto certificate = blockchainCertificateService.issueCertificate(request);
            response.put("success", true);
            response.put("message", "Blockchain certificate issued successfully");
            response.put("data", certificate);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Certificate issuance failed", e);
            response.put("success", false);
            response.put("message", "Failed to issue certificate: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/verify/{certificateId}")
    public ResponseEntity<Map<String, Object>> verifyCertificate(@PathVariable String certificateId) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("✅ Verifying certificate {}", certificateId);
            SkillCertificateResponseDto result = blockchainCertificateService.verifyCertificate(certificateId);
            response.put("success", true);
            response.put("message", "Certificate verification completed");
            response.put("data", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Certificate verification failed for {}", certificateId, e);
            response.put("success", false);
            response.put("message", "Failed to verify certificate: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/candidate/{candidateId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'CANDIDATE')")
    public ResponseEntity<Map<String, Object>> getCandidateCertificates(@PathVariable Long candidateId) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("📜 Getting all certificates for candidate {}", candidateId);
            List<SkillCertificateResponseDto> certificates = blockchainCertificateService.getCandidateCertificates(candidateId);
            response.put("success", true);
            response.put("message", "Certificates retrieved");
            response.put("data", certificates);
            response.put("total", certificates.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get certificates for candidate {}", candidateId, e);
            response.put("success", false);
            response.put("message", "Failed to get certificates: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/chain-status")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getChainStatus() {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("⛓️ Getting blockchain status");
            var status = blockchainCertificateService.getChainStatus();
            response.put("success", true);
            response.put("message", "Blockchain status retrieved");
            response.put("data", status);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get chain status", e);
            response.put("success", false);
            response.put("message", "Failed to get chain status: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @DeleteMapping("/revoke/{certificateId}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> revokeCertificate(@PathVariable String certificateId) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("❌ Revoking certificate {}", certificateId);
            boolean revoked = blockchainCertificateService.revokeCertificate(certificateId);
            response.put("success", revoked);
            response.put("message", revoked ? "Certificate revoked" : "Certificate not found");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Certificate revocation failed for {}", certificateId, e);
            response.put("success", false);
            response.put("message", "Failed to revoke certificate: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
