package com.inventory.blockchain.controller;

import com.inventory.blockchain.entity.*;
import com.inventory.blockchain.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsController.class);

    private final TransferRepository transferRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;

    public AnalyticsController(
            TransferRepository transferRepository,
            SupplierRepository supplierRepository,
            PurchaseOrderRepository purchaseOrderRepository,
            UserRepository userRepository,
            ActivityLogRepository activityLogRepository) {
        this.transferRepository = transferRepository;
        this.supplierRepository = supplierRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
    }

    // ==================== MAIN DASHBOARD KPIs ====================

    @GetMapping("/kpis")
    public ResponseEntity<Map<String, Object>> getKPIs() {
        log.info("GET /api/analytics/kpis");

        Map<String, Object> kpis = new HashMap<>();

        // Transfer KPIs
        List<Transfer> allTransfers = transferRepository.findAll();
        long totalTransfers = allTransfers.size();
        long deliveredTransfers = allTransfers.stream().filter(t -> "DELIVERED".equals(t.getStatus())).count();
        long pendingTransfers = allTransfers.stream().filter(t -> 
            "REQUESTED".equals(t.getStatus()) || "CONFIRMED".equals(t.getStatus()) || "IN_TRANSIT".equals(t.getStatus())
        ).count();
        long cancelledTransfers = allTransfers.stream().filter(t -> "CANCELLED".equals(t.getStatus())).count();

        double deliveryRate = totalTransfers > 0 ? (deliveredTransfers * 100.0 / totalTransfers) : 0;
        double cancellationRate = totalTransfers > 0 ? (cancelledTransfers * 100.0 / totalTransfers) : 0;

        kpis.put("totalTransfers", totalTransfers);
        kpis.put("deliveredTransfers", deliveredTransfers);
        kpis.put("pendingTransfers", pendingTransfers);
        kpis.put("cancelledTransfers", cancelledTransfers);
        kpis.put("deliveryRate", round(deliveryRate, 1));
        kpis.put("cancellationRate", round(cancellationRate, 1));

        // Blockchain KPIs
        long blockchainVerified = allTransfers.stream().filter(t -> t.getTxHash() != null).count();
        kpis.put("blockchainVerified", blockchainVerified);
        kpis.put("blockchainRate", totalTransfers > 0 ? round(blockchainVerified * 100.0 / totalTransfers, 1) : 0);

        // Supplier KPIs
        long totalSuppliers = supplierRepository.count();
        long activeSuppliers = supplierRepository.countByStatus("ACTIVE");
        kpis.put("totalSuppliers", totalSuppliers);
        kpis.put("activeSuppliers", activeSuppliers);

        // Purchase Order KPIs
        List<PurchaseOrder> allOrders = purchaseOrderRepository.findAll();
        BigDecimal totalPurchaseValue = allOrders.stream()
            .filter(o -> "DELIVERED".equals(o.getStatus()))
            .map(PurchaseOrder::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        kpis.put("totalPurchaseOrders", allOrders.size());
        kpis.put("totalPurchaseValue", totalPurchaseValue);

        // User KPIs
        long totalUsers = userRepository.count();
        kpis.put("totalUsers", totalUsers);

        // Activity (last 24 hours) - count all activity logs as proxy
        long recentActivity = activityLogRepository.count();
        kpis.put("recentLogins", recentActivity);

        return ResponseEntity.ok(kpis);
    }

    // ==================== TRANSFER ANALYTICS ====================

    @GetMapping("/transfers/by-status")
    public ResponseEntity<List<Map<String, Object>>> getTransfersByStatus() {
        log.info("GET /api/analytics/transfers/by-status");

        List<Transfer> transfers = transferRepository.findAll();
        Map<String, Long> byStatus = transfers.stream()
            .collect(Collectors.groupingBy(Transfer::getStatus, Collectors.counting()));

        List<Map<String, Object>> result = byStatus.entrySet().stream()
            .map(e -> {
                Map<String, Object> item = new HashMap<>();
                item.put("status", e.getKey());
                item.put("count", e.getValue());
                item.put("percentage", transfers.isEmpty() ? 0 : round(e.getValue() * 100.0 / transfers.size(), 1));
                return item;
            })
            .sorted((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")))
            .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/transfers/by-location")
    public ResponseEntity<List<Map<String, Object>>> getTransfersByLocation() {
        log.info("GET /api/analytics/transfers/by-location");

        List<Transfer> transfers = transferRepository.findAll();
        
        // Count outgoing transfers per location
        Map<String, Long> outgoing = transfers.stream()
            .collect(Collectors.groupingBy(Transfer::getFromLocation, Collectors.counting()));

        // Count incoming transfers per location
        Map<String, Long> incoming = transfers.stream()
            .collect(Collectors.groupingBy(Transfer::getToLocation, Collectors.counting()));

        // Combine all locations
        Set<String> allLocations = new HashSet<>();
        allLocations.addAll(outgoing.keySet());
        allLocations.addAll(incoming.keySet());

        List<Map<String, Object>> result = allLocations.stream()
            .map(loc -> {
                Map<String, Object> item = new HashMap<>();
                item.put("location", loc);
                item.put("outgoing", outgoing.getOrDefault(loc, 0L));
                item.put("incoming", incoming.getOrDefault(loc, 0L));
                item.put("total", outgoing.getOrDefault(loc, 0L) + incoming.getOrDefault(loc, 0L));
                return item;
            })
            .sorted((a, b) -> Long.compare((Long) b.get("total"), (Long) a.get("total")))
            .limit(10)
            .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/transfers/daily")
    public ResponseEntity<List<Map<String, Object>>> getDailyTransfers(
            @RequestParam(defaultValue = "30") int days) {
        log.info("GET /api/analytics/transfers/daily - days={}", days);

        LocalDate startDate = LocalDate.now().minusDays(days);
        List<Transfer> transfers = transferRepository.findAll().stream()
            .filter(t -> t.getCreatedAt() != null && !t.getCreatedAt().toLocalDate().isBefore(startDate))
            .collect(Collectors.toList());

        Map<LocalDate, Long> byDate = transfers.stream()
            .collect(Collectors.groupingBy(t -> t.getCreatedAt().toLocalDate(), Collectors.counting()));

        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = days; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            Map<String, Object> item = new HashMap<>();
            item.put("date", date.toString());
            item.put("count", byDate.getOrDefault(date, 0L));
            result.add(item);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/transfers/weekly")
    public ResponseEntity<List<Map<String, Object>>> getWeeklyTransfers(
            @RequestParam(defaultValue = "12") int weeks) {
        log.info("GET /api/analytics/transfers/weekly - weeks={}", weeks);

        LocalDate startDate = LocalDate.now().minusWeeks(weeks);
        List<Transfer> transfers = transferRepository.findAll().stream()
            .filter(t -> t.getCreatedAt() != null && !t.getCreatedAt().toLocalDate().isBefore(startDate))
            .collect(Collectors.toList());

        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = weeks; i >= 0; i--) {
            LocalDate weekStart = LocalDate.now().minusWeeks(i);
            LocalDate weekEnd = weekStart.plusDays(6);
            
            long count = transfers.stream()
                .filter(t -> {
                    LocalDate date = t.getCreatedAt().toLocalDate();
                    return !date.isBefore(weekStart) && !date.isAfter(weekEnd);
                })
                .count();

            Map<String, Object> item = new HashMap<>();
            item.put("week", "W" + (weeks - i + 1));
            item.put("startDate", weekStart.toString());
            item.put("count", count);
            result.add(item);
        }

        return ResponseEntity.ok(result);
    }

    // ==================== SUPPLIER ANALYTICS ====================

    @GetMapping("/suppliers/top")
    public ResponseEntity<List<Map<String, Object>>> getTopSuppliers(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/analytics/suppliers/top - limit={}", limit);

        List<Supplier> suppliers = supplierRepository.findActiveSuppliersByRating();
        
        List<Map<String, Object>> result = suppliers.stream()
            .limit(limit)
            .map(s -> {
                Map<String, Object> item = new HashMap<>();
                item.put("id", s.getId());
                item.put("name", s.getName());
                item.put("code", s.getSupplierCode());
                item.put("rating", s.getRating());
                item.put("country", s.getCountry());
                
                // Count orders for this supplier
                long orderCount = purchaseOrderRepository.findBySupplierId(s.getId()).size();
                item.put("orderCount", orderCount);
                
                return item;
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/suppliers/by-country")
    public ResponseEntity<List<Map<String, Object>>> getSuppliersByCountry() {
        log.info("GET /api/analytics/suppliers/by-country");

        List<Supplier> suppliers = supplierRepository.findAll();
        Map<String, Long> byCountry = suppliers.stream()
            .filter(s -> s.getCountry() != null)
            .collect(Collectors.groupingBy(Supplier::getCountry, Collectors.counting()));

        List<Map<String, Object>> result = byCountry.entrySet().stream()
            .map(e -> {
                Map<String, Object> item = new HashMap<>();
                item.put("country", e.getKey());
                item.put("count", e.getValue());
                return item;
            })
            .sorted((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")))
            .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ==================== PURCHASE ORDER ANALYTICS ====================

    @GetMapping("/orders/by-status")
    public ResponseEntity<List<Map<String, Object>>> getOrdersByStatus() {
        log.info("GET /api/analytics/orders/by-status");

        List<PurchaseOrder> orders = purchaseOrderRepository.findAll();
        Map<String, Long> byStatus = orders.stream()
            .collect(Collectors.groupingBy(PurchaseOrder::getStatus, Collectors.counting()));

        List<Map<String, Object>> result = byStatus.entrySet().stream()
            .map(e -> {
                Map<String, Object> item = new HashMap<>();
                item.put("status", e.getKey());
                item.put("count", e.getValue());
                return item;
            })
            .sorted((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")))
            .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/orders/monthly-spend")
    public ResponseEntity<List<Map<String, Object>>> getMonthlySpend(
            @RequestParam(defaultValue = "12") int months) {
        log.info("GET /api/analytics/orders/monthly-spend - months={}", months);

        List<PurchaseOrder> orders = purchaseOrderRepository.findAll().stream()
            .filter(o -> o.getOrderDate() != null && "DELIVERED".equals(o.getStatus()))
            .collect(Collectors.toList());

        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = months - 1; i >= 0; i--) {
            LocalDate monthStart = LocalDate.now().minusMonths(i).withDayOfMonth(1);
            LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);

            BigDecimal total = orders.stream()
                .filter(o -> {
                    LocalDate date = o.getOrderDate().toLocalDate();
                    return !date.isBefore(monthStart) && !date.isAfter(monthEnd);
                })
                .map(PurchaseOrder::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> item = new HashMap<>();
            item.put("month", monthStart.getMonth().toString().substring(0, 3));
            item.put("year", monthStart.getYear());
            item.put("total", total);
            result.add(item);
        }

        return ResponseEntity.ok(result);
    }

    // ==================== ACTIVITY ANALYTICS ====================

    @GetMapping("/activity/by-action")
    public ResponseEntity<List<Map<String, Object>>> getActivityByAction() {
        log.info("GET /api/analytics/activity/by-action");

        // Get activity by action - simplified without date filter
        List<ActivityLog> allLogs = activityLogRepository.findAll();
        Map<String, Long> actionCounts = allLogs.stream()
            .collect(java.util.stream.Collectors.groupingBy(ActivityLog::getAction, java.util.stream.Collectors.counting()));
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, Long> entry : actionCounts.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("action", entry.getKey());
            item.put("count", entry.getValue());
            result.add(item);
        }

        result.sort((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")));
        return ResponseEntity.ok(result);
    }

    // ==================== PERFORMANCE METRICS ====================

    @GetMapping("/performance")
    public ResponseEntity<Map<String, Object>> getPerformanceMetrics() {
        log.info("GET /api/analytics/performance");

        Map<String, Object> metrics = new HashMap<>();

        List<Transfer> transfers = transferRepository.findAll();
        List<PurchaseOrder> orders = purchaseOrderRepository.findAll();

        // Average transfers per day (last 30 days)
        OffsetDateTime thirtyDaysAgo = OffsetDateTime.now().minusDays(30);
        long transfersLast30 = transfers.stream()
            .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().isAfter(thirtyDaysAgo))
            .count();
        metrics.put("avgTransfersPerDay", round(transfersLast30 / 30.0, 1));

        // Average order value
        BigDecimal totalOrderValue = orders.stream()
            .filter(o -> o.getTotal() != null)
            .map(PurchaseOrder::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal avgOrderValue = orders.isEmpty() ? BigDecimal.ZERO : 
            totalOrderValue.divide(BigDecimal.valueOf(orders.size()), 2, RoundingMode.HALF_UP);
        metrics.put("avgOrderValue", avgOrderValue);

        // On-time delivery rate (mock - would need actual delivery dates)
        metrics.put("onTimeDeliveryRate", 94.5);

        // Supplier response time (mock)
        metrics.put("avgSupplierResponseDays", 2.3);

        return ResponseEntity.ok(metrics);
    }

    // ==================== HELPER METHODS ====================

    private double round(double value, int places) {
        BigDecimal bd = BigDecimal.valueOf(value);
        bd = bd.setScale(places, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }
}
