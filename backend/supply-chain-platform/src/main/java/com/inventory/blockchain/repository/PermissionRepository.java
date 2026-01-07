package com.inventory.blockchain.repository;

import com.inventory.blockchain.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

    Optional<Permission> findByCode(String code);
    
    List<Permission> findByCategory(String category);
    
    @Query("SELECT DISTINCT p.category FROM Permission p ORDER BY p.category")
    List<String> findAllCategories();
    
    @Query("SELECT p FROM Permission p WHERE p.code IN :codes")
    Set<Permission> findByCodes(Set<String> codes);
    
    List<Permission> findAllByOrderByCategoryAscNameAsc();
}
