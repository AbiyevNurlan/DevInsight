package az.edu.itbrains.devinsight2.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String role;
    private String status;
    private String avatarUrl;
    private String bio;
    private String linkedinUrl;
    private String githubUrl;
    private List<String> skills;
}
