package com.inventory.blockchain.dto;

import java.time.LocalDateTime;

public record ActivityLogResponse(
    Long id,
    String username,
    String action,
    String entityType,
    String entityId,
    LocalDateTime createdAt,
    String ipAddress
) {}
