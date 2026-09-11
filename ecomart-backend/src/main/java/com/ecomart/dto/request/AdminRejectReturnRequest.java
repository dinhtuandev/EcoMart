package com.ecomart.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminRejectReturnRequest {

    @NotBlank(message = "Lý do từ chối không được để trống")
    private String rejectionReason;
}
