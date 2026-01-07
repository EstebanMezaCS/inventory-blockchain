package com.inventory.blockchain.repository;

import com.inventory.blockchain.entity.SupplierProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierProductRepository extends JpaRepository<SupplierProduct, Long> {

    List<SupplierProduct> findBySupplierId(Long supplierId);

    List<SupplierProduct> findBySku(String sku);

    @Query("SELECT sp FROM SupplierProduct sp WHERE sp.sku = :sku AND sp.supplier.status = 'ACTIVE' ORDER BY sp.isPreferred DESC, sp.unitCost ASC")
    List<SupplierProduct> findActiveSuppliersBySku(@Param("sku") String sku);

    @Query("SELECT sp FROM SupplierProduct sp WHERE sp.supplier.id = :supplierId AND sp.isPreferred = true")
    List<SupplierProduct> findPreferredProductsBySupplier(@Param("supplierId") Long supplierId);

    Optional<SupplierProduct> findBySupplierIdAndSku(Long supplierId, String sku);

    @Query("SELECT DISTINCT sp.sku FROM SupplierProduct sp WHERE sp.supplier.id = :supplierId")
    List<String> findSkusBySupplierId(@Param("supplierId") Long supplierId);

    void deleteBySupplierIdAndSku(Long supplierId, String sku);
}
