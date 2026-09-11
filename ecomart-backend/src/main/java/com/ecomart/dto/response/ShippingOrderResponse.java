package com.ecomart.dto.response;

import com.ecomart.entity.enums.FeeBearer;
import com.ecomart.entity.enums.ShippingCarrier;
import com.ecomart.entity.enums.ShippingStatus;
import com.ecomart.entity.enums.ShippingType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingOrderResponse {

    private Long id;
    private String trackingNumber;
    private Long orderId;
    private String orderCode;
    private Long returnRequestId;
    private String returnRequestCode;
    private ShippingType shippingType;
    private ShippingCarrier carrier;
    private ShippingStatus status;
    private String senderName;
    private String senderPhone;
    private String senderAddress;
    private String receiverName;
    private String receiverPhone;
    private String receiverAddress;
    private BigDecimal shippingFee;
    private FeeBearer feeBearer;
    private BigDecimal codAmount;
    private LocalDateTime estimatedDeliveryAt;
    private LocalDateTime pickedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ShippingLogResponse> logs;
}
