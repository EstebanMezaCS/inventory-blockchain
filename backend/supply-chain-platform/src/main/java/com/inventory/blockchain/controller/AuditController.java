package com.inventory.blockchain.controller;

import com.inventory.blockchain.entity.Transfer;
import com.inventory.blockchain.repository.TransferRepository;
import com.inventory.blockchain.repository.ActivityLogRepository;
import com.inventory.blockchain.dto.ActivityLogResponse;
import com.inventory.blockchain.entity.ActivityLog;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = "*")
public class AuditController {

    private static final Logger log = LoggerFactory.getLogger(AuditController.class);

    private final TransferRepository transferRepository;
    private final ActivityLogRepository activityLogRepository;

    public AuditController(TransferRepository transferRepository, ActivityLogRepository activityLogRepository) {
        this.transferRepository = transferRepository;
        this.activityLogRepository = activityLogRepository;
    }

    // ==================== TRANSFER AUDIT ====================

    /**
     * Get all transfers with optional filters
     */
    @GetMapping("/transfers")
    public ResponseEntity<List<Transfer>> getTransferHistory(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String fromLocation,
            @RequestParam(required = false) String toLocation,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        log.info("GET /api/audit/transfers - status={}, from={}, to={}", status, fromLocation, toLocation);
        
        List<Transfer> transfers = transferRepository.findAllByOrderByCreatedAtDesc();
        
        // Apply filters
        if (status != null && !status.isEmpty()) {
            transfers = transfers.stream()
                    .filter(t -> t.getStatus().equals(status))
                    .collect(Collectors.toList());
        }
        if (fromLocation != null && !fromLocation.isEmpty()) {
            transfers = transfers.stream()
                    .filter(t -> t.getFromLocation().equals(fromLocation))
                    .collect(Collectors.toList());
        }
        if (toLocation != null && !toLocation.isEmpty()) {
            transfers = transfers.stream()
                    .filter(t -> t.getToLocation().equals(toLocation))
                    .collect(Collectors.toList());
        }
        if (startDate != null && !startDate.isEmpty()) {
            LocalDate start = LocalDate.parse(startDate);
            transfers = transfers.stream()
                    .filter(t -> t.getCreatedAt() != null && !t.getCreatedAt().toLocalDate().isBefore(start))
                    .collect(Collectors.toList());
        }
        if (endDate != null && !endDate.isEmpty()) {
            LocalDate end = LocalDate.parse(endDate);
            transfers = transfers.stream()
                    .filter(t -> t.getCreatedAt() != null && !t.getCreatedAt().toLocalDate().isAfter(end))
                    .collect(Collectors.toList());
        }
        
        return ResponseEntity.ok(transfers);
    }

