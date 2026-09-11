package com.ecomart.dto.request;

import com.ecomart.entity.enums.FeeBearer;
import com.ecomart.entity.enums.PolicyType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PolicyRequest {

    @NotBlank(message = "Tên chính sách không được để trống")
    private String name;

    @NotNull(message = "Loại chính sách không được để trống")
    private PolicyType policyType;

    @NotNull(message = "Số ngày hiệu lực không được để trống")
    @Min(value = 1, message = "Thời hạn hiệu lực tối thiểu là 1 ngày")
    private Integer durationDays;

    private Long categoryId;

    private Long productId;

    @NotNull(message = "Bên chịu phí vận chuyển không được để trống")
    private FeeBearer shippingFeeBearer;

    private String conditionsDescription;

    private Boolean isActive;
}
