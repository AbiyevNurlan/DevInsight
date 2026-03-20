package az.edu.itbrains.devinsight2.service.auth;

import az.edu.itbrains.devinsight2.dto.auth.UserDTO;
import az.edu.itbrains.devinsight2.exception.ResourceNotFoundException;
import az.edu.itbrains.devinsight2.model.user.User;
import az.edu.itbrains.devinsight2.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // Convert User entity to UserDTO (prevents lazy loading issues)
    @Transactional(readOnly = true)
    public UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .linkedinUrl(user.getLinkedinUrl())
                .githubUrl(user.getGithubUrl())
                .skills(user.getSkills() != null ? 
                    user.getSkills().stream()
                        .map(skill -> skill.toString())
                        .toList() 
                    : List.of())
                .build();
    }

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findByIdWithSkills(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmailWithSkills(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmailWithSkills(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    @Transactional
    public User updateProfile(Long userId, User updateData) {
        User user = getUserById(userId);

        if (updateData.getFullName() != null) {
            user.setFullName(updateData.getFullName());
        }
        if (updateData.getPhone() != null) {
            user.setPhone(updateData.getPhone());
        }
        if (updateData.getBio() != null) {
            user.setBio(updateData.getBio());
        }
        if (updateData.getLinkedinUrl() != null) {
            user.setLinkedinUrl(updateData.getLinkedinUrl());
        }
        if (updateData.getGithubUrl() != null) {
            user.setGithubUrl(updateData.getGithubUrl());
        }

        return userRepository.save(user);
    }

    @Transactional
    public void updateLastLogin(String email) {
        User user = getUserByEmail(email);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = getUserById(userId);
        userRepository.delete(user);
    }
}