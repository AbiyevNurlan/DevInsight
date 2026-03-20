package az.edu.itbrains.devinsight2.controller.auth;

import az.edu.itbrains.devinsight2.dto.auth.AuthResponse;
import az.edu.itbrains.devinsight2.dto.auth.LoginRequest;
import az.edu.itbrains.devinsight2.exception.GlobalExceptionHandler;
import az.edu.itbrains.devinsight2.exception.UnauthorizedException;
import az.edu.itbrains.devinsight2.service.auth.AuthService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    // ===== TEST 1: Login uğurlu =====
    @Test
    @DisplayName("POST /auth/login — uğurlu login, 200 + token qaytarır")
    void login_withValidCredentials_returnsToken() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("candidate@test.com")
                .password("Test1234")
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .token("jwt-access-token")
                .refreshToken("jwt-refresh-token")
                .userId(1L)
                .email("candidate@test.com")
                .fullName("Test User")
                .role("CANDIDATE")
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data.token").value("jwt-access-token"))
                .andExpect(jsonPath("$.data.refreshToken").value("jwt-refresh-token"))
                .andExpect(jsonPath("$.data.email").value("candidate@test.com"))
                .andExpect(jsonPath("$.data.role").value("CANDIDATE"));
    }

    // ===== TEST 2: Yanlış şifrə =====
    @Test
    @DisplayName("POST /auth/login — yanlış şifrə, 401 qaytarır")
    void login_withInvalidPassword_returns401() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("candidate@test.com")
                .password("wrongPassword")
                .build();

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new UnauthorizedException("Invalid email or password"));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }
}
