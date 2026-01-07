package com.inventory.blockchain.exception;

public class InsufficientStockException extends RuntimeException {

    private final String location;
    private final String sku;
    private final int requested;
    private final int available;

    public InsufficientStockException(String location, String sku, int requested, int available) {
        super(String.format("Insufficient stock at %s for SKU %s. Requested: %d, Available: %d",
                location, sku, requested, available));
        this.location = location;
        this.sku = sku;
        this.requested = requested;
        this.available = available;
    }

    public String getLocation() {
        return location;
    }

    public String getSku() {
        return sku;
    }

    public int getRequested() {
        return requested;
    }

    public int getAvailable() {
        return available;
    }
}
