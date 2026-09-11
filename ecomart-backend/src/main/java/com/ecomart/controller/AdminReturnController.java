package com.ecomart.controller;

import com.ecomart.dto.request.AdminApproveReturnRequest;
import com.ecomart.dto.request.AdminQCInspectionRequest;
import com.ecomart.dto.request.AdminRejectReturnRequest;
import com.ecomart.dto.response.ApiResponse;
import com.ecomart.dto.response.PageResponse;
import com.ecomart.dto.response.ReturnRequestResponse;
import com.ecomart.entity.enums.ReturnRequestStatus;
import com.ecomart.entity.enums.ReturnRequestType;
import com.ecomart.service.ReturnService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/returns")
@RequiredArgsConstructor
public class AdminReturnController {

    private final ReturnService returnService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ReturnRequestResponse>>> getAdminReturnRequests(
            @RequestParam(required = false) ReturnRequestStatus status,
            @RequestParam(required = false) ReturnRequestType type,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize
    ) {
        PageResponse<ReturnRequestResponse> response = returnService.getAdminReturnRequests(status, type, keyword, page, pageSize);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách yêu cầu đổi trả thành công.", response));
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<ApiResponse<ReturnRequestResponse>> getAdminReturnRequestDetail(@PathVariable Long requestId) {
        ReturnRequestResponse response = returnService.getAdminReturnRequestDetail(requestId);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết yêu cầu đổi trả thành công.", response));
    }

    @PostMapping("/{requestId}/approve")
    public ResponseEntity<ApiResponse<ReturnRequestResponse>> approveReturnRequest(
            @PathVariable Long requestId,
            @RequestBody(required = false) AdminApproveReturnRequest request
    ) {
        ReturnRequestResponse response = returnService.approveReturnRequest(requestId, request);
        return ResponseEntity.ok(ApiResponse.success("Phê duyệt yêu cầu đổi trả thành công.", response));
    }

    @PostMapping("/{requestId}/reject")
    public ResponseEntity<ApiResponse<ReturnRequestResponse>> rejectReturnRequest(
            @PathVariable Long requestId,
            @Valid @RequestBody AdminRejectReturnRequest request
    ) {
        ReturnRequestResponse response = returnService.rejectReturnRequest(requestId, request);
        return ResponseEntity.ok(ApiResponse.success("Từ chối yêu cầu đổi trả thành công.", response));
    }

    @PostMapping("/{requestId}/qc")
    public ResponseEntity<ApiResponse<ReturnRequestResponse>> processQC(
            @PathVariable Long requestId,
            @Valid @RequestBody AdminQCInspectionRequest request
    ) {
        ReturnRequestResponse response = returnService.processQCInspection(requestId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật kết quả kiểm định QC thành công.", response));
    }
}
