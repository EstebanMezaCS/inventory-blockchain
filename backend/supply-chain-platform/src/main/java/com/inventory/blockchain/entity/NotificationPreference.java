package com.inventory.blockchain.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "notification_preferences")
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(name = "transfer_updates")
    private Boolean transferUpdates = true;

    @Column(name = "inventory_alerts")
    private Boolean inventoryAlerts = true;

    @Column(name = "order_updates")
    private Boolean orderUpdates = true;

    @Column(name = "system_alerts")
    private Boolean systemAlerts = true;

    @Column(name = "email_notifications")
    private Boolean emailNotifications = false;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public NotificationPreference() {
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Boolean getTransferUpdates() { return transferUpdates; }
    public void setTransferUpdates(Boolean transferUpdates) { this.transferUpdates = transferUpdates; }

    public Boolean getInventoryAlerts() { return inventoryAlerts; }
    public void setInventoryAlerts(Boolean inventoryAlerts) { this.inventoryAlerts = inventoryAlerts; }

    public Boolean getOrderUpdates() { return orderUpdates; }
    public void setOrderUpdates(Boolean orderUpdates) { this.orderUpdates = orderUpdates; }

    public Boolean getSystemAlerts() { return systemAlerts; }
    public void setSystemAlerts(Boolean systemAlerts) { this.systemAlerts = systemAlerts; }

    public Boolean getEmailNotifications() { return emailNotifications; }
    public void setEmailNotifications(Boolean emailNotifications) { this.emailNotifications = emailNotifications; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
