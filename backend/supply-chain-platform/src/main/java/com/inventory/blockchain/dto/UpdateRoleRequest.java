package com.inventory.blockchain.dto;

import java.util.Set;

public record UpdateRoleRequest(
    String description,
    Set<String> permissionCodes
) {}
