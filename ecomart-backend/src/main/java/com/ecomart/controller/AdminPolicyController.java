package com.ecomart.controller;

import com.ecomart.dto.request.PolicyRequest;
import com.ecomart.dto.response.ApiResponse;
import com.ecomart.dto.response.PageResponse;
import com.ecomart.dto.response.PolicyResponse;
import com.ecomart.entity.enums.PolicyType;
import com.ecomart.service.PolicyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AdminPolicyController {

    private final PolicyService policyService;

    // Public endpoint for customer to view all active policies
    @GetMapping("/api/v1/policies")
    public ResponseEntity<ApiResponse<List<PolicyResponse>>> getActivePolicies() {
        List<PolicyResponse> response = policyService.getAllActivePolicies();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách chính sách thành công.", response));
    }

    // Admin & Manager endpoints
    @GetMapping("/api/v1/admin/policies")
    public ResponseEntity<ApiResponse<PageResponse<PolicyResponse>>> getAdminPolicies(
            @RequestParam(required = false) PolicyType type,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize
    ) {
        PageResponse<PolicyResponse> response = policyService.getPolicies(type, isActive, page, pageSize);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách chính sách thành công.", response));
    }

    @GetMapping("/api/v1/admin/policies/{id}")
    public ResponseEntity<ApiResponse<PolicyResponse>> getPolicyById(@PathVariable Long id) {
        PolicyResponse response = policyService.getPolicyById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết chính sách thành công.", response));
    }

    @PostMapping("/api/v1/admin/policies")
    public ResponseEntity<ApiResponse<PolicyResponse>> createPolicy(@Valid @RequestBody PolicyRequest request) {
        PolicyResponse response = policyService.createPolicy(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo chính sách thành công.", response));
    }

    @PutMapping("/api/v1/admin/policies/{id}")
    public ResponseEntity<ApiResponse<PolicyResponse>> updatePolicy(
            @PathVariable Long id,
            @Valid @RequestBody PolicyRequest request
    ) {
        PolicyResponse response = policyService.updatePolicy(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật chính sách thành công.", response));
    }

    @DeleteMapping("/api/v1/admin/policies/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePolicy(@PathVariable Long id) {
        policyService.deletePolicy(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa chính sách thành công.", null));
    }
}
