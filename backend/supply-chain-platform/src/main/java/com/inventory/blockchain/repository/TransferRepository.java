package com.inventory.blockchain.repository;

import com.inventory.blockchain.entity.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, Long> {

    Optional<Transfer> findByTransferId(String transferId);

    boolean existsByTransferId(String transferId);

    List<Transfer> findByStatus(String status);

    List<Transfer> findByFromLocation(String fromLocation);

    List<Transfer> findByToLocation(String toLocation);

    List<Transfer> findAllByOrderByCreatedAtDesc();

    @Query("SELECT t FROM Transfer t WHERE t.createdAt BETWEEN :start AND :end ORDER BY t.createdAt DESC")
    List<Transfer> findByDateRange(@Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end);

    @Query("SELECT t FROM Transfer t WHERE t.status = :status ORDER BY t.createdAt DESC")
    List<Transfer> findByStatusOrderByCreatedAtDesc(@Param("status") String status);

    @Query("SELECT t FROM Transfer t WHERE t.fromLocation = :location OR t.toLocation = :location ORDER BY t.createdAt DESC")
    List<Transfer> findByLocation(@Param("location") String location);

    @Query("SELECT t FROM Transfer t WHERE t.blockNumber IS NOT NULL ORDER BY t.blockNumber DESC")
    List<Transfer> findAllWithBlockNumber();

    @Query("SELECT COUNT(t) FROM Transfer t WHERE t.status = :status")
    long countByStatus(@Param("status") String status);
}
