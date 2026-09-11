package com.ecomart.dto.response;

import com.ecomart.entity.enums.ReturnRequestStatus;
import com.ecomart.entity.enums.ReturnRequestType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnRequestResponse {

    private Long id;
    private String requestCode;
    private Long orderId;
    private String orderCode;
    private Long userId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private ReturnRequestType requestType;
    private ReturnRequestStatus status;
    private String reason;
    private String customerNote;
    private BigDecimal refundAmount;
    private String pickupAddress;
    private String pickupContactName;
    private String pickupContactPhone;
    private String adminNote;
    private String rejectionReason;
    private String qcNotes;
    private Boolean qcPassed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime completedAt;
    private List<ReturnRequestItemResponse> items;
    private List<ReturnRequestEvidenceResponse> evidences;
    private ShippingOrderResponse reverseShipping;
}
