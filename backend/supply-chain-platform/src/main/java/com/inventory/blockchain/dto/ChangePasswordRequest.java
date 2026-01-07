package com.inventory.blockchain.dto;

public record ChangePasswordRequest(
    String currentPassword,
    String newPassword
) {}
