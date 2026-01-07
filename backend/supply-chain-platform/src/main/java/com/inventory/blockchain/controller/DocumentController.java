package com.inventory.blockchain.controller;

import com.inventory.blockchain.entity.*;
import com.inventory.blockchain.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.MessageDigest;
import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    private static final Logger log = LoggerFactory.getLogger(DocumentController.class);

    private final DocumentRepository documentRepository;
    private final DocumentCategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final UserRepository userRepository;

    public DocumentController(
            DocumentRepository documentRepository,
            DocumentCategoryRepository categoryRepository,
            SupplierRepository supplierRepository,
            PurchaseOrderRepository purchaseOrderRepository,
            UserRepository userRepository) {
        this.documentRepository = documentRepository;
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.userRepository = userRepository;
    }

    // ==================== DOCUMENTS ====================

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllDocuments(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {
        log.info("GET /api/documents - category={}, search={}, status={}", category, search, status);

        List<Document> documents;
        if (search != null && !search.isEmpty()) {
            documents = documentRepository.searchDocuments(search);
        } else if (category != null && !category.isEmpty()) {
            documents = documentRepository.findByCategoryOrderByCreatedAtDesc(category);
        } else {
            documents = documentRepository.findAllByOrderByCreatedAtDesc();
        }

        // Filter by status if provided
        if (status != null && !status.isEmpty()) {
            documents = documents.stream()
                .filter(d -> status.equals(d.getStatus()))
                .toList();
        }

        // Map to response DTOs
        List<Map<String, Object>> result = documents.stream()
            .map(this::mapDocumentToResponse)
            .toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getDocument(@PathVariable Long id) {
        log.info("GET /api/documents/{}", id);

        return documentRepository.findById(id)
            .map(doc -> ResponseEntity.ok(mapDocumentToResponse(doc)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createDocument(@RequestBody CreateDocumentRequest request,
                                            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        log.info("POST /api/documents - name={}", request.name);

        // Generate document code
        String docCode = generateDocumentCode();

        Document doc = new Document();
        doc.setDocumentCode(docCode);
        doc.setName(request.name);
        doc.setDescription(request.description);
        doc.setFileName(request.fileName);
        doc.setFileType(request.fileType);
        doc.setFileSize(request.fileSize);
        doc.setFilePath(request.filePath);
        doc.setCategory(request.category);
        doc.setStatus("ACTIVE");
        doc.setTransferId(request.transferId);
        doc.setTags(request.tags != null ? request.tags.toArray(new String[0]) : null);

        // Set associations
        if (request.supplierId != null) {
            supplierRepository.findById(request.supplierId)
                .ifPresent(doc::setSupplier);
        }
        if (request.purchaseOrderId != null) {
            purchaseOrderRepository.findById(request.purchaseOrderId)
                .ifPresent(doc::setPurchaseOrder);
        }

        // Set uploader
        if (userId != null) {
            userRepository.findById(userId).ifPresent(doc::setUploadedBy);
        }

        // Generate hash
        doc.setHash(generateHash(doc.getFileName() + doc.getFileSize() + System.currentTimeMillis()));

        Document saved = documentRepository.save(doc);
        return ResponseEntity.ok(mapDocumentToResponse(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDocument(@PathVariable Long id, @RequestBody UpdateDocumentRequest request) {
        log.info("PUT /api/documents/{}", id);

        return documentRepository.findById(id)
            .map(doc -> {
                if (request.name != null) doc.setName(request.name);
                if (request.description != null) doc.setDescription(request.description);
                if (request.category != null) doc.setCategory(request.category);
                if (request.status != null) doc.setStatus(request.status);
                if (request.tags != null) doc.setTags(request.tags.toArray(new String[0]));

                Document saved = documentRepository.save(doc);
                return ResponseEntity.ok(mapDocumentToResponse(saved));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        log.info("DELETE /api/documents/{}", id);

        return documentRepository.findById(id)
            .map(doc -> {
                // Soft delete
                doc.setStatus("DELETED");
                documentRepository.save(doc);
                return ResponseEntity.ok(Map.of("message", "Document deleted"));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // ==================== CATEGORIES ====================

    @GetMapping("/categories")
    public ResponseEntity<List<DocumentCategory>> getCategories() {
        log.info("GET /api/documents/categories");
        return ResponseEntity.ok(categoryRepository.findByIsActiveTrue());
    }

    // ==================== ASSOCIATIONS ====================

    @GetMapping("/by-transfer/{transferId}")
    public ResponseEntity<List<Map<String, Object>>> getDocumentsByTransfer(@PathVariable String transferId) {
        log.info("GET /api/documents/by-transfer/{}", transferId);
        List<Document> docs = documentRepository.findByTransferId(transferId);
        return ResponseEntity.ok(docs.stream().map(this::mapDocumentToResponse).toList());
    }

    @GetMapping("/by-supplier/{supplierId}")
    public ResponseEntity<List<Map<String, Object>>> getDocumentsBySupplier(@PathVariable Long supplierId) {
        log.info("GET /api/documents/by-supplier/{}", supplierId);
        List<Document> docs = documentRepository.findBySupplierId(supplierId);
        return ResponseEntity.ok(docs.stream().map(this::mapDocumentToResponse).toList());
    }

    @GetMapping("/by-order/{orderId}")
    public ResponseEntity<List<Map<String, Object>>> getDocumentsByOrder(@PathVariable Long orderId) {
        log.info("GET /api/documents/by-order/{}", orderId);
        List<Document> docs = documentRepository.findByPurchaseOrderId(orderId);
        return ResponseEntity.ok(docs.stream().map(this::mapDocumentToResponse).toList());
    }

    // ==================== STATISTICS ====================

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDocumentStats() {
        log.info("GET /api/documents/stats");

        Map<String, Object> stats = new HashMap<>();

        stats.put("totalDocuments", documentRepository.count());
        stats.put("activeDocuments", documentRepository.countByStatus("ACTIVE"));

        // Count by category
        List<Object[]> categoryCount = documentRepository.countByCategory();
        Map<String, Long> byCategory = new HashMap<>();
        for (Object[] row : categoryCount) {
            byCategory.put((String) row[0], (Long) row[1]);
        }
        stats.put("byCategory", byCategory);

        // Total file size (approximate)
        List<Document> allDocs = documentRepository.findAll();
        long totalSize = allDocs.stream()
            .filter(d -> d.getFileSize() != null)
            .mapToLong(Document::getFileSize)
            .sum();
        stats.put("totalSize", totalSize);
        stats.put("totalSizeMB", totalSize / (1024 * 1024));

        return ResponseEntity.ok(stats);
    }

    // ==================== HELPER METHODS ====================

    private Map<String, Object> mapDocumentToResponse(Document doc) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", doc.getId());
        map.put("documentCode", doc.getDocumentCode());
        map.put("name", doc.getName());
        map.put("description", doc.getDescription());
        map.put("fileName", doc.getFileName());
        map.put("fileType", doc.getFileType());
        map.put("fileSize", doc.getFileSize());
        map.put("filePath", doc.getFilePath());
        map.put("category", doc.getCategory());
        map.put("status", doc.getStatus());
        map.put("transferId", doc.getTransferId());
        map.put("supplierId", doc.getSupplierId());
        map.put("purchaseOrderId", doc.getPurchaseOrderId());
        map.put("tags", doc.getTags());
        map.put("version", doc.getVersion());
        map.put("hash", doc.getHash());
        map.put("createdAt", doc.getCreatedAt());
        map.put("updatedAt", doc.getUpdatedAt());

        // Add uploader info
        if (doc.getUploadedBy() != null) {
            map.put("uploadedBy", doc.getUploadedBy().getUsername());
            map.put("uploadedById", doc.getUploadedBy().getId());
        }

        // Add supplier name if linked
        if (doc.getSupplier() != null) {
            map.put("supplierName", doc.getSupplier().getName());
        }

        // Add PO number if linked
        if (doc.getPurchaseOrder() != null) {
            map.put("poNumber", doc.getPurchaseOrder().getPoNumber());
        }

        return map;
    }

    private String generateDocumentCode() {
        int year = java.time.Year.now().getValue();
        long count = documentRepository.count() + 1;
        return String.format("DOC-%d-%03d", year, count);
    }

    private String generateHash(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(input.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString();
        }
    }

    // ==================== REQUEST DTOs ====================

    public static class CreateDocumentRequest {
        public String name;
        public String description;
        public String fileName;
        public String fileType;
        public Long fileSize;
        public String filePath;
        public String category;
        public String transferId;
        public Long supplierId;
        public Long purchaseOrderId;
        public List<String> tags;
    }

    public static class UpdateDocumentRequest {
        public String name;
        public String description;
        public String category;
        public String status;
        public List<String> tags;
    }
}
