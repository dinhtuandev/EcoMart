package com.ecomart.dto.request;

import com.ecomart.entity.enums.ShippingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateShippingStatusRequest {

    @NotNull(message = "Trạng thái vận đơn không được để trống")
    private ShippingStatus status;

    private String location;

    private String note;
}
