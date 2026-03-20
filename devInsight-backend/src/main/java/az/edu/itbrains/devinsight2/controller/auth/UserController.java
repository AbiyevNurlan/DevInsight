package az.edu.itbrains.devinsight2.controller.auth;

import az.edu.itbrains.devinsight2.dto.common.ApiResponse;
import az.edu.itbrains.devinsight2.dto.auth.UserDTO;
import az.edu.itbrains.devinsight2.model.user.User;
import az.edu.itbrains.devinsight2.service.auth.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser() {
        User user = userService.getCurrentUser();
        UserDTO dto = userService.mapToDTO(user);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        UserDTO dto = userService.mapToDTO(user);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(
            @PathVariable Long id,
            @RequestBody User updateData
    ) {
        User updatedUser = userService.updateProfile(id, updateData);
        UserDTO dto = userService.mapToDTO(updatedUser);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }
}