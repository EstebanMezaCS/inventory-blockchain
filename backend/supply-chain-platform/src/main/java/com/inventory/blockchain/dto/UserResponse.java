package com.inventory.blockchain.dto;

import java.time.LocalDateTime;

public record UserResponse(
    Long id,
    String username,
    String email,
    String fullName,
    RoleResponse role,
    Boolean isActive,
    LocalDateTime createdAt,
    LocalDateTime lastLogin
) {}
