package com.ecomart.entity;

import com.ecomart.entity.enums.FeeBearer;
import com.ecomart.entity.enums.ShippingCarrier;
import com.ecomart.entity.enums.ShippingStatus;
import com.ecomart.entity.enums.ShippingType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "shipping_orders",
        indexes = {
                @Index(name = "idx_shipping_orders_tracking", columnList = "tracking_number"),
                @Index(name = "idx_shipping_orders_order_id", columnList = "order_id"),
                @Index(name = "idx_shipping_orders_return_req_id", columnList = "return_request_id"),
                @Index(name = "idx_shipping_orders_status", columnList = "status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tracking_number", nullable = false, unique = true, length = 50)
    private String trackingNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "return_request_id")
    private ReturnRequest returnRequest;

    @Enumerated(EnumType.STRING)
    @Column(name = "shipping_type", nullable = false, length = 20)
    private ShippingType shippingType;

    @Enumerated(EnumType.STRING)
    @Column(name = "carrier", nullable = false, length = 30)
    @Builder.Default
    private ShippingCarrier carrier = ShippingCarrier.ECO_EXPRESS;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ShippingStatus status;

    @Column(name = "sender_name", nullable = false, length = 150)
    private String senderName;

    @Column(name = "sender_phone", nullable = false, length = 20)
    private String senderPhone;

    @Column(name = "sender_address", nullable = false, length = 500)
    private String senderAddress;

    @Column(name = "receiver_name", nullable = false, length = 150)
    private String receiverName;

    @Column(name = "receiver_phone", nullable = false, length = 20)
    private String receiverPhone;

    @Column(name = "receiver_address", nullable = false, length = 500)
    private String receiverAddress;

    @Column(name = "shipping_fee", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal shippingFee = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "fee_bearer", nullable = false, length = 20)
    @Builder.Default
    private FeeBearer feeBearer = FeeBearer.SHOP;

    @Column(name = "cod_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal codAmount = BigDecimal.ZERO;

    @Column(name = "estimated_delivery_at")
    private LocalDateTime estimatedDeliveryAt;

    @Column(name = "picked_at")
    private LocalDateTime pickedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder.Default
    @OneToMany(mappedBy = "shippingOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ShippingLog> logs = new ArrayList<>();
}