    /**
     * Get transfer by ID with full blockchain details
     */
    @GetMapping("/transfers/{transferId}")
    public ResponseEntity<Map<String, Object>> getTransferDetails(@PathVariable String transferId) {
        log.info("GET /api/audit/transfers/{}", transferId);
        
        Optional<Transfer> transferOpt = transferRepository.findByTransferId(transferId);
        if (transferOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Transfer transfer = transferOpt.get();
        Map<String, Object> details = new HashMap<>();
        details.put("transfer", transfer);
        details.put("blockchainVerified", transfer.getTxHash() != null);
        details.put("timeline", buildTransferTimeline(transfer));
        
        return ResponseEntity.ok(details);
    }

    /**
     * Get blockchain transactions summary
     */
    @GetMapping("/blockchain/summary")
    public ResponseEntity<Map<String, Object>> getBlockchainSummary() {
        log.info("GET /api/audit/blockchain/summary");
        
        List<Transfer> allTransfers = transferRepository.findAll();
        
        long totalTransactions = allTransfers.stream()
                .filter(t -> t.getTxHash() != null)
                .count();
        
        OptionalLong maxBlock = allTransfers.stream()
                .filter(t -> t.getBlockNumber() != null)
                .mapToLong(Transfer::getBlockNumber)
                .max();
        
        OptionalLong minBlock = allTransfers.stream()
                .filter(t -> t.getBlockNumber() != null)
                .mapToLong(Transfer::getBlockNumber)
                .min();
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalTransactions", totalTransactions);
        summary.put("totalTransfers", allTransfers.size());
        summary.put("latestBlock", maxBlock.orElse(0));
        summary.put("firstBlock", minBlock.orElse(0));
        summary.put("pendingTransfers", allTransfers.stream().filter(t -> t.getTxHash() == null).count());
        summary.put("networkStatus", "connected");
        
        return ResponseEntity.ok(summary);
    }

    /**
     * Get transactions by block range
     */
    @GetMapping("/blockchain/blocks")
    public ResponseEntity<List<Map<String, Object>>> getBlockTransactions(
            @RequestParam(defaultValue = "0") long fromBlock,
            @RequestParam(defaultValue = "999999999") long toBlock) {
        
        log.info("GET /api/audit/blockchain/blocks - from={}, to={}", fromBlock, toBlock);
        
        List<Transfer> transfers = transferRepository.findAll().stream()
                .filter(t -> t.getBlockNumber() != null)
                .filter(t -> t.getBlockNumber() >= fromBlock && t.getBlockNumber() <= toBlock)
                .sorted((a, b) -> Long.compare(b.getBlockNumber(), a.getBlockNumber()))
                .collect(Collectors.toList());
        
        // Group by block
        Map<Long, List<Transfer>> byBlock = transfers.stream()
                .collect(Collectors.groupingBy(Transfer::getBlockNumber));
        
        List<Map<String, Object>> blocks = byBlock.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getKey(), a.getKey()))
                .map(entry -> {
                    Map<String, Object> block = new HashMap<>();
                    block.put("blockNumber", entry.getKey());
                    block.put("transactions", entry.getValue().size());
                    block.put("transfers", entry.getValue());
                    block.put("timestamp", entry.getValue().get(0).getCreatedAt());
                    return block;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(blocks);
    }

    // ==================== COMPLIANCE DASHBOARD ====================

    /**
     * Get compliance statistics
     */
    @GetMapping("/compliance/stats")
    public ResponseEntity<Map<String, Object>> getComplianceStats() {
        log.info("GET /api/audit/compliance/stats");
        
        List<Transfer> allTransfers = transferRepository.findAll();
        OffsetDateTime thirtyDaysAgo = OffsetDateTime.now().minusDays(30);
        OffsetDateTime sevenDaysAgo = OffsetDateTime.now().minusDays(7);
        
        List<Transfer> last30Days = allTransfers.stream()
                .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().isAfter(thirtyDaysAgo))
                .collect(Collectors.toList());
        
        List<Transfer> last7Days = allTransfers.stream()
                .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().isAfter(sevenDaysAgo))
                .collect(Collectors.toList());
        
        // Status breakdown
        Map<String, Long> statusCounts = allTransfers.stream()
                .collect(Collectors.groupingBy(Transfer::getStatus, Collectors.counting()));
        
        // Location activity
        Map<String, Long> locationActivity = allTransfers.stream()
                .collect(Collectors.groupingBy(Transfer::getFromLocation, Collectors.counting()));
        
        // Calculate completion rate
        long completed = allTransfers.stream()
                .filter(t -> t.getStatus().equals("DELIVERED"))
                .count();
        double completionRate = allTransfers.isEmpty() ? 0 : (completed * 100.0 / allTransfers.size());
        
        // Calculate cancellation rate
        long cancelled = allTransfers.stream()
                .filter(t -> t.getStatus().equals("CANCELLED"))
                .count();
        double cancellationRate = allTransfers.isEmpty() ? 0 : (cancelled * 100.0 / allTransfers.size());
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTransfers", allTransfers.size());
        stats.put("last30Days", last30Days.size());
        stats.put("last7Days", last7Days.size());
        stats.put("statusBreakdown", statusCounts);
        stats.put("locationActivity", locationActivity);
        stats.put("completionRate", Math.round(completionRate * 10) / 10.0);
        stats.put("cancellationRate", Math.round(cancellationRate * 10) / 10.0);
        stats.put("blockchainVerified", allTransfers.stream().filter(t -> t.getTxHash() != null).count());
        
