package com.inventory.blockchain.controller;

import com.inventory.blockchain.entity.Transfer;
import com.inventory.blockchain.repository.TransferRepository;
import com.inventory.blockchain.service.NotificationService;
import com.inventory.blockchain.service.TransferService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/transfers")
@CrossOrigin(origins = "*")
public class TransferController {

    private static final Logger log = LoggerFactory.getLogger(TransferController.class);

    private final TransferRepository transferRepository;
    private final TransferService transferService;
    private final NotificationService notificationService;

    public TransferController(TransferRepository transferRepository, 
                              TransferService transferService,
                              NotificationService notificationService) {
        this.transferRepository = transferRepository;
        this.transferService = transferService;
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<Transfer> getAllTransfers() {
        log.info("GET /api/transfers");
        return transferRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transfer> getTransfer(@PathVariable String id) {
        log.info("GET /api/transfers/{}", id);
        return transferRepository.findByTransferId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createTransfer(@RequestBody Transfer transfer) {
        log.info("POST /api/transfers - Creating transfer from {} to {}", 
                transfer.getFromLocation(), transfer.getToLocation());

        try {
            // Generate transfer ID if not provided
            if (transfer.getTransferId() == null || transfer.getTransferId().isEmpty()) {
                transfer.setTransferId("TRF-" + System.currentTimeMillis() % 1000000);
            }
            
            // Set defaults
            if (transfer.getStatus() == null) {
                transfer.setStatus("REQUESTED");
            }
            if (transfer.getCreatedAt() == null) {
                transfer.setCreatedAt(OffsetDateTime.now());
            }
            
            Transfer created = transferRepository.save(transfer);
            
            // Send notification
            notificationService.notifyTransferCreated(created);
            
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            log.error("Failed to create transfer: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", "FAILED",
                "message", e.getMessage()
            ));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        
        String newStatus = body.get("status");
        log.info("PUT /api/transfers/{}/status - newStatus={}", id, newStatus);

        Optional<Transfer> optTransfer = transferRepository.findByTransferId(id);
        if (optTransfer.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Transfer transfer = optTransfer.get();
        String oldStatus = transfer.getStatus();

        // Update status
        transfer.setStatus(newStatus);

        Transfer saved = transferRepository.save(transfer);
        
        // Send notification for status change
        notificationService.notifyTransferStatusChanged(saved, oldStatus, newStatus);

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<?> confirmTransfer(@PathVariable String id) {
        log.info("PUT /api/transfers/{}/confirm", id);
        
        return transferRepository.findByTransferId(id)
            .map(transfer -> {
                String oldStatus = transfer.getStatus();
                transfer.setStatus("CONFIRMED");
                Transfer saved = transferRepository.save(transfer);
                notificationService.notifyTransferStatusChanged(saved, oldStatus, "CONFIRMED");
                return ResponseEntity.ok(saved);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/blockchain")
    public ResponseEntity<?> updateBlockchain(
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        
        log.info("PUT /api/transfers/{}/blockchain", id);

        return transferRepository.findByTransferId(id)
            .map(transfer -> {
                if (body.containsKey("blockNumber")) {
                    transfer.setBlockNumber(((Number) body.get("blockNumber")).longValue());
                }
                if (body.containsKey("txHash")) {
                    transfer.setTxHash((String) body.get("txHash"));
                }
                if (body.containsKey("itemsHash")) {
                    transfer.setItemsHash((String) body.get("itemsHash"));
                }
                return ResponseEntity.ok(transferRepository.save(transfer));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransfer(@PathVariable String id) {
        log.info("DELETE /api/transfers/{}", id);
        
        return transferRepository.findByTransferId(id)
            .map(transfer -> {
                // Only allow deletion of REQUESTED transfers
                if (!"REQUESTED".equals(transfer.getStatus())) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Cannot delete transfer that is not in REQUESTED status"
                    ));
                }
                transferRepository.delete(transfer);
                return ResponseEntity.ok(Map.of("message", "Transfer deleted"));
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
