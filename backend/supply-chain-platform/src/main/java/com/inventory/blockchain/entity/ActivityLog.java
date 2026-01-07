package com.inventory.blockchain.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "activity_logs")
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 50)
    private String action;

    @Column(name = "entity_type", length = 50)
    private String entityType;

    @Column(name = "entity_id", length = 100)
    private String entityId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> details;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public ActivityLog() {
        this.createdAt = LocalDateTime.now();
    }

    public ActivityLog(User user, String action, String entityType, String entityId) {
        this();
        this.user = user;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
    }

    // Static factory methods for common actions
    public static ActivityLog login(User user, String ipAddress) {
        ActivityLog log = new ActivityLog(user, "LOGIN", "USER", user.getId().toString());
        log.setIpAddress(ipAddress);
        return log;
    }

    public static ActivityLog logout(User user) {
        return new ActivityLog(user, "LOGOUT", "USER", user.getId().toString());
    }

    public static ActivityLog createUser(User actor, User createdUser) {
        return new ActivityLog(actor, "CREATE", "USER", createdUser.getId().toString());
    }

    public static ActivityLog updateUser(User actor, User updatedUser) {
        return new ActivityLog(actor, "UPDATE", "USER", updatedUser.getId().toString());
    }

    public static ActivityLog deleteUser(User actor, Long deletedUserId) {
        return new ActivityLog(actor, "DELETE", "USER", deletedUserId.toString());
    }

    public static ActivityLog createTransfer(User user, String transferId) {
        return new ActivityLog(user, "CREATE", "TRANSFER", transferId);
    }

    public static ActivityLog updateTransfer(User user, String transferId, String newStatus) {
        ActivityLog log = new ActivityLog(user, "UPDATE_STATUS", "TRANSFER", transferId);
        log.setDetails(Map.of("newStatus", newStatus));
        return log;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }

    public Map<String, Object> getDetails() { return details; }
    public void setDetails(Map<String, Object> details) { this.details = details; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
