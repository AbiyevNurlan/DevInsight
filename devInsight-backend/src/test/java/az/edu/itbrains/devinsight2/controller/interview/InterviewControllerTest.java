package az.edu.itbrains.devinsight2.controller.interview;

import az.edu.itbrains.devinsight2.model.interview.Interview;
import az.edu.itbrains.devinsight2.model.interview.InterviewLevel;
import az.edu.itbrains.devinsight2.model.interview.InterviewStatus;
import az.edu.itbrains.devinsight2.model.interview.InterviewType;
import az.edu.itbrains.devinsight2.service.interview.InterviewService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class InterviewControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    @Mock
    private InterviewService interviewService;

    @InjectMocks
    private InterviewController interviewController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(interviewController).build();
    }

    @Test
    @DisplayName("POST /interviews — HR rolu ilə müsahibə yaradır, 201 qaytarır")
    void createInterview_asHR_returns201() throws Exception {
        Interview input = Interview.builder()
                .title("Java Backend Interview")
                .description("Spring Boot + Microservices müsahibəsi")
                .level(InterviewLevel.MID)
                .type(InterviewType.CODING)
                .durationMinutes(60)
                .status(InterviewStatus.DRAFT)
                .isPublic(false)
                .passingScore(70)
                .build();

        Interview saved = Interview.builder()
                .id(1L)
                .title("Java Backend Interview")
                .description("Spring Boot + Microservices müsahibəsi")
                .level(InterviewLevel.MID)
                .type(InterviewType.CODING)
                .durationMinutes(60)
                .status(InterviewStatus.DRAFT)
                .isPublic(false)
                .passingScore(70)
                .createdAt(LocalDateTime.now())
                .build();

        when(interviewService.createInterview(any(Interview.class))).thenReturn(saved);

        mockMvc.perform(post("/interviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Interview created successfully"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.title").value("Java Backend Interview"));
    }
}
