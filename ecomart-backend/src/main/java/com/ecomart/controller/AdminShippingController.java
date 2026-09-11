package com.ecomart.controller;

import com.ecomart.dto.request.UpdateShippingStatusRequest;
import com.ecomart.dto.response.ApiResponse;
import com.ecomart.dto.response.PageResponse;
import com.ecomart.dto.response.ShippingOrderResponse;
import com.ecomart.entity.enums.ShippingCarrier;
import com.ecomart.entity.enums.ShippingStatus;
import com.ecomart.entity.enums.ShippingType;
import com.ecomart.service.ShippingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/shipping")
@RequiredArgsConstructor
public class AdminShippingController {

    private final ShippingService shippingService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ShippingOrderResponse>>> getAdminShippingOrders(
            @RequestParam(required = false) ShippingType type,
            @RequestParam(required = false) ShippingStatus status,
            @RequestParam(required = false) ShippingCarrier carrier,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize
    ) {
        PageResponse<ShippingOrderResponse> response = shippingService.getAdminShippingOrders(type, status, carrier, page, pageSize);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách vận đơn thành công.", response));
    }

    @PatchMapping("/{trackingNumber}/status")
    public ResponseEntity<ApiResponse<ShippingOrderResponse>> updateStatus(
            @PathVariable String trackingNumber,
            @Valid @RequestBody UpdateShippingStatusRequest request
    ) {
        ShippingOrderResponse response = shippingService.updateShippingStatus(trackingNumber, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái vận đơn thành công.", response));
    }

    @PostMapping("/simulator/advance")
    public ResponseEntity<ApiResponse<Object>> advanceSimulation(
            @RequestParam(required = false) String trackingNumber
    ) {
        if (trackingNumber != null && !trackingNumber.trim().isEmpty()) {
            ShippingOrderResponse res = shippingService.advanceSimulationStep(trackingNumber.trim());
            return ResponseEntity.ok(ApiResponse.success("Đã mô phỏng bước kế tiếp cho vận đơn " + trackingNumber, res));
        } else {
            var list = shippingService.advanceAllActiveShipments();
            return ResponseEntity.ok(ApiResponse.success("Đã mô phỏng bước kế tiếp cho " + list.size() + " vận đơn đang hoạt động.", list));
        }
    }
}
