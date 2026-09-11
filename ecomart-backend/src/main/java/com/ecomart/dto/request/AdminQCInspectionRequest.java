package com.ecomart.dto.request;

import com.ecomart.entity.enums.ReturnRequestType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminQCInspectionRequest {

    @NotNull(message = "Kết quả kiểm định QC không được để trống")
    private Boolean qcPassed;

    @NotBlank(message = "Ghi chú kiểm định QC không được để trống")
    private String qcNotes;

    private ReturnRequestType action;
}
