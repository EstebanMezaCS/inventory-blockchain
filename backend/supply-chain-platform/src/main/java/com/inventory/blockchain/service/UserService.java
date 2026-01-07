package com.inventory.blockchain.service;

import com.inventory.blockchain.dto.*;
import com.inventory.blockchain.entity.*;
import com.inventory.blockchain.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final ActivityLogRepository activityLogRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            ActivityLogRepository activityLogRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.activityLogRepository = activityLogRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // ==================== USER OPERATIONS ====================

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        return toUserResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return toUserResponse(user);
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request, User createdBy) {
        log.info("Creating user: {}", request.username());

        if (userRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Username already exists: " + request.username());
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already exists: " + request.email());
        }

        Role role = roleRepository.findById(request.roleId())
                .orElseThrow(() -> new RuntimeException("Role not found: " + request.roleId()));

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setRole(role);
        user.setCreatedBy(createdBy);

        User saved = userRepository.save(user);
        
        // Log activity
        if (createdBy != null) {
            activityLogRepository.save(ActivityLog.createUser(createdBy, saved));
        }

        log.info("User created: id={}, username={}", saved.getId(), saved.getUsername());
        return toUserResponse(saved);
    }

    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request, User updatedBy) {
        log.info("Updating user: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));

        if (request.email() != null && !request.email().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new RuntimeException("Email already exists: " + request.email());
            }
            user.setEmail(request.email());
        }

        if (request.fullName() != null) {
            user.setFullName(request.fullName());
        }

        if (request.roleId() != null) {
            Role role = roleRepository.findById(request.roleId())
                    .orElseThrow(() -> new RuntimeException("Role not found: " + request.roleId()));
            user.setRole(role);
        }

        if (request.isActive() != null) {
            user.setIsActive(request.isActive());
        }

        User saved = userRepository.save(user);
        
        // Log activity
        if (updatedBy != null) {
            activityLogRepository.save(ActivityLog.updateUser(updatedBy, saved));
        }

        log.info("User updated: id={}", saved.getId());
        return toUserResponse(saved);
    }

    @Transactional
    public void deleteUser(Long id, User deletedBy) {
        log.info("Deleting user: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));

        // Don't allow deleting yourself
        if (deletedBy != null && deletedBy.getId().equals(id)) {
            throw new RuntimeException("Cannot delete your own account");
        }

        // Soft delete - just deactivate
        user.setIsActive(false);
        userRepository.save(user);
        
        // Log activity
        if (deletedBy != null) {
            activityLogRepository.save(ActivityLog.deleteUser(deletedBy, id));
        }

        log.info("User deactivated: id={}", id);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        
        log.info("Password changed for user: {}", userId);
    }

    @Transactional
    public void resetPassword(Long userId, String newPassword, User resetBy) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        log.info("Password reset for user: {} by: {}", userId, resetBy.getUsername());
    }

    // ==================== AUTHENTICATION ====================

    @Transactional
    public LoginResponse login(LoginRequest request, String ipAddress) {
        log.info("Login attempt: {}", request.username());

        User user = userRepository.findByUsernameWithRole(request.username())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!user.getIsActive()) {
            throw new RuntimeException("Account is deactivated");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid username or password");
        }

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Log activity
        activityLogRepository.save(ActivityLog.login(user, ipAddress));

        // Get permissions
        List<String> permissions = user.getRole().getPermissions().stream()
                .map(Permission::getCode)
                .collect(Collectors.toList());

        log.info("Login successful: {}", request.username());
        
        return new LoginResponse(
                toUserResponse(user),
                generateToken(user), // Simple token for now
                permissions
        );
    }

    private String generateToken(User user) {
        // Simple token - in production use JWT
        return "token_" + user.getId() + "_" + System.currentTimeMillis();
    }

    // ==================== ROLE OPERATIONS ====================

    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAllWithPermissions().stream()
                .map(this::toRoleResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoleResponse getRoleById(Long id) {
        Role role = roleRepository.findByIdWithPermissions(id)
                .orElseThrow(() -> new RuntimeException("Role not found: " + id));
        return toRoleResponse(role);
    }

    @Transactional
    public RoleResponse createRole(CreateRoleRequest request) {
        log.info("Creating role: {}", request.name());

        if (roleRepository.existsByName(request.name())) {
            throw new RuntimeException("Role already exists: " + request.name());
        }

        Role role = new Role(request.name(), request.description());
        
        if (request.permissionCodes() != null && !request.permissionCodes().isEmpty()) {
            Set<Permission> permissions = permissionRepository.findByCodes(request.permissionCodes());
            role.setPermissions(permissions);
        }

        Role saved = roleRepository.save(role);
        log.info("Role created: id={}, name={}", saved.getId(), saved.getName());
        
        return toRoleResponse(saved);
    }

    @Transactional
    public RoleResponse updateRole(Long id, UpdateRoleRequest request) {
        log.info("Updating role: {}", id);

        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found: " + id));

        if (role.getIsSystemRole()) {
            throw new RuntimeException("Cannot modify system role: " + role.getName());
        }

        if (request.description() != null) {
            role.setDescription(request.description());
        }

        if (request.permissionCodes() != null) {
            Set<Permission> permissions = permissionRepository.findByCodes(request.permissionCodes());
            role.setPermissions(permissions);
        }

        Role saved = roleRepository.save(role);
        log.info("Role updated: id={}", saved.getId());
        
        return toRoleResponse(saved);
    }

    @Transactional
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found: " + id));

        if (role.getIsSystemRole()) {
            throw new RuntimeException("Cannot delete system role: " + role.getName());
        }

        long usersWithRole = userRepository.countByRoleId(id);
        if (usersWithRole > 0) {
            throw new RuntimeException("Cannot delete role with " + usersWithRole + " users assigned");
        }

        roleRepository.delete(role);
        log.info("Role deleted: id={}", id);
    }

    // ==================== PERMISSION OPERATIONS ====================

    @Transactional(readOnly = true)
    public List<PermissionResponse> getAllPermissions() {
        return permissionRepository.findAllByOrderByCategoryAscNameAsc().stream()
                .map(this::toPermissionResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getPermissionCategories() {
        return permissionRepository.findAllCategories();
    }

    // ==================== ACTIVITY LOG OPERATIONS ====================

    @Transactional(readOnly = true)
    public List<ActivityLogResponse> getRecentActivity(int limit) {
        return activityLogRepository.findAllByOrderByCreatedAtDesc(
                org.springframework.data.domain.PageRequest.of(0, limit))
                .stream()
                .map(this::toActivityLogResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ActivityLogResponse> getUserActivity(Long userId) {
        return activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toActivityLogResponse)
                .collect(Collectors.toList());
    }

    // ==================== MAPPERS ====================

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole() != null ? toRoleResponse(user.getRole()) : null,
                user.getIsActive(),
                user.getCreatedAt(),
                user.getLastLogin()
        );
    }

    private RoleResponse toRoleResponse(Role role) {
        Set<String> permissionCodes = role.getPermissions().stream()
                .map(Permission::getCode)
                .collect(Collectors.toSet());
        
        return new RoleResponse(
                role.getId(),
                role.getName(),
                role.getDescription(),
                role.getIsSystemRole(),
                permissionCodes
        );
    }

    private PermissionResponse toPermissionResponse(Permission permission) {
        return new PermissionResponse(
                permission.getId(),
                permission.getCode(),
                permission.getName(),
                permission.getDescription(),
                permission.getCategory()
        );
    }

    private ActivityLogResponse toActivityLogResponse(ActivityLog log) {
        return new ActivityLogResponse(
                log.getId(),
                log.getUser() != null ? log.getUser().getUsername() : "System",
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getCreatedAt(),
                log.getIpAddress()
        );
    }
}
