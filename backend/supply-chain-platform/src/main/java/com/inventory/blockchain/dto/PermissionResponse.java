package com.inventory.blockchain.dto;

public record PermissionResponse(
    Long id,
    String code,
    String name,
    String description,
    String category
) {}
