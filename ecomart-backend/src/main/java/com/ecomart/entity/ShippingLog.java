package com.ecomart.entity;

import com.ecomart.entity.enums.ShippingStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "shipping_logs",
        indexes = {
                @Index(name = "idx_shipping_logs_shipping_order_id", columnList = "shipping_order_id"),
                @Index(name = "idx_shipping_logs_timestamp", columnList = "timestamp")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipping_order_id", nullable = false)
    private ShippingOrder shippingOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ShippingStatus status;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @CreationTimestamp
    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;
}
