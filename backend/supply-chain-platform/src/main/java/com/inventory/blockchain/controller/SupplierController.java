package com.inventory.blockchain.controller;

import com.inventory.blockchain.entity.*;
import com.inventory.blockchain.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/suppliers")
@CrossOrigin(origins = "*")
public class SupplierController {

    private static final Logger log = LoggerFactory.getLogger(SupplierController.class);

    private final SupplierRepository supplierRepository;
    private final SupplierProductRepository supplierProductRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public SupplierController(
            SupplierRepository supplierRepository,
            SupplierProductRepository supplierProductRepository,
            PurchaseOrderRepository purchaseOrderRepository) {
        this.supplierRepository = supplierRepository;
        this.supplierProductRepository = supplierProductRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    // ==================== SUPPLIERS ====================

    @GetMapping
    public ResponseEntity<List<Supplier>> getAllSuppliers(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        log.info("GET /api/suppliers - status={}, search={}", status, search);
        
        List<Supplier> suppliers;
        if (search != null && !search.isEmpty()) {
            suppliers = supplierRepository.searchSuppliers(search);
        } else if (status != null && !status.isEmpty()) {
            suppliers = supplierRepository.findByStatus(status);
        } else {
            suppliers = supplierRepository.findAllByOrderByNameAsc();
        }
        
        return ResponseEntity.ok(suppliers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getSupplier(@PathVariable Long id) {
        log.info("GET /api/suppliers/{}", id);
        
        return supplierRepository.findById(id)
                .map(supplier -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("supplier", supplier);
                    response.put("products", supplierProductRepository.findBySupplierId(id));
                    response.put("orders", purchaseOrderRepository.findBySupplierIdOrderByCreatedAtDesc(id));
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createSupplier(@RequestBody Supplier supplier) {
        log.info("POST /api/suppliers - {}", supplier.getName());
        
        if (supplierRepository.existsBySupplierCode(supplier.getSupplierCode())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Supplier code already exists"));
        }
        
        supplier.setCreatedAt(OffsetDateTime.now());
        supplier.setUpdatedAt(OffsetDateTime.now());
        Supplier saved = supplierRepository.save(supplier);
        
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSupplier(@PathVariable Long id, @RequestBody Supplier updates) {
        log.info("PUT /api/suppliers/{}", id);
        
        return supplierRepository.findById(id)
                .map(supplier -> {
                    if (updates.getName() != null) supplier.setName(updates.getName());
                    if (updates.getContactName() != null) supplier.setContactName(updates.getContactName());
                    if (updates.getEmail() != null) supplier.setEmail(updates.getEmail());
                    if (updates.getPhone() != null) supplier.setPhone(updates.getPhone());
                    if (updates.getAddress() != null) supplier.setAddress(updates.getAddress());
                    if (updates.getCity() != null) supplier.setCity(updates.getCity());
                    if (updates.getCountry() != null) supplier.setCountry(updates.getCountry());
                    if (updates.getStatus() != null) supplier.setStatus(updates.getStatus());
                    if (updates.getPaymentTerms() != null) supplier.setPaymentTerms(updates.getPaymentTerms());
                    if (updates.getLeadTimeDays() != null) supplier.setLeadTimeDays(updates.getLeadTimeDays());
                    if (updates.getNotes() != null) supplier.setNotes(updates.getNotes());
                    
                    return ResponseEntity.ok(supplierRepository.save(supplier));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSupplier(@PathVariable Long id) {
        log.info("DELETE /api/suppliers/{}", id);
        
        return supplierRepository.findById(id)
                .map(supplier -> {
                    // Soft delete - set status to INACTIVE
                    supplier.setStatus("INACTIVE");
                    supplierRepository.save(supplier);
                    return ResponseEntity.ok(Map.of("message", "Supplier deactivated"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ==================== SUPPLIER PRODUCTS ====================

    @GetMapping("/{supplierId}/products")
    public ResponseEntity<List<SupplierProduct>> getSupplierProducts(@PathVariable Long supplierId) {
        log.info("GET /api/suppliers/{}/products", supplierId);
        return ResponseEntity.ok(supplierProductRepository.findBySupplierId(supplierId));
    }

    @PostMapping("/{supplierId}/products")
    public ResponseEntity<?> addSupplierProduct(
            @PathVariable Long supplierId,
            @RequestBody SupplierProduct product) {
        log.info("POST /api/suppliers/{}/products - {}", supplierId, product.getSku());
        
        return supplierRepository.findById(supplierId)
                .map(supplier -> {
                    if (supplierProductRepository.findBySupplierIdAndSku(supplierId, product.getSku()).isPresent()) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Product already exists for this supplier"));
                    }
                    product.setSupplier(supplier);
                    return ResponseEntity.ok(supplierProductRepository.save(product));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{supplierId}/products/{sku}")
    public ResponseEntity<?> removeSupplierProduct(
            @PathVariable Long supplierId,
            @PathVariable String sku) {
        log.info("DELETE /api/suppliers/{}/products/{}", supplierId, sku);
        
        return supplierProductRepository.findBySupplierIdAndSku(supplierId, sku)
                .map(product -> {
                    supplierProductRepository.delete(product);
                    return ResponseEntity.ok(Map.of("message", "Product removed"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Find suppliers for a product
    @GetMapping("/by-sku/{sku}")
    public ResponseEntity<List<SupplierProduct>> getSuppliersForProduct(@PathVariable String sku) {
        log.info("GET /api/suppliers/by-sku/{}", sku);
        return ResponseEntity.ok(supplierProductRepository.findActiveSuppliersBySku(sku));
    }

    // ==================== PURCHASE ORDERS ====================

    @GetMapping("/orders")
    public ResponseEntity<List<PurchaseOrder>> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long supplierId) {
        log.info("GET /api/suppliers/orders - status={}, supplierId={}", status, supplierId);
        
        List<PurchaseOrder> orders;
        if (supplierId != null) {
            orders = purchaseOrderRepository.findBySupplierIdOrderByCreatedAtDesc(supplierId);
        } else if (status != null && !status.isEmpty()) {
            orders = purchaseOrderRepository.findByStatus(status);
        } else {
            orders = purchaseOrderRepository.findAllByOrderByCreatedAtDesc();
        }
        
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<PurchaseOrder> getOrder(@PathVariable Long id) {
        log.info("GET /api/suppliers/orders/{}", id);
        return purchaseOrderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        log.info("POST /api/suppliers/orders - supplier={}", request.supplierId);
        
        Optional<Supplier> supplierOpt = supplierRepository.findById(request.supplierId);
        if (supplierOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Supplier not found"));
        }
        
        Supplier supplier = supplierOpt.get();
        PurchaseOrder order = new PurchaseOrder();
        order.setPoNumber(generatePoNumber());
        order.setSupplier(supplier);
        order.setStatus("DRAFT");
        order.setShippingAddress(request.shippingAddress);
        order.setNotes(request.notes);
        
        // Add items
        if (request.items != null) {
            for (OrderItemRequest itemReq : request.items) {
                PurchaseOrderItem item = new PurchaseOrderItem(
                        itemReq.sku,
                        itemReq.quantity,
                        itemReq.unitCost
                );
                order.addItem(item);
            }
        }
        
        // Calculate tax (8%)
        order.setTax(order.getSubtotal().multiply(new BigDecimal("0.08")));
        order.setShippingCost(request.shippingCost != null ? request.shippingCost : BigDecimal.ZERO);
        order.recalculateTotals();
        
        PurchaseOrder saved = purchaseOrderRepository.save(order);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        log.info("PUT /api/suppliers/orders/{}/status", id);
        
        String newStatus = body.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Status required"));
        }
        
        return purchaseOrderRepository.findById(id)
                .map(order -> {
                    order.setStatus(newStatus);
                    
                    if ("PENDING".equals(newStatus) || "CONFIRMED".equals(newStatus)) {
                        order.setOrderDate(OffsetDateTime.now());
                        if (order.getExpectedDelivery() == null) {
                            int leadTime = order.getSupplier().getLeadTimeDays() != null ? 
                                    order.getSupplier().getLeadTimeDays() : 7;
                            order.setExpectedDelivery(LocalDate.now().plusDays(leadTime));
                        }
                    }
                    
                    if ("DELIVERED".equals(newStatus)) {
                        order.setActualDelivery(LocalDate.now());
                    }
                    
                    return ResponseEntity.ok(purchaseOrderRepository.save(order));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        log.info("DELETE /api/suppliers/orders/{}", id);
        
        return purchaseOrderRepository.findById(id)
                .map(order -> {
                    if (!"DRAFT".equals(order.getStatus())) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Only draft orders can be deleted"));
                    }
                    purchaseOrderRepository.delete(order);
                    return ResponseEntity.ok(Map.of("message", "Order deleted"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ==================== STATISTICS ====================

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSupplierStats() {
        log.info("GET /api/suppliers/stats");
        
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalSuppliers", supplierRepository.count());
        stats.put("activeSuppliers", supplierRepository.countByStatus("ACTIVE"));
        stats.put("totalOrders", purchaseOrderRepository.count());
        stats.put("pendingOrders", purchaseOrderRepository.countByStatus("PENDING"));
        stats.put("draftOrders", purchaseOrderRepository.countByStatus("DRAFT"));
        stats.put("deliveredOrders", purchaseOrderRepository.countByStatus("DELIVERED"));
        
        BigDecimal totalSpent = purchaseOrderRepository.sumDeliveredTotal();
        stats.put("totalSpent", totalSpent != null ? totalSpent : BigDecimal.ZERO);
        
        // Top suppliers by rating
        List<Supplier> topSuppliers = supplierRepository.findActiveSuppliersByRating()
                .stream().limit(5).collect(Collectors.toList());
        stats.put("topSuppliers", topSuppliers);
        
        return ResponseEntity.ok(stats);
    }

    // ==================== HELPER METHODS ====================

    private String generatePoNumber() {
        int year = java.time.Year.now().getValue();
        long count = purchaseOrderRepository.count() + 1;
        return String.format("PO-%d-%03d", year, count);
    }

    // ==================== REQUEST DTOs ====================

    public static class CreateOrderRequest {
        public Long supplierId;
        public String shippingAddress;
        public String notes;
        public BigDecimal shippingCost;
        public List<OrderItemRequest> items;
    }

    public static class OrderItemRequest {
        public String sku;
        public Integer quantity;
        public BigDecimal unitCost;
    }
}
