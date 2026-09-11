package com.ecomart.service;

import com.ecomart.dto.request.AdminApproveReturnRequest;
import com.ecomart.dto.request.AdminQCInspectionRequest;
import com.ecomart.dto.request.AdminRejectReturnRequest;
import com.ecomart.dto.request.CreateReturnRequest;
import com.ecomart.dto.response.PageResponse;
import com.ecomart.dto.response.ReturnEligibilityResponse;
import com.ecomart.dto.response.ReturnRequestResponse;
import com.ecomart.entity.enums.ReturnRequestStatus;
import com.ecomart.entity.enums.ReturnRequestType;

public interface ReturnService {

    ReturnEligibilityResponse checkReturnEligibility(Long userId, Long orderId);

    ReturnRequestResponse createReturnRequest(Long userId, CreateReturnRequest request);

    PageResponse<ReturnRequestResponse> getCustomerReturnRequests(Long userId, ReturnRequestStatus status, int page, int pageSize);

    ReturnRequestResponse getCustomerReturnRequestDetail(Long userId, Long requestId);

    ReturnRequestResponse cancelReturnRequest(Long userId, Long requestId);

    PageResponse<ReturnRequestResponse> getAdminReturnRequests(
            ReturnRequestStatus status,
            ReturnRequestType type,
            String keyword,
            int page,
            int pageSize
    );

    ReturnRequestResponse getAdminReturnRequestDetail(Long requestId);

    ReturnRequestResponse approveReturnRequest(Long requestId, AdminApproveReturnRequest request);

    ReturnRequestResponse rejectReturnRequest(Long requestId, AdminRejectReturnRequest request);

    ReturnRequestResponse processQCInspection(Long requestId, AdminQCInspectionRequest request);
}
