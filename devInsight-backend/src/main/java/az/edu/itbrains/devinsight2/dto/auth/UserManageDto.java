package az.edu.itbrains.devinsight2.dto.auth;

import az.edu.itbrains.devinsight2.model.core.AccountStatus;
import az.edu.itbrains.devinsight2.model.user.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserManageDto {
    private Long id;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String password; // Only for create, optional for update

    @NotBlank(message = "Full name is required")
    private String fullName;

    private UserRole role;
    private AccountStatus status;
    private String phone;
    private String linkedinUrl;
    private String githubUrl;
    private String bio;
    private Set<String> skills;
    private String avatarUrl;
    private Long companyId;
}
