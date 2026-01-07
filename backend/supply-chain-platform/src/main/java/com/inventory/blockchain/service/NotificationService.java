package com.inventory.blockchain.service;

import com.inventory.blockchain.entity.*;
import com.inventory.blockchain.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // ==================== TRANSFER NOTIFICATIONS ====================

    public void notifyTransferCreated(Transfer transfer) {
        log.info("Creating notification for new transfer: {}", transfer.getTransferId());
        
        createNotificationForAllAdmins(
            "TRANSFER",
            "New Transfer Created",
            String.format("Transfer %s created: %s → %s", 
                transfer.getTransferId(), 
                transfer.getFromLocation(), 
                transfer.getToLocation()),
            "📦",
            "NORMAL",
            transfer.getTransferId(),
            "TRANSFER"
        );
    }

    public void notifyTransferStatusChanged(Transfer transfer, String oldStatus, String newStatus) {
        log.info("Creating notification for transfer status change: {} -> {}", oldStatus, newStatus);
        
        String icon = getStatusIcon(newStatus);
        String priority = "NORMAL";
        
        if ("DELIVERED".equals(newStatus)) {
            priority = "NORMAL";
        } else if ("CANCELLED".equals(newStatus) || "FAILED".equals(newStatus)) {
            priority = "HIGH";
        }

        createNotificationForAllAdmins(
            "TRANSFER",
            String.format("Transfer %s", formatStatus(newStatus)),
            String.format("Transfer %s is now %s (%s → %s)", 
                transfer.getTransferId(),
                formatStatus(newStatus),
                transfer.getFromLocation(), 
                transfer.getToLocation()),
            icon,
            priority,
            transfer.getTransferId(),
            "TRANSFER"
        );
    }

    // ==================== ORDER NOTIFICATIONS ====================

    public void notifyOrderCreated(PurchaseOrder order) {
        log.info("Creating notification for new order: {}", order.getPoNumber());
        
        createNotificationForAllAdmins(
            "ORDER",
            "New Purchase Order",
            String.format("Purchase Order %s created for %s", 
                order.getPoNumber(),
                order.getSupplier() != null ? order.getSupplier().getName() : "Unknown"),
            "📋",
            "NORMAL",
            order.getPoNumber(),
            "PURCHASE_ORDER"
        );
    }

    public void notifyOrderStatusChanged(PurchaseOrder order, String newStatus) {
        log.info("Creating notification for order status change: {}", newStatus);
        
        String icon = "📋";
        if ("SHIPPED".equals(newStatus)) icon = "📤";
        else if ("DELIVERED".equals(newStatus)) icon = "✅";
        else if ("CANCELLED".equals(newStatus)) icon = "❌";

        createNotificationForAllAdmins(
            "ORDER",
            String.format("Order %s", formatStatus(newStatus)),
            String.format("Purchase Order %s is now %s", order.getPoNumber(), formatStatus(newStatus)),
            icon,
            "NORMAL",
            order.getPoNumber(),
            "PURCHASE_ORDER"
        );
    }

    // ==================== INVENTORY NOTIFICATIONS ====================

    public void notifyLowStock(String sku, String productName, int currentQty, String location) {
        log.info("Creating low stock notification for: {} at {}", sku, location);
        
        createNotificationForAllAdmins(
            "INVENTORY",
            "Low Stock Alert",
            String.format("%s is running low (%d units) at %s", productName, currentQty, location),
            "⚠️",
            "HIGH",
            sku,
            "PRODUCT"
        );
    }

    // ==================== SYSTEM NOTIFICATIONS ====================

    public void notifyUserLogin(User user) {
        // Create a welcome notification for the user
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType("SYSTEM");
        notification.setTitle("Welcome back!");
        notification.setMessage("You have successfully logged in.");
        notification.setIcon("👋");
        notification.setPriority("LOW");
        notificationRepository.save(notification);
    }

    public void notifySupplierAdded(Supplier supplier) {
        createNotificationForAllAdmins(
            "ALERT",
            "New Supplier Added",
            String.format("%s has been added as a new supplier", supplier.getName()),
            "🏭",
            "LOW",
            String.valueOf(supplier.getId()),
            "SUPPLIER"
        );
    }

    // ==================== HELPER METHODS ====================

    private void createNotificationForAllAdmins(String type, String title, String message, 
            String icon, String priority, String referenceId, String referenceType) {
        
        // Get all admin users (or you could notify all users)
        userRepository.findAll().forEach(user -> {
            // Check if user wants this type of notification (simplified - notify all for now)
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setType(type);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setIcon(icon);
            notification.setPriority(priority);
            notification.setReferenceId(referenceId);
            notification.setReferenceType(referenceType);
            notificationRepository.save(notification);
        });
    }

    private String getStatusIcon(String status) {
        return switch (status) {
            case "REQUESTED" -> "📋";
            case "CONFIRMED" -> "✓";
            case "IN_TRANSIT" -> "🚚";
            case "DELIVERED" -> "✅";
            case "CANCELLED" -> "❌";
            case "FAILED" -> "⚠️";
            default -> "📦";
        };
    }

    private String formatStatus(String status) {
        if (status == null) return "";
        return status.replace("_", " ").toLowerCase();
        // e.g., "IN_TRANSIT" -> "in transit"
    }
}
