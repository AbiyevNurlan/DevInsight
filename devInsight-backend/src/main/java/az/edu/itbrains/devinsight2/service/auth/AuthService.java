package az.edu.itbrains.devinsight2.service.auth;

import az.edu.itbrains.devinsight2.dto.auth.AuthResponse;
import az.edu.itbrains.devinsight2.dto.auth.LoginRequest;
import az.edu.itbrains.devinsight2.dto.auth.RegisterRequest;

import az.edu.itbrains.devinsight2.exception.BadRequestException;
import az.edu.itbrains.devinsight2.exception.UnauthorizedException;
import az.edu.itbrains.devinsight2.model.core.AccountStatus;
import az.edu.itbrains.devinsight2.model.user.User;
import az.edu.itbrains.devinsight2.model.user.UserRole;
import az.edu.itbrains.devinsight2.repository.user.UserRepository;
import az.edu.itbrains.devinsight2.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        // Validate and set role (default to CANDIDATE if not provided)
        // ADMIN role cannot be assigned during registration
        UserRole role;
        String roleStr = request.getRole() != null && !request.getRole().isBlank() 
                ? request.getRole().toUpperCase() 
                : "CANDIDATE";
        
        // Prevent ADMIN role assignment during registration
        if ("ADMIN".equalsIgnoreCase(roleStr)) {
            throw new BadRequestException("ADMIN role cannot be assigned during registration");
        }
        
        try {
            role = UserRole.valueOf(roleStr);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role. Must be CANDIDATE or HR");
        }

        // Create user
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(role)
                .status(AccountStatus.ACTIVE)
                .phone(request.getPhone())
                .build();

        User savedUser = userRepository.save(user);

        // Generate tokens
        String token = jwtUtil.generateToken(savedUser);
        String refreshToken = jwtUtil.generateRefreshToken(savedUser);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole().name())
                .build();
    }

    // Admin credentials - in production, use environment variables
    private static final String ADMIN_EMAIL = "admin@devinsight.com";
    private static final String ADMIN_PASSWORD = "admin123";

    public AuthResponse login(LoginRequest request) {
        // Special case: hardcoded admin login
        if (ADMIN_EMAIL.equalsIgnoreCase(request.getEmail()) 
                && ADMIN_PASSWORD.equals(request.getPassword())) {
            
            // Find or create admin user
            User adminUser = userRepository.findByEmail(ADMIN_EMAIL)
                    .orElseGet(() -> {
                        // Create admin user if doesn't exist
                        User newAdmin = User.builder()
                                .email(ADMIN_EMAIL)
                                .password(passwordEncoder.encode(ADMIN_PASSWORD))
                                .fullName("System Administrator")
                                .role(UserRole.ADMIN)
                                .status(AccountStatus.ACTIVE)
                                .build();
                        return userRepository.save(newAdmin);
                    });
            
            // Ensure admin has ADMIN role
            if (adminUser.getRole() != UserRole.ADMIN) {
                adminUser.setRole(UserRole.ADMIN);
                adminUser.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
                adminUser = userRepository.save(adminUser);
            }
            
            // Generate tokens
            String token = jwtUtil.generateToken(adminUser);
            String refreshToken = jwtUtil.generateRefreshToken(adminUser);
            
            return AuthResponse.builder()
                    .token(token)
                    .refreshToken(refreshToken)
                    .userId(adminUser.getId())
                    .email(adminUser.getEmail())
                    .fullName(adminUser.getFullName())
                    .role(UserRole.ADMIN.name())
                    .build();
        }
        
        // Normal authentication flow
        try {
            // Authenticate
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            // Get user
            User user = (User) authentication.getPrincipal();

            // Generate tokens
            String token = jwtUtil.generateToken(user);
            String refreshToken = jwtUtil.generateRefreshToken(user);

            return AuthResponse.builder()
                    .token(token)
                    .refreshToken(refreshToken)
                    .userId(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole().name())
                    .build();

        } catch (AuthenticationException e) {
            throw new UnauthorizedException("Invalid email or password");
        }
    }

    /**
     * Refresh access token using a valid refresh token.
     */
    public AuthResponse refreshToken(String refreshToken) {
        try {
            String email = jwtUtil.extractUsername(refreshToken);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UnauthorizedException("User not found"));

            // Validate refresh token is not expired
            if (!jwtUtil.validateToken(refreshToken, user)) {
                throw new UnauthorizedException("Invalid or expired refresh token");
            }

            // Generate new tokens
            String newToken = jwtUtil.generateToken(user);
            String newRefreshToken = jwtUtil.generateRefreshToken(user);

            return AuthResponse.builder()
                    .token(newToken)
                    .refreshToken(newRefreshToken)
                    .userId(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole().name())
                    .build();

        } catch (Exception e) {
            throw new UnauthorizedException("Invalid refresh token");
        }
    }
}