package com.inventory.blockchain.service;

import com.inventory.blockchain.entity.Inventory;
import com.inventory.blockchain.exception.InsufficientStockException;
import com.inventory.blockchain.repository.InventoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {

    private static final Logger log = LoggerFactory.getLogger(InventoryService.class);

    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    // ==================== READ OPERATIONS ====================

    @Transactional(readOnly = true)
    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Inventory> getInventoryByLocation(String location) {
        return inventoryRepository.findByLocationOrderByProductNameAsc(location);
    }

    @Transactional(readOnly = true)
    public Optional<Inventory> getInventoryItem(String location, String sku) {
        return inventoryRepository.findByLocationAndSku(location, sku);
    }

    @Transactional(readOnly = true)
    public List<Inventory> getLowStockItems() {
        return inventoryRepository.findLowStockItems();
    }

    @Transactional(readOnly = true)
    public List<String> getAllLocations() {
        return inventoryRepository.findAllLocations();
    }

    @Transactional(readOnly = true)
    public List<String> getAllSkus() {
        return inventoryRepository.findAllSkus();
    }

    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        return inventoryRepository.findAllCategories();
    }

    // ==================== VALIDATION ====================

    /**
     * Check if sufficient stock exists for a transfer
     * @return true if stock is available, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean hasStock(String location, String sku, int quantity) {
        Optional<Integer> currentStock = inventoryRepository.getQuantity(location, sku);
        return currentStock.isPresent() && currentStock.get() >= quantity;
    }

    /**
     * Get current stock level
     */
    @Transactional(readOnly = true)
    public int getStockLevel(String location, String sku) {
        return inventoryRepository.getQuantity(location, sku).orElse(0);
    }

    /**
     * Validate stock for multiple items (used before creating transfer)
     * @throws InsufficientStockException if any item has insufficient stock
     */
    @Transactional(readOnly = true)
    public void validateStock(String location, List<TransferItem> items) {
        for (TransferItem item : items) {
            int available = getStockLevel(location, item.getSku());
            if (available < item.getQty()) {
                log.warn("Insufficient stock: location={}, sku={}, requested={}, available={}",
                        location, item.getSku(), item.getQty(), available);
                throw new InsufficientStockException(location, item.getSku(), item.getQty(), available);
            }
        }
        log.info("Stock validation passed for {} items at {}", items.size(), location);
    }

    // ==================== STOCK OPERATIONS ====================

    /**
     * Deduct stock when transfer is confirmed (atomic operation)
     */
    @Transactional
    public void deductStock(String location, String sku, int amount) {
        log.info("Deducting stock: location={}, sku={}, amount={}", location, sku, amount);
        
        int updated = inventoryRepository.deductStock(location, sku, amount);
        
        if (updated == 0) {
            int available = getStockLevel(location, sku);
            throw new InsufficientStockException(location, sku, amount, available);
        }
        
        log.info("Stock deducted successfully: location={}, sku={}, amount={}", location, sku, amount);
    }

    /**
     * Add stock when transfer is delivered (atomic operation)
     */
    @Transactional
    public void addStock(String location, String sku, int amount) {
        log.info("Adding stock: location={}, sku={}, amount={}", location, sku, amount);
        
        int updated = inventoryRepository.addStock(location, sku, amount);
        
        if (updated == 0) {
            // Item doesn't exist at destination - create it
            log.info("Creating new inventory entry at destination: location={}, sku={}", location, sku);
            Optional<Inventory> sourceItem = inventoryRepository.findBySkuOrderByLocationAsc(sku)
                    .stream().findFirst();
            
            if (sourceItem.isPresent()) {
                Inventory source = sourceItem.get();
                Inventory newItem = new Inventory(
                        location,
                        sku,
                        source.getProductName(),
                        source.getCategory(),
                        amount,
                        source.getMinStock(),
                        source.getUnit(),
                        source.getPrice()
                );
                inventoryRepository.save(newItem);
                log.info("New inventory entry created: {}", newItem);
            }
        } else {
            log.info("Stock added successfully: location={}, sku={}, amount={}", location, sku, amount);
        }
    }

    /**
     * Process transfer: deduct from source, will add to destination on delivery
     */
    @Transactional
    public void processTransferDeduction(String fromLocation, List<TransferItem> items) {
        log.info("Processing transfer deduction from {}", fromLocation);
        
        // First validate all items have sufficient stock
        validateStock(fromLocation, items);
        
        // Then deduct all items
        for (TransferItem item : items) {
            deductStock(fromLocation, item.getSku(), item.getQty());
        }
        
        log.info("Transfer deduction completed for {} items", items.size());
    }

    /**
     * Complete transfer: add stock to destination
     */
    @Transactional
    public void processTransferDelivery(String toLocation, List<TransferItem> items) {
        log.info("Processing transfer delivery to {}", toLocation);
        
        for (TransferItem item : items) {
            addStock(toLocation, item.getSku(), item.getQty());
        }
        
        log.info("Transfer delivery completed for {} items", items.size());
    }

    /**
     * Rollback transfer: add stock back to source (if transfer cancelled)
     */
    @Transactional
    public void rollbackTransfer(String fromLocation, List<TransferItem> items) {
        log.info("Rolling back transfer to {}", fromLocation);
        
        for (TransferItem item : items) {
            addStock(fromLocation, item.getSku(), item.getQty());
        }
        
        log.info("Transfer rollback completed for {} items", items.size());
    }

    // ==================== INNER CLASS ====================

    /**
     * Simple class to hold transfer item data
     */
    public static class TransferItem {
        private String sku;
        private int qty;

        public TransferItem() {}

        public TransferItem(String sku, int qty) {
            this.sku = sku;
            this.qty = qty;
        }

        public String getSku() {
            return sku;
        }

        public void setSku(String sku) {
            this.sku = sku;
        }

        public int getQty() {
            return qty;
        }

        public void setQty(int qty) {
            this.qty = qty;
        }
    }
}
