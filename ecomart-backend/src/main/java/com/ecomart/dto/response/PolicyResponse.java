package com.ecomart.dto.response;

import com.ecomart.entity.enums.FeeBearer;
import com.ecomart.entity.enums.PolicyType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PolicyResponse {

    private Long id;
    private String name;
    private PolicyType policyType;
    private Integer durationDays;
    private Long categoryId;
    private String categoryName;
    private Long productId;
    private String productName;
    private FeeBearer shippingFeeBearer;
    private String conditionsDescription;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
