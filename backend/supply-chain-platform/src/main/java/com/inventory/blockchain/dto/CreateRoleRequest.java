package com.inventory.blockchain.dto;

import java.util.Set;

public record CreateRoleRequest(
    String name,
    String description,
    Set<String> permissionCodes
) {}
