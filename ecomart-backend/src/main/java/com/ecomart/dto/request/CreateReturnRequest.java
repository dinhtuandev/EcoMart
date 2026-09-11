package com.ecomart.dto.request;

import com.ecomart.entity.enums.ReturnRequestType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateReturnRequest {

    @NotNull(message = "ID đơn hàng không được để trống")
    private Long orderId;

    @NotNull(message = "Loại yêu cầu không được để trống")
    private ReturnRequestType requestType;

    @NotBlank(message = "Lý do không được để trống")
    private String reason;

    private String customerNote;

    @NotEmpty(message = "Danh sách sản phẩm yêu cầu đổi trả không được để trống")
    @Valid
    private List<ReturnItemRequest> items;

    @NotEmpty(message = "Vui lòng cung cấp ít nhất 1 hình ảnh hoặc video minh chứng")
    private List<String> evidenceUrls;

    private String pickupAddress;

    private String pickupContactName;

    private String pickupContactPhone;
}
