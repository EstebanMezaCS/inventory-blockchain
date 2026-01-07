package com.inventory.blockchain.controller;

import com.inventory.blockchain.entity.*;
import com.inventory.blockchain.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;

    public NotificationController(
            NotificationRepository notificationRepository,
            NotificationPreferenceRepository preferenceRepository,
            UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.preferenceRepository = preferenceRepository;
        this.userRepository = userRepository;
    }

    // ==================== NOTIFICATIONS ====================

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getUserNotifications(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "50") int limit) {
        log.info("GET /api/notifications/user/{} - limit={}", userId, limit);

        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        List<Map<String, Object>> result = notifications.stream()
            .limit(limit)
            .map(this::mapNotificationToResponse)
            .toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<Map<String, Object>>> getUnreadNotifications(@PathVariable Long userId) {
        log.info("GET /api/notifications/user/{}/unread", userId);

        List<Notification> notifications = notificationRepository.findUnreadByUserId(userId);
        
        List<Map<String, Object>> result = notifications.stream()
            .map(this::mapNotificationToResponse)
            .toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(@PathVariable Long userId) {
        log.info("GET /api/notifications/user/{}/count", userId);

        long count = notificationRepository.countUnreadByUserId(userId);
        
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createNotification(@RequestBody CreateNotificationRequest request) {
        log.info("POST /api/notifications - title={}, userId={}", request.title, request.userId);

        Notification notification = new Notification();
        notification.setType(request.type != null ? request.type : "SYSTEM");
        notification.setTitle(request.title);
        notification.setMessage(request.message);
        notification.setIcon(request.icon);
        notification.setLink(request.link);
        notification.setReferenceId(request.referenceId);
        notification.setReferenceType(request.referenceType);
        notification.setPriority(request.priority != null ? request.priority : "NORMAL");

        if (request.userId != null) {
            userRepository.findById(request.userId).ifPresent(notification::setUser);
        }

        Notification saved = notificationRepository.save(notification);
        return ResponseEntity.ok(mapNotificationToResponse(saved));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long id) {
        log.info("PUT /api/notifications/{}/read", id);

        notificationRepository.markAsRead(id);
        
        return notificationRepository.findById(id)
            .map(n -> ResponseEntity.ok(mapNotificationToResponse(n)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(@PathVariable Long userId) {
        log.info("PUT /api/notifications/user/{}/read-all", userId);

        int updated = notificationRepository.markAllAsReadByUserId(userId);
        
        return ResponseEntity.ok(Map.of(
            "message", "Marked all as read",
            "count", updated
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteNotification(@PathVariable Long id) {
        log.info("DELETE /api/notifications/{}", id);

        if (notificationRepository.existsById(id)) {
            notificationRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Notification deleted"));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/user/{userId}/all")
    public ResponseEntity<Map<String, Object>> clearAllNotifications(@PathVariable Long userId) {
        log.info("DELETE /api/notifications/user/{}/all", userId);

        notificationRepository.deleteByUserId(userId);
        return ResponseEntity.ok(Map.of("message", "All notifications cleared"));
    }

    // ==================== PREFERENCES ====================

    @GetMapping("/preferences/{userId}")
    public ResponseEntity<Map<String, Object>> getPreferences(@PathVariable Long userId) {
        log.info("GET /api/notifications/preferences/{}", userId);

        return preferenceRepository.findByUserId(userId)
            .map(pref -> {
                Map<String, Object> result = new HashMap<>();
                result.put("id", pref.getId());
                result.put("userId", userId);
                result.put("transferUpdates", pref.getTransferUpdates());
                result.put("inventoryAlerts", pref.getInventoryAlerts());
                result.put("orderUpdates", pref.getOrderUpdates());
                result.put("systemAlerts", pref.getSystemAlerts());
                result.put("emailNotifications", pref.getEmailNotifications());
                return ResponseEntity.ok(result);
            })
            .orElseGet(() -> {
                // Return defaults if no preferences exist
                Map<String, Object> defaults = new HashMap<>();
                defaults.put("userId", userId);
                defaults.put("transferUpdates", true);
                defaults.put("inventoryAlerts", true);
                defaults.put("orderUpdates", true);
                defaults.put("systemAlerts", true);
                defaults.put("emailNotifications", false);
                return ResponseEntity.ok(defaults);
            });
    }

    @PutMapping("/preferences/{userId}")
    public ResponseEntity<Map<String, Object>> updatePreferences(
            @PathVariable Long userId,
            @RequestBody UpdatePreferencesRequest request) {
        log.info("PUT /api/notifications/preferences/{}", userId);

        NotificationPreference pref = preferenceRepository.findByUserId(userId)
            .orElseGet(() -> {
                NotificationPreference newPref = new NotificationPreference();
                userRepository.findById(userId).ifPresent(newPref::setUser);
                return newPref;
            });

        if (request.transferUpdates != null) pref.setTransferUpdates(request.transferUpdates);
        if (request.inventoryAlerts != null) pref.setInventoryAlerts(request.inventoryAlerts);
        if (request.orderUpdates != null) pref.setOrderUpdates(request.orderUpdates);
        if (request.systemAlerts != null) pref.setSystemAlerts(request.systemAlerts);
        if (request.emailNotifications != null) pref.setEmailNotifications(request.emailNotifications);

        NotificationPreference saved = preferenceRepository.save(pref);

        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("userId", userId);
        result.put("transferUpdates", saved.getTransferUpdates());
        result.put("inventoryAlerts", saved.getInventoryAlerts());
        result.put("orderUpdates", saved.getOrderUpdates());
        result.put("systemAlerts", saved.getSystemAlerts());
        result.put("emailNotifications", saved.getEmailNotifications());

        return ResponseEntity.ok(result);
    }

    // ==================== HELPER METHODS ====================

    private Map<String, Object> mapNotificationToResponse(Notification n) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", n.getId());
        map.put("type", n.getType());
        map.put("title", n.getTitle());
        map.put("message", n.getMessage());
        map.put("icon", n.getIcon());
        map.put("link", n.getLink());
        map.put("referenceId", n.getReferenceId());
        map.put("referenceType", n.getReferenceType());
        map.put("priority", n.getPriority());
        map.put("isRead", n.getIsRead());
        map.put("readAt", n.getReadAt());
        map.put("createdAt", n.getCreatedAt());
        return map;
    }

    // ==================== REQUEST DTOs ====================

    public static class CreateNotificationRequest {
        public Long userId;
        public String type;
        public String title;
        public String message;
        public String icon;
        public String link;
        public String referenceId;
        public String referenceType;
        public String priority;
    }

    public static class UpdatePreferencesRequest {
        public Boolean transferUpdates;
        public Boolean inventoryAlerts;
        public Boolean orderUpdates;
        public Boolean systemAlerts;
        public Boolean emailNotifications;
    }
}
