package com.ecomart.repository;

import com.ecomart.entity.ShippingLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShippingLogRepository extends JpaRepository<ShippingLog, Long> {

    List<ShippingLog> findByShippingOrderIdOrderByTimestampAsc(Long shippingOrderId);
}
