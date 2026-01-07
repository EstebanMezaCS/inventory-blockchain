package com.inventory.blockchain.dto;

import java.util.Set;

public record RoleResponse(
    Long id,
    String name,
    String description,
    Boolean isSystemRole,
    Set<String> permissions
) {}
