package com.inventory.blockchain.dto;

import java.util.List;

public record LoginResponse(
    UserResponse user,
    String token,
    List<String> permissions
) {}
