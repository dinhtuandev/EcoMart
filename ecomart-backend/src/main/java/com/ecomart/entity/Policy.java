package com.ecomart.entity;

import com.ecomart.entity.enums.FeeBearer;
import com.ecomart.entity.enums.PolicyType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "policies",
        indexes = {
                @Index(name = "idx_policies_category_id", columnList = "category_id"),
                @Index(name = "idx_policies_product_id", columnList = "product_id"),
                @Index(name = "idx_policies_type", columnList = "policy_type")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "policy_type", nullable = false, length = 30)
    private PolicyType policyType;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(name = "shipping_fee_bearer", nullable = false, length = 20)
    @Builder.Default
    private FeeBearer shippingFeeBearer = FeeBearer.SHOP;

    @Column(name = "conditions_description", columnDefinition = "TEXT")
    private String conditionsDescription;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
