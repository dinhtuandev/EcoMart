package com.ecomart.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnItemRequest {

    @NotNull(message = "ID món hàng không được để trống")
    private Long orderItemId;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng yêu cầu đổi trả tối thiểu là 1")
    private Integer quantity;
}
