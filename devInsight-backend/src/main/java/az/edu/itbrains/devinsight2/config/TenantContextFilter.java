package az.edu.itbrains.devinsight2.config;

import az.edu.itbrains.devinsight2.model.user.User;
import az.edu.itbrains.devinsight2.repository.user.UserRepository;
import az.edu.itbrains.devinsight2.security.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class TenantContextFilter extends OncePerRequestFilter {
    
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {
        
        try {
            // Skip for public endpoints
            String path = request.getRequestURI();
            if (path.contains("/auth/") || path.contains("/swagger") || 
                path.contains("/api-docs") || path.contains("/health")) {
                chain.doFilter(request, response);
                return;
            }
            
            // Extract JWT token
            String token = extractToken(request);
            
            if (token != null) {
                String username = jwtUtil.extractUsername(token);
                User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
                
                // Set tenant context
                Long companyId = user.getCompany() != null ? user.getCompany().getId() : 1L;
                TenantContext.setCurrentTenant(companyId);
                log.debug("Tenant context set to: {} for user: {}", companyId, username);
            } else {
                // No token, set default company for testing
                TenantContext.setCurrentTenant(1L);
                log.debug("No token found, setting default tenant: 1");
            }
            
        } catch (Exception e) {
            log.error("Error in TenantContextFilter", e);
        }
        
        try {
            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
    
    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
