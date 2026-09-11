package com.ecomart.service.impl;

import com.ecomart.dto.request.PolicyRequest;
import com.ecomart.dto.response.PageResponse;
import com.ecomart.dto.response.PolicyResponse;
import com.ecomart.entity.Category;
import com.ecomart.entity.Policy;
import com.ecomart.entity.Product;
import com.ecomart.entity.enums.FeeBearer;
import com.ecomart.entity.enums.PolicyType;
import com.ecomart.exception.ResourceNotFoundException;
import com.ecomart.repository.CategoryRepository;
import com.ecomart.repository.PolicyRepository;
import com.ecomart.repository.ProductRepository;
import com.ecomart.service.PolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PolicyServiceImpl implements PolicyService {

    private final PolicyRepository policyRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public Policy resolvePolicy(Long productId, Long categoryId, PolicyType policyType) {
        // 1. Check Product-level policy
        if (productId != null) {
            Optional<Policy> productPolicy = policyRepository.findFirstByProductIdAndPolicyTypeAndIsActiveTrue(productId, policyType);
            if (productPolicy.isPresent()) {
                return productPolicy.get();
            }
        }

        // 2. Check Category-level policy
        if (categoryId != null) {
            Optional<Policy> categoryPolicy = policyRepository.findFirstByCategoryIdAndPolicyTypeAndIsActiveTrue(categoryId, policyType);
            if (categoryPolicy.isPresent()) {
                return categoryPolicy.get();
            }
        }

        // 3. Check Global policy (productId is null and categoryId is null)
        Optional<Policy> globalPolicy = policyRepository.findFirstByProductIdIsNullAndCategoryIdIsNullAndPolicyTypeAndIsActiveTrue(policyType);
        if (globalPolicy.isPresent()) {
            return globalPolicy.get();
        }

        // 4. Default fallback if not defined in database
        if (policyType == PolicyType.RETURN) {
            return Policy.builder()
                    .name("Chính sách Đổi trả Mặc định EcoMart")
                    .policyType(PolicyType.RETURN)
                    .durationDays(7)
                    .shippingFeeBearer(FeeBearer.SHOP)
                    .conditionsDescription("Sản phẩm còn nguyên tem mác, hộp đựng và chưa qua sử dụng.")
                    .isActive(true)
                    .build();
        } else {
            return Policy.builder()
                    .name("Chính sách Bảo hành Mặc định EcoMart")
                    .policyType(PolicyType.WARRANTY)
                    .durationDays(180)
                    .shippingFeeBearer(FeeBearer.SHOP)
                    .conditionsDescription("Bảo hành các lỗi kỹ thuật phát sinh từ nhà sản xuất trong vòng 6 tháng.")
                    .isActive(true)
                    .build();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PolicyResponse> getPolicies(PolicyType type, Boolean isActive, int page, int pageSize) {
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Specification<Policy> spec = Specification.where(null);

        if (type != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("policyType"), type));
        }
        if (isActive != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("isActive"), isActive));
        }

        Page<Policy> policyPage = policyRepository.findAll(spec, pageable);
        List<PolicyResponse> content = policyPage.getContent().stream()
                .map(this::mapToPolicyResponse)
                .toList();

        return PageResponse.from(content, policyPage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PolicyResponse> getAllActivePolicies() {
        return policyRepository.findAllByIsActiveTrue().stream()
                .map(this::mapToPolicyResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PolicyResponse getPolicyById(Long id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chính sách không tồn tại với ID: " + id));
        return mapToPolicyResponse(policy);
    }

    @Override
    @Transactional
    public PolicyResponse createPolicy(PolicyRequest request) {
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại với ID: " + request.getCategoryId()));
        }

        Product product = null;
        if (request.getProductId() != null) {
            product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại với ID: " + request.getProductId()));
        }

        Policy policy = Policy.builder()
                .name(request.getName())
                .policyType(request.getPolicyType())
                .durationDays(request.getDurationDays())
                .category(category)
                .product(product)
                .shippingFeeBearer(request.getShippingFeeBearer())
                .conditionsDescription(request.getConditionsDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        Policy saved = policyRepository.save(policy);
        return mapToPolicyResponse(saved);
    }

    @Override
    @Transactional
    public PolicyResponse updatePolicy(Long id, PolicyRequest request) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chính sách không tồn tại với ID: " + id));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại với ID: " + request.getCategoryId()));
        }

        Product product = null;
        if (request.getProductId() != null) {
            product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại với ID: " + request.getProductId()));
        }

        policy.setName(request.getName());
        policy.setPolicyType(request.getPolicyType());
        policy.setDurationDays(request.getDurationDays());
        policy.setCategory(category);
        policy.setProduct(product);
        policy.setShippingFeeBearer(request.getShippingFeeBearer());
        policy.setConditionsDescription(request.getConditionsDescription());
        if (request.getIsActive() != null) {
            policy.setActive(request.getIsActive());
        }

        Policy updated = policyRepository.save(policy);
        return mapToPolicyResponse(updated);
    }

    @Override
    @Transactional
    public void deletePolicy(Long id) {
        if (!policyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Chính sách không tồn tại với ID: " + id);
        }
        policyRepository.deleteById(id);
    }

    private PolicyResponse mapToPolicyResponse(Policy policy) {
        return PolicyResponse.builder()
                .id(policy.getId())
                .name(policy.getName())
                .policyType(policy.getPolicyType())
                .durationDays(policy.getDurationDays())
                .categoryId(policy.getCategory() != null ? policy.getCategory().getId() : null)
                .categoryName(policy.getCategory() != null ? policy.getCategory().getName() : null)
                .productId(policy.getProduct() != null ? policy.getProduct().getId() : null)
                .productName(policy.getProduct() != null ? policy.getProduct().getName() : null)
                .shippingFeeBearer(policy.getShippingFeeBearer())
                .conditionsDescription(policy.getConditionsDescription())
                .isActive(policy.isActive())
                .createdAt(policy.getCreatedAt())
                .updatedAt(policy.getUpdatedAt())
                .build();
    }
}
