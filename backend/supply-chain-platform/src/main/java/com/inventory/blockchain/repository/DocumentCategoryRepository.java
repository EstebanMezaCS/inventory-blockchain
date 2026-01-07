package com.inventory.blockchain.repository;

import com.inventory.blockchain.entity.DocumentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentCategoryRepository extends JpaRepository<DocumentCategory, Long> {

    Optional<DocumentCategory> findByCode(String code);

    List<DocumentCategory> findByIsActiveTrue();

    List<DocumentCategory> findAllByOrderByNameAsc();
}
