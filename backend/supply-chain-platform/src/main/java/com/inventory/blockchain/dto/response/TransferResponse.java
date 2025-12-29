package com.inventory.blockchain.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record TransferResponse(
        String transferId,
        String fromLocation,
        String toLocation,
        String status,
        String itemsHash,
        String contractAddress,
        String txHash,
        Long blockNumber,
        String createdAt,
        String errorMessage
) {

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String transferId;
        private String fromLocation;
        private String toLocation;
        private String status;
        private String itemsHash;
        private String contractAddress;
        private String txHash;
        private Long blockNumber;
        private String createdAt;
        private String errorMessage;

        public Builder transferId(String transferId) {
            this.transferId = transferId;
            return this;
        }

        public Builder fromLocation(String fromLocation) {
            this.fromLocation = fromLocation;
            return this;
        }

        public Builder toLocation(String toLocation) {
            this.toLocation = toLocation;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder itemsHash(String itemsHash) {
            this.itemsHash = itemsHash;
            return this;
        }

        public Builder contractAddress(String contractAddress) {
            this.contractAddress = contractAddress;
            return this;
        }

        public Builder txHash(String txHash) {
            this.txHash = txHash;
            return this;
        }

        public Builder blockNumber(Long blockNumber) {
            this.blockNumber = blockNumber;
            return this;
        }

        public Builder createdAt(String createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder errorMessage(String errorMessage) {
            this.errorMessage = errorMessage;
            return this;
        }

        public TransferResponse build() {
            return new TransferResponse(
                    transferId,
                    fromLocation,
                    toLocation,
                    status,
                    itemsHash,
                    contractAddress,
                    txHash,
                    blockNumber,
                    createdAt,
                    errorMessage
            );
        }
    }
}
