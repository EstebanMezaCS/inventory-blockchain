package com.inventory.blockchain.dto;

public record UpdateUserRequest(
    String email,
    String fullName,
    Long roleId,
    Boolean isActive
) {}
