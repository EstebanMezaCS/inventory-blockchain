package com.inventory.blockchain.dto;

public record CreateUserRequest(
    String username,
    String email,
    String password,
    String fullName,
    Long roleId
) {}
