package com.inventory.blockchain.exception;

public class TransferNotFoundException extends RuntimeException {

    private final String transferId;

    public TransferNotFoundException(String transferId) {
        super("Transfer with ID '" + transferId + "' not found");
        this.transferId = transferId;
    }

    public String getTransferId() {
        return transferId;
    }
}
