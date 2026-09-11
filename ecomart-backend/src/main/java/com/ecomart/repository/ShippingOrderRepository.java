package com.ecomart.repository;

import com.ecomart.entity.ShippingOrder;
import com.ecomart.entity.enums.ShippingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShippingOrderRepository extends JpaRepository<ShippingOrder, Long>, JpaSpecificationExecutor<ShippingOrder> {

    Optional<ShippingOrder> findByTrackingNumber(String trackingNumber);

    List<ShippingOrder> findByOrderId(Long orderId);

    Optional<ShippingOrder> findByReturnRequestId(Long returnRequestId);

    List<ShippingOrder> findByStatusInOrderByUpdatedAtAsc(List<ShippingStatus> statuses);

    List<ShippingOrder> findByStatusIn(List<ShippingStatus> statuses);
}
