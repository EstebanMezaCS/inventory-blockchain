package com.inventory.blockchain.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record TransferRequest(
        @NotBlank(message = "Transfer ID is required")
        String transferId,

        @NotBlank(message = "From location is required")
        String fromLocation,

        @NotBlank(message = "To location is required")
        String toLocation,

        @NotEmpty(message = "Items list cannot be empty")
        @Valid
        List<TransferItem> items
) {
}
