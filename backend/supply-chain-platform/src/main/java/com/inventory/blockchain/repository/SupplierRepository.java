package com.inventory.blockchain.repository;

import com.inventory.blockchain.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    Optional<Supplier> findBySupplierCode(String supplierCode);

    boolean existsBySupplierCode(String supplierCode);

    List<Supplier> findByStatus(String status);

    List<Supplier> findAllByOrderByNameAsc();

    List<Supplier> findByStatusOrderByRatingDesc(String status);

    @Query("SELECT s FROM Supplier s WHERE s.status = 'ACTIVE' ORDER BY s.rating DESC")
    List<Supplier> findActiveSuppliersByRating();

    @Query("SELECT s FROM Supplier s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.supplierCode) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Supplier> searchSuppliers(@Param("search") String search);

    @Query("SELECT COUNT(s) FROM Supplier s WHERE s.status = :status")
    long countByStatus(@Param("status") String status);
}
