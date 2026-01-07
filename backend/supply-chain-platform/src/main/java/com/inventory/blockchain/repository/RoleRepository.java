package com.inventory.blockchain.repository;

import com.inventory.blockchain.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(String name);
    
    boolean existsByName(String name);
    
    List<Role> findByIsSystemRoleFalse();
    
    List<Role> findByIsSystemRoleTrue();
    
    @Query("SELECT r FROM Role r LEFT JOIN FETCH r.permissions ORDER BY r.name")
    List<Role> findAllWithPermissions();
    
    @Query("SELECT r FROM Role r LEFT JOIN FETCH r.permissions WHERE r.id = :id")
    Optional<Role> findByIdWithPermissions(Long id);
}
