package com.ecomart.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnEligibilityResponse {

    private Long orderId;
    private String orderCode;
    private LocalDateTime orderCompletedAt;

    private boolean isEligibleForAny;

    private List<ReturnItemEligibilityResponse> items;
    private List<String> standardReasons;
}
