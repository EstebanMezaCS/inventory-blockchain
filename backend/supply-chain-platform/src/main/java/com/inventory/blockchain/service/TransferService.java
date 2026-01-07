package com.inventory.blockchain.service;

import com.inventory.blockchain.dto.TransferItem;
import com.inventory.blockchain.dto.TransferRequest;
import com.inventory.blockchain.dto.TransferResponse;
import com.inventory.blockchain.entity.Transfer;
import com.inventory.blockchain.exception.BlockchainTransactionException;
import com.inventory.blockchain.exception.InsufficientStockException;
import com.inventory.blockchain.exception.TransferAlreadyExistsException;
import com.inventory.blockchain.exception.TransferNotFoundException;
import com.inventory.blockchain.repository.InventoryRepository;
import com.inventory.blockchain.repository.TransferRepository;
import com.inventory.blockchain.util.ItemsHashUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.web3j.protocol.core.methods.response.TransactionReceipt;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TransferService {

    private static final Logger log = LoggerFactory.getLogger(TransferService.class);

    // Valid statuses
    public static final String STATUS_REQUESTED = "REQUESTED";
    public static final String STATUS_CONFIRMED = "CONFIRMED";
    public static final String STATUS_IN_TRANSIT = "IN_TRANSIT";
    public static final String STATUS_DELIVERED = "DELIVERED";
    public static final String STATUS_CANCELLED = "CANCELLED";
    public static final String STATUS_FAILED = "FAILED";

    private static final Set<String> VALID_STATUSES = Set.of(
            STATUS_REQUESTED, STATUS_CONFIRMED, STATUS_IN_TRANSIT,
            STATUS_DELIVERED, STATUS_CANCELLED, STATUS_FAILED
    );

    private final TransferRepository transferRepository;
    private final InventoryRepository inventoryRepository;
    private final BlockchainService blockchainService;
    private final ItemsHashUtil itemsHashUtil;

    public TransferService(
            TransferRepository transferRepository,
            InventoryRepository inventoryRepository,
            BlockchainService blockchainService,
            ItemsHashUtil itemsHashUtil) {
        this.transferRepository = transferRepository;
        this.inventoryRepository = inventoryRepository;
        this.blockchainService = blockchainService;
        this.itemsHashUtil = itemsHashUtil;
    }

    @Transactional(readOnly = true)
    public List<TransferResponse> getAllTransfers() {
        log.debug("Fetching all transfers");
        return transferRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::buildResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TransferResponse createTransfer(TransferRequest request) {
        String transferId = request.transferId();
        String fromLocation = request.fromLocation();
        log.info("Creating transfer request: transferId={}, from={}", transferId, fromLocation);

        // Check if transfer already exists
        if (transferRepository.existsByTransferId(transferId)) {
            log.warn("Transfer already exists: transferId={}", transferId);
            throw new TransferAlreadyExistsException(transferId);
        }

        // ============================================
        // INVENTORY VALIDATION - Check stock BEFORE blockchain
        // ============================================
        log.info("Validating inventory for transfer: {}", transferId);
        validateInventoryForTransfer(fromLocation, request.items());
        log.info("Inventory validation passed for transfer: {}", transferId);

        String itemsHash = itemsHashUtil.computeItemsHash(request.items());
        log.info("Computed itemsHash={} for transferId={}", itemsHash, transferId);

        String contractAddress = blockchainService.getContractAddress();

        Transfer transfer = createInitialTransfer(
                transferId,
                fromLocation,
                request.toLocation(),
                itemsHash,
                contractAddress
        );

        try {
            byte[] itemsHashBytes = itemsHashUtil.hashToBytes32(itemsHash);

            TransactionReceipt receipt = blockchainService.requestTransfer(
                    transferId,
                    fromLocation,
                    request.toLocation(),
                    itemsHashBytes
            );

            // ============================================
            // DEDUCT INVENTORY - Only after blockchain confirms
            // ============================================
            log.info("Blockchain confirmed, deducting inventory for transfer: {}", transferId);
            deductInventoryForTransfer(fromLocation, request.items());
            log.info("Inventory deducted for transfer: {}", transferId);

            transfer = updateTransferWithReceipt(transferId, receipt);

            log.info("Transfer created successfully: transferId={}, txHash={}, blockNumber={}",
                    transferId, transfer.getTxHash(), transfer.getBlockNumber());

            return buildResponse(transfer);

        } catch (BlockchainTransactionException e) {
            markTransferFailed(transferId, e.getMessage());
            throw e;
        }
    }

    /**
     * Validate that all items have sufficient stock at source location
     */
    private void validateInventoryForTransfer(String fromLocation, List<TransferItem> items) {
        for (TransferItem item : items) {
            String sku = item.sku();
            int requestedQty = item.qty();

            int availableQty = inventoryRepository.getQuantity(fromLocation, sku).orElse(0);

            if (availableQty < requestedQty) {
                log.error("Insufficient stock: location={}, sku={}, requested={}, available={}",
                        fromLocation, sku, requestedQty, availableQty);
                throw new InsufficientStockException(fromLocation, sku, requestedQty, availableQty);
            }

            log.debug("Stock check passed: location={}, sku={}, requested={}, available={}",
                    fromLocation, sku, requestedQty, availableQty);
        }
    }

    /**
     * Deduct inventory from source location after blockchain confirmation
     */
    private void deductInventoryForTransfer(String fromLocation, List<TransferItem> items) {
        for (TransferItem item : items) {
            int updated = inventoryRepository.deductStock(fromLocation, item.sku(), item.qty());
            if (updated == 0) {
                // This shouldn't happen if validation passed, but just in case
                int available = inventoryRepository.getQuantity(fromLocation, item.sku()).orElse(0);
                throw new InsufficientStockException(fromLocation, item.sku(), item.qty(), available);
            }
            log.debug("Deducted {} of {} from {}", item.qty(), item.sku(), fromLocation);
        }
    }

    /**
     * Add inventory to destination location when delivered
     */
    private void addInventoryForDelivery(String toLocation, String fromLocation, List<TransferItem> items) {
        for (TransferItem item : items) {
            int updated = inventoryRepository.addStock(toLocation, item.sku(), item.qty());
            
            if (updated == 0) {
                // Item doesn't exist at destination - create it
                log.info("Creating new inventory entry at {}: sku={}", toLocation, item.sku());
                inventoryRepository.findByLocationAndSku(fromLocation, item.sku())
                        .ifPresent(sourceInventory -> {
                            com.inventory.blockchain.entity.Inventory newInventory = 
                                    new com.inventory.blockchain.entity.Inventory(
                                            toLocation,
                                            item.sku(),
                                            sourceInventory.getProductName(),
                                            sourceInventory.getCategory(),
                                            item.qty(),
                                            sourceInventory.getMinStock(),
                                            sourceInventory.getUnit(),
                                            sourceInventory.getPrice()
                                    );
                            inventoryRepository.save(newInventory);
                        });
            }
            log.debug("Added {} of {} to {}", item.qty(), item.sku(), toLocation);
        }
    }

    /**
     * Rollback inventory if transfer is cancelled
     */
    private void rollbackInventory(String fromLocation, List<TransferItem> items) {
        for (TransferItem item : items) {
            inventoryRepository.addStock(fromLocation, item.sku(), item.qty());
            log.debug("Rolled back {} of {} to {}", item.qty(), item.sku(), fromLocation);
        }
    }

    @Transactional(readOnly = true)
    public TransferResponse getTransfer(String transferId) {
        log.debug("Fetching transfer: transferId={}", transferId);

        Transfer transfer = transferRepository.findByTransferId(transferId)
                .orElseThrow(() -> new TransferNotFoundException(transferId));

        return buildResponse(transfer);
    }

    @Transactional
    public TransferResponse updateStatus(String transferId, String newStatus) {
        log.info("Updating transfer status: transferId={}, newStatus={}", transferId, newStatus);

        if (!VALID_STATUSES.contains(newStatus)) {
            throw new IllegalArgumentException("Invalid status: " + newStatus +
                    ". Valid statuses are: " + VALID_STATUSES);
        }

        Transfer transfer = transferRepository.findByTransferId(transferId)
                .orElseThrow(() -> new TransferNotFoundException(transferId));

        String currentStatus = transfer.getStatus();

        // Validate status transition
        validateStatusTransition(currentStatus, newStatus);

        // Handle inventory changes based on status
        // Note: We need the items to handle inventory, but they're stored as hash
        // For now, we'll skip inventory updates on status change
        // TODO: Store items in transfer or separate table for full tracking

        transfer.setStatus(newStatus);
        Transfer updated = transferRepository.save(transfer);

        log.info("Transfer status updated: transferId={}, oldStatus={}, newStatus={}",
                transferId, currentStatus, newStatus);

        return buildResponse(updated);
    }

    private void validateStatusTransition(String currentStatus, String newStatus) {
        // Define valid transitions
        boolean validTransition = switch (currentStatus) {
            case STATUS_REQUESTED -> 
                newStatus.equals(STATUS_CONFIRMED) || newStatus.equals(STATUS_CANCELLED);
            case STATUS_CONFIRMED ->
                newStatus.equals(STATUS_IN_TRANSIT) || newStatus.equals(STATUS_CANCELLED);
            case STATUS_IN_TRANSIT ->
                newStatus.equals(STATUS_DELIVERED) || newStatus.equals(STATUS_CANCELLED);
            case STATUS_DELIVERED, STATUS_CANCELLED, STATUS_FAILED ->
                false; // Terminal states
            default -> false;
        };

        if (!validTransition) {
            throw new IllegalStateException(
                    "Invalid status transition from " + currentStatus + " to " + newStatus);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Transfer createInitialTransfer(
            String transferId,
            String fromLocation,
            String toLocation,
            String itemsHash,
            String contractAddress) {

        log.debug("Creating initial transfer record: transferId={}", transferId);

        Transfer transfer = new Transfer(
                transferId,
                fromLocation,
                toLocation,
                itemsHash,
                STATUS_REQUESTED,
                contractAddress
        );

        Transfer saved = transferRepository.save(transfer);
        log.debug("Initial transfer record saved: id={}", saved.getId());

        return saved;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Transfer updateTransferWithReceipt(String transferId, TransactionReceipt receipt) {
        log.debug("Updating transfer with receipt: transferId={}", transferId);

        Transfer transfer = transferRepository.findByTransferId(transferId)
                .orElseThrow(() -> new TransferNotFoundException(transferId));

        transfer.setTxHash(receipt.getTransactionHash());
        transfer.setBlockNumber(receipt.getBlockNumber().longValue());
        transfer.setStatus(STATUS_CONFIRMED);

        Transfer updated = transferRepository.save(transfer);
        log.debug("Transfer updated with receipt: txHash={}, blockNumber={}",
                updated.getTxHash(), updated.getBlockNumber());

        return updated;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markTransferFailed(String transferId, String errorMessage) {
        log.warn("Marking transfer as failed: transferId={}, error={}", transferId, errorMessage);

        transferRepository.findByTransferId(transferId).ifPresent(transfer -> {
            transfer.setStatus(STATUS_FAILED);
            transfer.setErrorMessage(truncateErrorMessage(errorMessage));
            transferRepository.save(transfer);
        });
    }

    private TransferResponse buildResponse(Transfer transfer) {
        return TransferResponse.builder()
                .transferId(transfer.getTransferId())
                .fromLocation(transfer.getFromLocation())
                .toLocation(transfer.getToLocation())
                .status(transfer.getStatus())
                .itemsHash(transfer.getItemsHash())
                .contractAddress(transfer.getContractAddress())
                .txHash(transfer.getTxHash())
                .blockNumber(transfer.getBlockNumber())
                .createdAt(transfer.getCreatedAt() != null ? transfer.getCreatedAt().toString() : null)
                .errorMessage(transfer.getErrorMessage())
                .build();
    }

    private String truncateErrorMessage(String message) {
        if (message == null) {
            return null;
        }
        int maxLength = 500;
        return message.length() > maxLength ? message.substring(0, maxLength) : message;
    }
}
