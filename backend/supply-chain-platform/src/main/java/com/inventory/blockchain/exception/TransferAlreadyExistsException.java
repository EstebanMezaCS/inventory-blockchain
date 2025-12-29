package com.inventory.blockchain.exception;

public class TransferAlreadyExistsException extends RuntimeException {

    private final String transferId;

    public TransferAlreadyExistsException(String transferId) {
        super("Transfer with ID '" + transferId + "' already exists");
        this.transferId = transferId;
    }

    public String getTransferId() {
        return transferId;
    }
}
