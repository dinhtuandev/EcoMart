package com.ecomart.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnItemEligibilityResponse {

    private Long orderItemId;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private BigDecimal unitPrice;
    private Integer purchasedQuantity;
    private Integer availableReturnQuantity;

    private LocalDateTime returnEligibleUntil;
    private boolean isReturnEligible;

    private LocalDateTime warrantyEligibleUntil;
    private boolean isWarrantyEligible;

    private String returnPolicyName;
    private String warrantyPolicyName;
    private String conditions;
}
