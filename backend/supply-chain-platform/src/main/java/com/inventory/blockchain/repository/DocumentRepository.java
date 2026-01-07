package com.inventory.blockchain.repository;

import com.inventory.blockchain.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    Optional<Document> findByDocumentCode(String documentCode);

    boolean existsByDocumentCode(String documentCode);

    List<Document> findByCategory(String category);

    List<Document> findByStatus(String status);

    List<Document> findAllByOrderByCreatedAtDesc();

    List<Document> findByCategoryOrderByCreatedAtDesc(String category);

    List<Document> findByTransferId(String transferId);

    @Query("SELECT d FROM Document d WHERE d.supplier.id = :supplierId ORDER BY d.createdAt DESC")
    List<Document> findBySupplierId(@Param("supplierId") Long supplierId);

    @Query("SELECT d FROM Document d WHERE d.purchaseOrder.id = :poId ORDER BY d.createdAt DESC")
    List<Document> findByPurchaseOrderId(@Param("poId") Long poId);

    @Query("SELECT d FROM Document d WHERE LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(d.description) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY d.createdAt DESC")
    List<Document> searchDocuments(@Param("search") String search);

    @Query("SELECT d.category, COUNT(d) FROM Document d GROUP BY d.category")
    List<Object[]> countByCategory();

    @Query("SELECT COUNT(d) FROM Document d WHERE d.status = :status")
    long countByStatus(@Param("status") String status);

    @Query("SELECT d FROM Document d WHERE d.status = 'ACTIVE' ORDER BY d.createdAt DESC")
    List<Document> findActiveDocuments();
}
