package com.ecomart.service;

import com.ecomart.dto.request.PolicyRequest;
import com.ecomart.dto.response.PageResponse;
import com.ecomart.dto.response.PolicyResponse;
import com.ecomart.entity.Policy;
import com.ecomart.entity.enums.PolicyType;

import java.util.List;

public interface PolicyService {

    Policy resolvePolicy(Long productId, Long categoryId, PolicyType policyType);

    PageResponse<PolicyResponse> getPolicies(PolicyType type, Boolean isActive, int page, int pageSize);

    List<PolicyResponse> getAllActivePolicies();

    PolicyResponse getPolicyById(Long id);

    PolicyResponse createPolicy(PolicyRequest request);

    PolicyResponse updatePolicy(Long id, PolicyRequest request);

    void deletePolicy(Long id);
}
