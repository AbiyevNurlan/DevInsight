package az.edu.itbrains.devinsight2.controller.question;

import az.edu.itbrains.devinsight2.dto.question.CreateQuestionRequest;
import az.edu.itbrains.devinsight2.dto.question.QuestionResponse;
import az.edu.itbrains.devinsight2.model.question.QuestionDifficulty;
import az.edu.itbrains.devinsight2.model.question.QuestionType;
import az.edu.itbrains.devinsight2.service.question.QuestionService;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class QuestionControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private QuestionService questionService;

    @InjectMocks
    private QuestionController questionController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(questionController).build();
    }

    @Test
    @DisplayName("POST /questions — ADMIN rolu ilə sual yaradır, 201 qaytarır")
    void createQuestion_asAdmin_returns201() throws Exception {
        CreateQuestionRequest request = CreateQuestionRequest.builder()
                .title("FizzBuzz Implementation")
                .description("Write a function that prints FizzBuzz")
                .type(QuestionType.CODING)
                .difficulty(QuestionDifficulty.EASY)
                .programmingLanguage("Java")
                .maxPoints(100)
                .timeLimit(1800)
                .tags(List.of("java", "algorithms", "basics"))
                .build();

        QuestionResponse response = QuestionResponse.builder()
                .id(1L)
                .title("FizzBuzz Implementation")
                .description("Write a function that prints FizzBuzz")
                .type(QuestionType.CODING)
                .difficulty(QuestionDifficulty.EASY)
                .programmingLanguage("Java")
                .maxPoints(100)
                .timeLimit(1800)
                .tags(List.of("java", "algorithms", "basics"))
                .createdByName("Admin User")
                .build();

        when(questionService.createQuestion(any(CreateQuestionRequest.class))).thenReturn(response);

        mockMvc.perform(post("/questions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Question created successfully"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.title").value("FizzBuzz Implementation"))
                .andExpect(jsonPath("$.data.type").value("CODING"))
                .andExpect(jsonPath("$.data.difficulty").value("EASY"));
    }
}
