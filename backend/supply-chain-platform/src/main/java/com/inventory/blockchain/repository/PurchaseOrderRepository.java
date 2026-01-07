package com.inventory.blockchain.repository;

import com.inventory.blockchain.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    Optional<PurchaseOrder> findByPoNumber(String poNumber);

    boolean existsByPoNumber(String poNumber);

    List<PurchaseOrder> findByStatus(String status);

    List<PurchaseOrder> findBySupplierId(Long supplierId);

    List<PurchaseOrder> findAllByOrderByCreatedAtDesc();

    List<PurchaseOrder> findBySupplierIdOrderByCreatedAtDesc(Long supplierId);

    @Query("SELECT po FROM PurchaseOrder po WHERE po.status IN :statuses ORDER BY po.createdAt DESC")
    List<PurchaseOrder> findByStatusIn(@Param("statuses") List<String> statuses);

    @Query("SELECT COUNT(po) FROM PurchaseOrder po WHERE po.status = :status")
    long countByStatus(@Param("status") String status);

    @Query("SELECT SUM(po.total) FROM PurchaseOrder po WHERE po.status = 'DELIVERED'")
    java.math.BigDecimal sumDeliveredTotal();

    @Query("SELECT po.supplier.id, COUNT(po) FROM PurchaseOrder po GROUP BY po.supplier.id")
    List<Object[]> countOrdersBySupplier();
}
