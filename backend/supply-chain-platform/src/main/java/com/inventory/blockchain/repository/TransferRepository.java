package com.inventory.blockchain.repository;

import com.inventory.blockchain.entity.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, Long> {

    Optional<Transfer> findByTransferId(String transferId);

    boolean existsByTransferId(String transferId);

    List<Transfer> findAllByOrderByCreatedAtDesc();
}
