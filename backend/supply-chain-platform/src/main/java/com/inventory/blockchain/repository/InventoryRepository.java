package com.inventory.blockchain.repository;

import com.inventory.blockchain.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    // Find inventory by location and SKU
    Optional<Inventory> findByLocationAndSku(String location, String sku);

    // Find all inventory at a specific location
    List<Inventory> findByLocationOrderByProductNameAsc(String location);

    // Find all inventory for a specific SKU across all locations
    List<Inventory> findBySkuOrderByLocationAsc(String sku);

    // Find low stock items
    @Query("SELECT i FROM Inventory i WHERE i.quantity <= i.minStock ORDER BY i.quantity ASC")
    List<Inventory> findLowStockItems();

    // Find low stock items at a specific location
    @Query("SELECT i FROM Inventory i WHERE i.location = :location AND i.quantity <= i.minStock")
    List<Inventory> findLowStockByLocation(@Param("location") String location);

    // Check if sufficient stock exists
    @Query("SELECT CASE WHEN i.quantity >= :quantity THEN true ELSE false END FROM Inventory i WHERE i.location = :location AND i.sku = :sku")
    boolean hasStock(@Param("location") String location, @Param("sku") String sku, @Param("quantity") int quantity);

    // Get current quantity
    @Query("SELECT i.quantity FROM Inventory i WHERE i.location = :location AND i.sku = :sku")
    Optional<Integer> getQuantity(@Param("location") String location, @Param("sku") String sku);

    // Deduct stock (atomic operation)
    @Modifying
    @Query("UPDATE Inventory i SET i.quantity = i.quantity - :amount, i.lastUpdated = CURRENT_TIMESTAMP WHERE i.location = :location AND i.sku = :sku AND i.quantity >= :amount")
    int deductStock(@Param("location") String location, @Param("sku") String sku, @Param("amount") int amount);

    // Add stock (atomic operation)
    @Modifying
    @Query("UPDATE Inventory i SET i.quantity = i.quantity + :amount, i.lastUpdated = CURRENT_TIMESTAMP WHERE i.location = :location AND i.sku = :sku")
    int addStock(@Param("location") String location, @Param("sku") String sku, @Param("amount") int amount);

    // Find by category
    List<Inventory> findByCategoryOrderByProductNameAsc(String category);

    // Search by product name
    @Query("SELECT i FROM Inventory i WHERE LOWER(i.productName) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Inventory> searchByProductName(@Param("search") String search);

    // Get total value at a location
    @Query("SELECT SUM(i.quantity * i.price) FROM Inventory i WHERE i.location = :location")
    Optional<Double> getTotalValueByLocation(@Param("location") String location);

    // Get all unique locations
    @Query("SELECT DISTINCT i.location FROM Inventory i ORDER BY i.location")
    List<String> findAllLocations();

    // Get all unique SKUs
    @Query("SELECT DISTINCT i.sku FROM Inventory i ORDER BY i.sku")
    List<String> findAllSkus();

    // Get all unique categories
    @Query("SELECT DISTINCT i.category FROM Inventory i WHERE i.category IS NOT NULL ORDER BY i.category")
    List<String> findAllCategories();
}
