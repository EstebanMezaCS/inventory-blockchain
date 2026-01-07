package com.inventory.blockchain.repository;

import com.inventory.blockchain.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    Page<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    @Query("SELECT a FROM ActivityLog a WHERE a.createdAt BETWEEN :start AND :end ORDER BY a.createdAt DESC")
    List<ActivityLog> findByDateRange(
            @Param("start") LocalDateTime start, 
            @Param("end") LocalDateTime end);
    
    @Query("SELECT a FROM ActivityLog a WHERE a.entityType = :entityType ORDER BY a.createdAt DESC")
    List<ActivityLog> findByEntityType(@Param("entityType") String entityType);
    
    @Query("SELECT a FROM ActivityLog a WHERE a.action = :action ORDER BY a.createdAt DESC")
    List<ActivityLog> findByAction(@Param("action") String action);
    
    @Query("SELECT a FROM ActivityLog a WHERE a.user.id = :userId AND a.createdAt BETWEEN :start AND :end ORDER BY a.createdAt DESC")
    List<ActivityLog> findByUserAndDateRange(
            @Param("userId") Long userId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
    
    @Query("SELECT COUNT(a) FROM ActivityLog a WHERE a.action = :action AND a.createdAt >= :since")
    long countByActionSince(@Param("action") String action, @Param("since") LocalDateTime since);
}
