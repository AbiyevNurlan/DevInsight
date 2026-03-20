package az.edu.itbrains.devinsight2.controller.analytics;

import az.edu.itbrains.devinsight2.dto.analytics.AnalyticsOverviewDto;
import az.edu.itbrains.devinsight2.service.analytics.AnalyticsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AnalyticsControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AnalyticsService analyticsService;

    @InjectMocks
    private AnalyticsController analyticsController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(analyticsController).build();
    }

    @Test
    @DisplayName("GET /analytics/overview — HR rolu ilə 200 qaytarır")
    void getOverview_asHR_returns200() throws Exception {
        AnalyticsOverviewDto overview = AnalyticsOverviewDto.builder()
                .totalInterviews(42L)
                .completionRate(85.5)
                .averageScore(72.3)
                .passRate(68.0)
                .build();

        when(analyticsService.getOverview()).thenReturn(overview);

        mockMvc.perform(get("/analytics/overview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalInterviews").value(42))
                .andExpect(jsonPath("$.data.completionRate").value(85.5))
                .andExpect(jsonPath("$.data.averageScore").value(72.3))
                .andExpect(jsonPath("$.data.passRate").value(68.0));
    }
}
