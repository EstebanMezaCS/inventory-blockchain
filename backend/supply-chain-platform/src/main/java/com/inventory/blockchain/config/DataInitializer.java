package com.inventory.blockchain.config;

import com.inventory.blockchain.entity.Permission;
import com.inventory.blockchain.entity.Role;
import com.inventory.blockchain.entity.User;
import com.inventory.blockchain.repository.PermissionRepository;
import com.inventory.blockchain.repository.RoleRepository;
import com.inventory.blockchain.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

/**
 * Initializes the database with permissions, roles, and demo users on startup.
 * Only runs if the database is empty.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    public DataInitializer(PermissionRepository permissionRepository,
                          RoleRepository roleRepository,
                          UserRepository userRepository) {
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (permissionRepository.count() == 0) {
            System.out.println("========================================");
            System.out.println("  INITIALIZING DATABASE WITH DEMO DATA  ");
            System.out.println("========================================");
            
            // Step 1: Create all permissions
            Map<String, Permission> permissions = createPermissions();
            
            // Step 2: Create roles with their permissions
            Map<String, Role> roles = createRoles(permissions);
            
            // Step 3: Create demo users
            createDemoUsers(roles);
            
            System.out.println("========================================");
            System.out.println("  DATABASE INITIALIZATION COMPLETE!     ");
            System.out.println("========================================");
        } else {
            System.out.println("Database already initialized, skipping seed data.");
        }
    }

    private Map<String, Permission> createPermissions() {
        Map<String, Permission> permissions = new HashMap<>();
        
        // ===== USER PERMISSIONS =====
        permissions.put("users.create", savePermission("users.create", "Create Users", "Create new user accounts", "USERS"));
        permissions.put("users.read", savePermission("users.read", "View Users", "View user accounts", "USERS"));
        permissions.put("users.update", savePermission("users.update", "Update Users", "Modify user accounts", "USERS"));
        permissions.put("users.delete", savePermission("users.delete", "Delete Users", "Remove user accounts", "USERS"));
        
        // ===== TRANSFER PERMISSIONS =====
        permissions.put("transfers.create", savePermission("transfers.create", "Create Transfers", "Create new transfer requests", "TRANSFERS"));
        permissions.put("transfers.read", savePermission("transfers.read", "View Transfers", "View transfer records", "TRANSFERS"));
        permissions.put("transfers.update", savePermission("transfers.update", "Update Transfers", "Modify transfer records", "TRANSFERS"));
        permissions.put("transfers.delete", savePermission("transfers.delete", "Delete Transfers", "Remove transfer records", "TRANSFERS"));
        permissions.put("transfers.approve", savePermission("transfers.approve", "Approve Transfers", "Approve or reject transfers", "TRANSFERS"));
        
        // ===== INVENTORY PERMISSIONS =====
        permissions.put("inventory.create", savePermission("inventory.create", "Create Inventory", "Add new inventory items", "INVENTORY"));
        permissions.put("inventory.read", savePermission("inventory.read", "View Inventory", "View inventory items", "INVENTORY"));
        permissions.put("inventory.update", savePermission("inventory.update", "Update Inventory", "Modify inventory items", "INVENTORY"));
        permissions.put("inventory.delete", savePermission("inventory.delete", "Delete Inventory", "Remove inventory items", "INVENTORY"));
        
        // ===== REPORT PERMISSIONS =====
        permissions.put("reports.read", savePermission("reports.read", "View Reports", "View system reports", "REPORTS"));
        permissions.put("reports.export", savePermission("reports.export", "Export Reports", "Export reports to file", "REPORTS"));
        
        // ===== AUDIT PERMISSIONS =====
        permissions.put("audit.read", savePermission("audit.read", "View Audit Logs", "View audit trail", "AUDIT"));
        
        // ===== SETTINGS PERMISSIONS =====
        permissions.put("settings.read", savePermission("settings.read", "View Settings", "View system settings", "SETTINGS"));
        permissions.put("settings.update", savePermission("settings.update", "Update Settings", "Modify system settings", "SETTINGS"));
        
        // ===== SUPPLIER PERMISSIONS =====
        permissions.put("suppliers.create", savePermission("suppliers.create", "Create Suppliers", "Add new suppliers", "SUPPLIERS"));
        permissions.put("suppliers.read", savePermission("suppliers.read", "View Suppliers", "View supplier records", "SUPPLIERS"));
        permissions.put("suppliers.update", savePermission("suppliers.update", "Update Suppliers", "Modify supplier records", "SUPPLIERS"));
        permissions.put("suppliers.delete", savePermission("suppliers.delete", "Delete Suppliers", "Remove supplier records", "SUPPLIERS"));
        
        // ===== ANALYTICS PERMISSIONS =====
        permissions.put("analytics.read", savePermission("analytics.read", "View Analytics", "View analytics dashboard", "ANALYTICS"));
        
        // ===== DOCUMENT PERMISSIONS =====
        permissions.put("documents.create", savePermission("documents.create", "Create Documents", "Upload new documents", "DOCUMENTS"));
        permissions.put("documents.read", savePermission("documents.read", "View Documents", "View documents", "DOCUMENTS"));
        permissions.put("documents.update", savePermission("documents.update", "Update Documents", "Modify documents", "DOCUMENTS"));
        permissions.put("documents.delete", savePermission("documents.delete", "Delete Documents", "Remove documents", "DOCUMENTS"));
        
        System.out.println("✓ Created " + permissions.size() + " permissions");
        return permissions;
    }

    private Permission savePermission(String code, String name, String description, String category) {
        Permission p = new Permission(code, name, description, category);
        return permissionRepository.save(p);
    }

    private Map<String, Role> createRoles(Map<String, Permission> permissions) {
        Map<String, Role> roles = new HashMap<>();
        
        // ===== ADMIN ROLE - Full access to everything =====
        Role admin = new Role("ADMIN", "Full system access");
        admin.setIsSystemRole(true);
        // Add ALL permissions to admin
        permissions.values().forEach(admin::addPermission);
        roles.put("ADMIN", roleRepository.save(admin));
        System.out.println("✓ Created ADMIN role with " + permissions.size() + " permissions");
        
        // ===== MANAGER ROLE - Operations management =====
        Role manager = new Role("MANAGER", "Operations manager");
        manager.setIsSystemRole(true);
        addPermissionsToRole(manager, permissions,
            "users.read",
            "transfers.create", "transfers.read", "transfers.update", "transfers.approve",
            "inventory.create", "inventory.read", "inventory.update",
            "reports.read", "reports.export",
            "audit.read",
            "suppliers.create", "suppliers.read", "suppliers.update",
            "analytics.read",
            "documents.create", "documents.read", "documents.update"
        );
        roles.put("MANAGER", roleRepository.save(manager));
        System.out.println("✓ Created MANAGER role with " + manager.getPermissions().size() + " permissions");
        
        // ===== WAREHOUSE_CLERK ROLE - Inventory and transfers =====
        Role clerk = new Role("WAREHOUSE_CLERK", "Warehouse operations");
        clerk.setIsSystemRole(true);
        addPermissionsToRole(clerk, permissions,
            "transfers.create", "transfers.read", "transfers.update",
            "inventory.create", "inventory.read", "inventory.update",
            "suppliers.read",
            "documents.read"
        );
        roles.put("WAREHOUSE_CLERK", roleRepository.save(clerk));
        System.out.println("✓ Created WAREHOUSE_CLERK role with " + clerk.getPermissions().size() + " permissions");
        
        // ===== AUDITOR ROLE - Read-only audit access =====
        Role auditor = new Role("AUDITOR", "Audit and compliance");
        auditor.setIsSystemRole(true);
        addPermissionsToRole(auditor, permissions,
            "users.read",
            "transfers.read",
            "inventory.read",
            "reports.read", "reports.export",
            "audit.read",
            "suppliers.read",
            "analytics.read",
            "documents.read"
        );
        roles.put("AUDITOR", roleRepository.save(auditor));
        System.out.println("✓ Created AUDITOR role with " + auditor.getPermissions().size() + " permissions");
        
        // ===== VIEWER ROLE - Basic read access =====
        Role viewer = new Role("VIEWER", "View only access");
        viewer.setIsSystemRole(true);
        addPermissionsToRole(viewer, permissions,
            "inventory.read",
            "transfers.read",
            "reports.read"
        );
        roles.put("VIEWER", roleRepository.save(viewer));
        System.out.println("✓ Created VIEWER role with " + viewer.getPermissions().size() + " permissions");
        
        return roles;
    }

    private void addPermissionsToRole(Role role, Map<String, Permission> permissions, String... codes) {
        for (String code : codes) {
            Permission p = permissions.get(code);
            if (p != null) {
                role.addPermission(p);
            }
        }
    }

    private void createDemoUsers(Map<String, Role> roles) {
        if (userRepository.count() > 0) {
            System.out.println("Users already exist, skipping user creation");
            return;
        }
        
        createUser("admin", "admin123", "System Administrator", "admin@company.com", roles.get("ADMIN"));
        createUser("manager", "manager123", "Operations Manager", "manager@company.com", roles.get("MANAGER"));
        createUser("clerk", "clerk123", "Warehouse Clerk", "clerk@company.com", roles.get("WAREHOUSE_CLERK"));
        createUser("auditor", "auditor123", "Internal Auditor", "auditor@company.com", roles.get("AUDITOR"));
        createUser("viewer", "viewer123", "Guest Viewer", "viewer@company.com", roles.get("VIEWER"));
        
        System.out.println("✓ Created 5 demo users: admin, manager, clerk, auditor, viewer");
    }

    private void createUser(String username, String password, String name, String email, Role role) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(password);  // Note: In production, use password encoder!
        user.setName(name);
        user.setEmail(email);
        user.setRole(role);
        user.setActive(true);
        userRepository.save(user);
    }
}
