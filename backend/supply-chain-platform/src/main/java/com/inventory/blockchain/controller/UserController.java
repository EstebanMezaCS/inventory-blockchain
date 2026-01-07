package com.inventory.blockchain.controller;

import com.inventory.blockchain.dto.*;
import com.inventory.blockchain.entity.User;
import com.inventory.blockchain.repository.UserRepository;
import com.inventory.blockchain.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    // ==================== AUTHENTICATION ====================

    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        log.info("POST /api/auth/login - username={}", request.username());
        String ipAddress = httpRequest.getRemoteAddr();
        LoginResponse response = userService.login(request, ipAddress);
        return ResponseEntity.ok(response);
    }

    // ==================== USER MANAGEMENT ====================

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        log.info("GET /api/users");
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        log.info("GET /api/users/{}", id);
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(
            @RequestBody CreateUserRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {
        log.info("POST /api/users - username={}", request.username());
        User currentUser = currentUserId != null ? 
                userRepository.findById(currentUserId).orElse(null) : null;
        UserResponse response = userService.createUser(request, currentUser);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {
        log.info("PUT /api/users/{}", id);
        User currentUser = currentUserId != null ? 
                userRepository.findById(currentUserId).orElse(null) : null;
        UserResponse response = userService.updateUser(id, request, currentUser);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {
        log.info("DELETE /api/users/{}", id);
        User currentUser = currentUserId != null ? 
                userRepository.findById(currentUserId).orElse(null) : null;
        userService.deleteUser(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{id}/change-password")
    public ResponseEntity<Void> changePassword(
            @PathVariable Long id,
            @RequestBody ChangePasswordRequest request) {
        log.info("POST /api/users/{}/change-password", id);
        userService.changePassword(id, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<Void> resetPassword(
            @PathVariable Long id,
            @RequestBody String newPassword,
            @RequestHeader(value = "X-User-Id") Long currentUserId) {
        log.info("POST /api/users/{}/reset-password", id);
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        userService.resetPassword(id, newPassword, currentUser);
        return ResponseEntity.ok().build();
    }

    // ==================== ROLE MANAGEMENT ====================

    @GetMapping("/roles")
    public ResponseEntity<List<RoleResponse>> getAllRoles() {
        log.info("GET /api/roles");
        return ResponseEntity.ok(userService.getAllRoles());
    }

    @GetMapping("/roles/{id}")
    public ResponseEntity<RoleResponse> getRole(@PathVariable Long id) {
        log.info("GET /api/roles/{}", id);
        return ResponseEntity.ok(userService.getRoleById(id));
    }

    @PostMapping("/roles")
    public ResponseEntity<RoleResponse> createRole(@RequestBody CreateRoleRequest request) {
        log.info("POST /api/roles - name={}", request.name());
        return ResponseEntity.ok(userService.createRole(request));
    }

    @PutMapping("/roles/{id}")
    public ResponseEntity<RoleResponse> updateRole(
            @PathVariable Long id,
            @RequestBody UpdateRoleRequest request) {
        log.info("PUT /api/roles/{}", id);
        return ResponseEntity.ok(userService.updateRole(id, request));
    }

    @DeleteMapping("/roles/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        log.info("DELETE /api/roles/{}", id);
        userService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== PERMISSIONS ====================

    @GetMapping("/permissions")
    public ResponseEntity<List<PermissionResponse>> getAllPermissions() {
        log.info("GET /api/permissions");
        return ResponseEntity.ok(userService.getAllPermissions());
    }

    @GetMapping("/permissions/categories")
    public ResponseEntity<List<String>> getPermissionCategories() {
        log.info("GET /api/permissions/categories");
        return ResponseEntity.ok(userService.getPermissionCategories());
    }

    // ==================== ACTIVITY LOGS ====================

    @GetMapping("/activity-logs")
    public ResponseEntity<List<ActivityLogResponse>> getRecentActivity(
            @RequestParam(defaultValue = "50") int limit) {
        log.info("GET /api/activity-logs - limit={}", limit);
        return ResponseEntity.ok(userService.getRecentActivity(limit));
    }

    @GetMapping("/activity-logs/user/{userId}")
    public ResponseEntity<List<ActivityLogResponse>> getUserActivity(@PathVariable Long userId) {
        log.info("GET /api/activity-logs/user/{}", userId);
        return ResponseEntity.ok(userService.getUserActivity(userId));
    }
}
