package com.ecomart.service;

import com.ecomart.dto.request.UpdateShippingStatusRequest;
import com.ecomart.dto.response.PageResponse;
import com.ecomart.dto.response.ShippingOrderResponse;
import com.ecomart.entity.Order;
import com.ecomart.entity.ReturnRequest;
import com.ecomart.entity.enums.ShippingCarrier;
import com.ecomart.entity.enums.ShippingStatus;
import com.ecomart.entity.enums.ShippingType;

import java.math.BigDecimal;
import java.util.List;

public interface ShippingService {

    BigDecimal calculateShippingFee(String fromProvince, String toProvince, BigDecimal weightKg, ShippingType type);

    ShippingOrderResponse createForwardShipping(Order order);

    ShippingOrderResponse createReverseShipping(ReturnRequest returnRequest);

    ShippingOrderResponse trackShipping(String trackingNumber);

    ShippingOrderResponse getForwardShippingByOrderId(Long orderId);

    ShippingOrderResponse updateShippingStatus(String trackingNumber, UpdateShippingStatusRequest request);

    PageResponse<ShippingOrderResponse> getAdminShippingOrders(
            ShippingType type,
            ShippingStatus status,
            ShippingCarrier carrier,
            int page,
            int pageSize
    );

    ShippingOrderResponse advanceSimulationStep(String trackingNumber);

    List<ShippingOrderResponse> advanceAllActiveShipments();
}
