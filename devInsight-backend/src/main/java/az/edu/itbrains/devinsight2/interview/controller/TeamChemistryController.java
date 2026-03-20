package az.edu.itbrains.devinsight2.interview.controller;

import az.edu.itbrains.devinsight2.interview.dto.TeamChemistryRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.TeamChemistryResponseDto;
import az.edu.itbrains.devinsight2.interview.service.TeamChemistryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/interview/team-chemistry")
@RequiredArgsConstructor
@Slf4j
public class TeamChemistryController {

    private final TeamChemistryService teamChemistryService;

    @PostMapping("/predict")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> predictTeamChemistry(
            @RequestBody TeamChemistryRequestDto request) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("🧪 Team chemistry prediction requested for candidate {}", request.getCandidateId());
            TeamChemistryResponseDto prediction = teamChemistryService.predictTeamChemistry(request);
            response.put("success", true);
            response.put("message", "Team chemistry prediction completed");
            response.put("data", prediction);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to predict team chemistry", e);
            response.put("success", false);
            response.put("message", "Failed to predict team chemistry: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
