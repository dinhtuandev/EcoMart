package com.ecomart.controller;

import com.ecomart.dto.request.CreateReturnRequest;
import com.ecomart.dto.response.ApiResponse;
import com.ecomart.dto.response.PageResponse;
import com.ecomart.dto.response.ReturnEligibilityResponse;
import com.ecomart.dto.response.ReturnRequestResponse;
import com.ecomart.entity.enums.ReturnRequestStatus;
import com.ecomart.security.UserPrincipal;
import com.ecomart.service.ReturnService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/returns")
@RequiredArgsConstructor
public class CustomerReturnController {

    private final ReturnService returnService;

    @GetMapping("/eligibility/{orderId}")
    public ResponseEntity<ApiResponse<ReturnEligibilityResponse>> checkEligibility(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long orderId
    ) {
        ReturnEligibilityResponse response = returnService.checkReturnEligibility(currentUser.getId(), orderId);
        return ResponseEntity.ok(ApiResponse.success("Kiểm tra điều kiện đổi trả thành công.", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReturnRequestResponse>> createReturnRequest(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CreateReturnRequest request
    ) {
        ReturnRequestResponse response = returnService.createReturnRequest(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Gửi yêu cầu đổi trả/bảo hành thành công.", response));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<ApiResponse<PageResponse<ReturnRequestResponse>>> getMyRequests(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(required = false) ReturnRequestStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize
    ) {
        PageResponse<ReturnRequestResponse> response = returnService.getCustomerReturnRequests(currentUser.getId(), status, page, pageSize);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách yêu cầu đổi trả thành công.", response));
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<ApiResponse<ReturnRequestResponse>> getRequestDetail(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long requestId
    ) {
        ReturnRequestResponse response = returnService.getCustomerReturnRequestDetail(currentUser.getId(), requestId);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết yêu cầu đổi trả thành công.", response));
    }

    @PostMapping("/{requestId}/cancel")
    public ResponseEntity<ApiResponse<ReturnRequestResponse>> cancelRequest(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long requestId
    ) {
        ReturnRequestResponse response = returnService.cancelReturnRequest(currentUser.getId(), requestId);
        return ResponseEntity.ok(ApiResponse.success("Hủy yêu cầu đổi trả thành công.", response));
    }
}
