package com.inventory.blockchain.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"location", "sku"})
})
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String location;

    @Column(nullable = false, length = 50)
    private String sku;

    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    @Column(length = 100)
    private String category;

    @Column(nullable = false)
    private Integer quantity = 0;

    @Column(name = "min_stock", nullable = false)
    private Integer minStock = 10;

    @Column(length = 20)
    private String unit = "units";

    @Column(precision = 10, scale = 2)
    private BigDecimal price = BigDecimal.ZERO;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    // Default constructor
    public Inventory() {
        this.lastUpdated = LocalDateTime.now();
    }

    // Constructor with required fields
    public Inventory(String location, String sku, String productName, Integer quantity) {
        this.location = location;
        this.sku = sku;
        this.productName = productName;
        this.quantity = quantity;
        this.lastUpdated = LocalDateTime.now();
    }

    // Full constructor
    public Inventory(String location, String sku, String productName, String category,
                     Integer quantity, Integer minStock, String unit, BigDecimal price) {
        this.location = location;
        this.sku = sku;
        this.productName = productName;
        this.category = category;
        this.quantity = quantity;
        this.minStock = minStock;
        this.unit = unit;
        this.price = price;
        this.lastUpdated = LocalDateTime.now();
    }

    // Update timestamp on changes
    @PreUpdate
    public void preUpdate() {
        this.lastUpdated = LocalDateTime.now();
    }

    // Business methods
    public boolean hasStock(int requestedQuantity) {
        return this.quantity >= requestedQuantity;
    }

    public boolean isLowStock() {
        return this.quantity <= this.minStock;
    }

    public void deductStock(int amount) {
        if (amount > this.quantity) {
            throw new IllegalArgumentException("Insufficient stock. Available: " + this.quantity + ", Requested: " + amount);
        }
        this.quantity -= amount;
        this.lastUpdated = LocalDateTime.now();
    }

    public void addStock(int amount) {
        this.quantity += amount;
        this.lastUpdated = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getMinStock() {
        return minStock;
    }

    public void setMinStock(Integer minStock) {
        this.minStock = minStock;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    @Override
    public String toString() {
        return "Inventory{" +
                "id=" + id +
                ", location='" + location + '\'' +
                ", sku='" + sku + '\'' +
                ", productName='" + productName + '\'' +
                ", quantity=" + quantity +
                ", minStock=" + minStock +
                '}';
    }
}
