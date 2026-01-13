package com.inventory.blockchain.config;

import com.inventory.blockchain.entity.Permission;
import com.inventory.blockchain.entity.Role;
import com.inventory.blockchain.entity.User;
import com.inventory.blockchain.repository.PermissionRepository;
import com.inventory.blockchain.repository.RoleRepository;
import com.inventory.blockchain.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DataInitializer(PermissionRepository permissionRepository,
                          RoleRepository roleRepository,
                          UserRepository userRepository) {
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("=== Checking Database Initialization ===");
        
        Map<String, Permission> permissions = createPermissionsIfNeeded();
        Map<String, Role> roles = createRolesIfNeeded(permissions);
        createUsersIfNeeded(roles);
        
        System.out.println("=== Database Initialization Check Complete ===");
    }

    private Map<String, Permission> createPermissionsIfNeeded() {
        Map<String, Permission> permissions = new HashMap<>();

        // User permissions
        permissions.put("users.create", findOrCreatePermission("users.create", "Create Users", "Allows creating new users", "USERS"));
        permissions.put("users.read", findOrCreatePermission("users.read", "View Users", "Allows viewing user information", "USERS"));
        permissions.put("users.update", findOrCreatePermission("users.update", "Update Users", "Allows updating user information", "USERS"));
        permissions.put("users.delete", findOrCreatePermission("users.delete", "Delete Users", "Allows deleting users", "USERS"));

        // Transfer permissions
        permissions.put("transfers.create", findOrCreatePermission("transfers.create", "Create Transfers", "Allows creating inventory transfers", "TRANSFERS"));
        permissions.put("transfers.read", findOrCreatePermission("transfers.read", "View Transfers", "Allows viewing transfers", "TRANSFERS"));
        permissions.put("transfers.update", findOrCreatePermission("transfers.update", "Update Transfers", "Allows updating transfers", "TRANSFERS"));
        permissions.put("transfers.delete", findOrCreatePermission("transfers.delete", "Delete Transfers", "Allows deleting transfers", "TRANSFERS"));
        permissions.put("transfers.approve", findOrCreatePermission("transfers.approve", "Approve Transfers", "Allows approving transfers", "TRANSFERS"));

        // Inventory permissions
        permissions.put("inventory.create", findOrCreatePermission("inventory.create", "Create Inventory", "Allows adding inventory items", "INVENTORY"));
        permissions.put("inventory.read", findOrCreatePermission("inventory.read", "View Inventory", "Allows viewing inventory", "INVENTORY"));
        permissions.put("inventory.update", findOrCreatePermission("inventory.update", "Update Inventory", "Allows updating inventory", "INVENTORY"));
        permissions.put("inventory.delete", findOrCreatePermission("inventory.delete", "Delete Inventory", "Allows deleting inventory items", "INVENTORY"));

        // Reports permissions
        permissions.put("reports.read", findOrCreatePermission("reports.read", "View Reports", "Allows viewing reports", "REPORTS"));
        permissions.put("reports.export", findOrCreatePermission("reports.export", "Export Reports", "Allows exporting reports", "REPORTS"));

        // Audit permissions
        permissions.put("audit.read", findOrCreatePermission("audit.read", "View Audit Logs", "Allows viewing audit logs", "AUDIT"));

        // Settings permissions
        permissions.put("settings.read", findOrCreatePermission("settings.read", "View Settings", "Allows viewing system settings", "SETTINGS"));
        permissions.put("settings.update", findOrCreatePermission("settings.update", "Update Settings", "Allows updating system settings", "SETTINGS"));

        // Supplier permissions
        permissions.put("suppliers.create", findOrCreatePermission("suppliers.create", "Create Suppliers", "Allows creating suppliers", "SUPPLIERS"));
        permissions.put("suppliers.read", findOrCreatePermission("suppliers.read", "View Suppliers", "Allows viewing suppliers", "SUPPLIERS"));
        permissions.put("suppliers.update", findOrCreatePermission("suppliers.update", "Update Suppliers", "Allows updating suppliers", "SUPPLIERS"));
        permissions.put("suppliers.delete", findOrCreatePermission("suppliers.delete", "Delete Suppliers", "Allows deleting suppliers", "SUPPLIERS"));

        // Analytics permissions
        permissions.put("analytics.read", findOrCreatePermission("analytics.read", "View Analytics", "Allows viewing analytics dashboard", "ANALYTICS"));

        // Document permissions
        permissions.put("documents.create", findOrCreatePermission("documents.create", "Create Documents", "Allows uploading documents", "DOCUMENTS"));
        permissions.put("documents.read", findOrCreatePermission("documents.read", "View Documents", "Allows viewing documents", "DOCUMENTS"));
        permissions.put("documents.update", findOrCreatePermission("documents.update", "Update Documents", "Allows updating documents", "DOCUMENTS"));
        permissions.put("documents.delete", findOrCreatePermission("documents.delete", "Delete Documents", "Allows deleting documents", "DOCUMENTS"));

        System.out.println("✓ Permissions ready: " + permissions.size());
        return permissions;
    }

    private Permission findOrCreatePermission(String code, String name, String description, String category) {
        Optional<Permission> existing = permissionRepository.findByCode(code);
        if (existing.isPresent()) {
            return existing.get();
        }
        
        Permission permission = new Permission();
        permission.setCode(code);
        permission.setName(name);
        permission.setDescription(description);
        permission.setCategory(category);
        return permissionRepository.save(permission);
    }

    private Map<String, Role> createRolesIfNeeded(Map<String, Permission> permissions) {
        Map<String, Role> roles = new HashMap<>();

        // ADMIN - All permissions
        roles.put("ADMIN", findOrCreateRole("ADMIN", "Full system administrator with all permissions", 
            permissions.values().toArray(new Permission[0])));

        // MANAGER - Operations management
        roles.put("MANAGER", findOrCreateRole("MANAGER", "Operations manager with inventory and transfer management",
            permissions.get("transfers.create"), permissions.get("transfers.read"), 
            permissions.get("transfers.update"), permissions.get("transfers.approve"),
            permissions.get("inventory.create"), permissions.get("inventory.read"), 
            permissions.get("inventory.update"),
            permissions.get("reports.read"), permissions.get("reports.export"),
            permissions.get("suppliers.create"), permissions.get("suppliers.read"), 
            permissions.get("suppliers.update"),
            permissions.get("analytics.read"),
            permissions.get("documents.create"), permissions.get("documents.read"), 
            permissions.get("documents.update"),
            permissions.get("audit.read")
        ));

        // WAREHOUSE_CLERK - Day-to-day operations
        roles.put("WAREHOUSE_CLERK", findOrCreateRole("WAREHOUSE_CLERK", "Warehouse staff handling daily inventory operations",
            permissions.get("transfers.create"), permissions.get("transfers.read"), 
            permissions.get("transfers.update"),
            permissions.get("inventory.read"), permissions.get("inventory.update"),
            permissions.get("suppliers.read"),
            permissions.get("documents.read"), permissions.get("documents.create")
        ));

        // AUDITOR - Read-only audit access
        roles.put("AUDITOR", findOrCreateRole("AUDITOR", "Auditor with read-only access to all records",
            permissions.get("transfers.read"),
            permissions.get("inventory.read"),
            permissions.get("reports.read"), permissions.get("reports.export"),
            permissions.get("suppliers.read"),
            permissions.get("analytics.read"),
            permissions.get("documents.read"),
            permissions.get("audit.read"),
            permissions.get("users.read")
        ));

        // VIEWER - Basic read-only access
        roles.put("VIEWER", findOrCreateRole("VIEWER", "Basic viewer with minimal read permissions",
            permissions.get("inventory.read"),
            permissions.get("transfers.read"),
            permissions.get("reports.read")
        ));

        System.out.println("✓ Roles ready: " + roles.size());
        return roles;
    }

    private Role findOrCreateRole(String name, String description, Permission... perms) {
        Optional<Role> existing = roleRepository.findByName(name);
        if (existing.isPresent()) {
            return existing.get();
        }
        
        Role role = new Role();
        role.setName(name);
        role.setDescription(description);
        for (Permission p : perms) {
            if (p != null) {
                role.addPermission(p);
            }
        }
        return roleRepository.save(role);
    }

    private void createUsersIfNeeded(Map<String, Role> roles) {
        findOrCreateUser("admin", "admin@company.com", "admin123", "System Administrator", roles.get("ADMIN"));
        findOrCreateUser("manager", "manager@company.com", "manager123", "Operations Manager", roles.get("MANAGER"));
        findOrCreateUser("clerk", "clerk@company.com", "clerk123", "Warehouse Clerk", roles.get("WAREHOUSE_CLERK"));
        findOrCreateUser("auditor", "auditor@company.com", "auditor123", "External Auditor", roles.get("AUDITOR"));
        findOrCreateUser("viewer", "viewer@company.com", "viewer123", "Report Viewer", roles.get("VIEWER"));

        System.out.println("✓ Demo users ready");
    }

    private void findOrCreateUser(String username, String email, String password, String fullName, Role role) {
        Optional<User> existing = userRepository.findByUsername(username);
        if (existing.isPresent()) {
            return;
        }
        
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setRole(role);
        user.setIsActive(true);
        userRepository.save(user);
    }
}
