package com.ecomart.controller;

import com.ecomart.dto.response.ApiResponse;
import com.ecomart.dto.response.ShippingOrderResponse;
import com.ecomart.entity.enums.ShippingType;
import com.ecomart.service.ShippingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/shipping")
@RequiredArgsConstructor
public class CustomerShippingController {

    private final ShippingService shippingService;

    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<ApiResponse<ShippingOrderResponse>> trackShipping(@PathVariable String trackingNumber) {
        ShippingOrderResponse response = shippingService.trackShipping(trackingNumber);
        return ResponseEntity.ok(ApiResponse.success("Tra cứu vận đơn thành công.", response));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<ShippingOrderResponse>> getShippingByOrderId(@PathVariable Long orderId) {
        ShippingOrderResponse response = shippingService.getForwardShippingByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin vận đơn theo đơn hàng thành công.", response));
    }

    @GetMapping("/estimate-fee")
    public ResponseEntity<ApiResponse<BigDecimal>> estimateShippingFee(
            @RequestParam String fromProvince,
            @RequestParam String toProvince,
            @RequestParam(defaultValue = "1.0") BigDecimal weightKg,
            @RequestParam(defaultValue = "FORWARD") ShippingType type
    ) {
        BigDecimal fee = shippingService.calculateShippingFee(fromProvince, toProvince, weightKg, type);
        return ResponseEntity.ok(ApiResponse.success("Ước tính phí vận chuyển thành công.", fee));
    }
}
