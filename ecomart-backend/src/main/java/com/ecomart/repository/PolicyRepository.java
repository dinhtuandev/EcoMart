package com.ecomart.repository;

import com.ecomart.entity.Policy;
import com.ecomart.entity.enums.PolicyType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Long>, JpaSpecificationExecutor<Policy> {

    Optional<Policy> findFirstByProductIdAndPolicyTypeAndIsActiveTrue(Long productId, PolicyType policyType);

    Optional<Policy> findFirstByCategoryIdAndPolicyTypeAndIsActiveTrue(Long categoryId, PolicyType policyType);

    Optional<Policy> findFirstByProductIdIsNullAndCategoryIdIsNullAndPolicyTypeAndIsActiveTrue(PolicyType policyType);

    List<Policy> findAllByIsActiveTrue();
}