        return ResponseEntity.ok(stats);
    }

    /**
     * Get daily transfer volume for charts
     */
    @GetMapping("/compliance/volume")
    public ResponseEntity<List<Map<String, Object>>> getDailyVolume(
            @RequestParam(defaultValue = "30") int days) {
        
        log.info("GET /api/audit/compliance/volume - days={}", days);
        
        LocalDate startDate = LocalDate.now().minusDays(days);
        List<Transfer> transfers = transferRepository.findAll().stream()
                .filter(t -> t.getCreatedAt() != null && !t.getCreatedAt().toLocalDate().isBefore(startDate))
                .collect(Collectors.toList());
        
        // Group by date
        Map<LocalDate, Long> byDate = transfers.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getCreatedAt().toLocalDate(),
                        Collectors.counting()
                ));
        
        // Fill in missing dates
        List<Map<String, Object>> volume = new ArrayList<>();
        for (int i = days; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            Map<String, Object> day = new HashMap<>();
            day.put("date", date.toString());
            day.put("count", byDate.getOrDefault(date, 0L));
            volume.add(day);
        }
        
        return ResponseEntity.ok(volume);
    }

    // ==================== ACTIVITY LOGS ====================

    /**
     * Get activity logs with filters
     */
    @GetMapping("/activity")
    public ResponseEntity<List<ActivityLogResponse>> getActivityLogs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(defaultValue = "100") int limit) {
        
        log.info("GET /api/audit/activity - userId={}, action={}, entityType={}", userId, action, entityType);
        
        List<ActivityLog> logs;
        
        if (userId != null) {
            logs = activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
        } else if (action != null) {
            logs = activityLogRepository.findByAction(action);
        } else if (entityType != null) {
            logs = activityLogRepository.findByEntityType(entityType);
        } else {
            logs = activityLogRepository.findAllByOrderByCreatedAtDesc(
                    org.springframework.data.domain.PageRequest.of(0, limit)
            ).getContent();
        }
        
        List<ActivityLogResponse> response = logs.stream()
                .limit(limit)
                .map(log -> new ActivityLogResponse(
                        log.getId(),
                        log.getUser() != null ? log.getUser().getUsername() : "System",
                        log.getAction(),
                        log.getEntityType(),
                        log.getEntityId(),
                        log.getCreatedAt(),
                        log.getIpAddress()
                ))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    // ==================== HELPER METHODS ====================

    private List<Map<String, Object>> buildTransferTimeline(Transfer transfer) {
        List<Map<String, Object>> timeline = new ArrayList<>();
        
        // Created
        Map<String, Object> created = new HashMap<>();
        created.put("status", "CREATED");
        created.put("timestamp", transfer.getCreatedAt());
        created.put("description", "Transfer request created");
        timeline.add(created);
        
        // Blockchain confirmed
        if (transfer.getTxHash() != null) {
            Map<String, Object> confirmed = new HashMap<>();
            confirmed.put("status", "BLOCKCHAIN_CONFIRMED");
            confirmed.put("timestamp", transfer.getCreatedAt());
            confirmed.put("description", "Recorded on blockchain - Block #" + transfer.getBlockNumber());
            confirmed.put("transactionHash", transfer.getTxHash());
            timeline.add(confirmed);
        }
        
        // Current status
        if (!transfer.getStatus().equals("REQUESTED")) {
            Map<String, Object> current = new HashMap<>();
            current.put("status", transfer.getStatus());
            current.put("timestamp", transfer.getCreatedAt()); // No updatedAt field in your entity
            current.put("description", "Status updated to " + transfer.getStatus());
            timeline.add(current);
        }
        
        return timeline;
    }
}
