package com.inventory.blockchain.exception;

public class BlockchainTransactionException extends RuntimeException {

    private final String transferId;
    private final String txHash;

    public BlockchainTransactionException(String message, String transferId) {
        super(message);
        this.transferId = transferId;
        this.txHash = null;
    }

    public BlockchainTransactionException(String message, String transferId, Throwable cause) {
        super(message, cause);
        this.transferId = transferId;
        this.txHash = null;
    }

    public BlockchainTransactionException(String message, String transferId, String txHash) {
        super(message);
        this.transferId = transferId;
        this.txHash = txHash;
    }

    public String getTransferId() {
        return transferId;
    }

    public String getTxHash() {
        return txHash;
    }
}
