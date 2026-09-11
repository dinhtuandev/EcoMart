package com.ecomart.repository;

import com.ecomart.entity.Inventory;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long>, JpaSpecificationExecutor<Inventory> {

    Optional<Inventory> findByProductId(Long productId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.product.id IN :productIds ORDER BY i.product.id ASC")
    List<Inventory> findAllByProductIdsWithLock(@Param("productIds") Collection<Long> productIds);

    @Modifying
    @Query("UPDATE Inventory i SET i.quantity = i.quantity + :qty, i.updatedAt = CURRENT_TIMESTAMP WHERE i.product.id = :productId")
    int incrementStock(@Param("productId") Long productId, @Param("qty") Integer qty);

    long countByQuantityLessThanEqual(Integer threshold);

    @Query("SELECT i.product.id, i.product.name, i.product.category.name, i.quantity, i.product.sellingPrice " +
           "FROM Inventory i " +
           "WHERE i.quantity <= :threshold " +
           "ORDER BY i.quantity ASC")
    List<Object[]> findLowStockProductsDetailed(@Param("threshold") Integer threshold);
}
