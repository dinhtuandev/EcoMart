package com.ecomart.dto.request;

import com.ecomart.entity.enums.AuthProvider;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialLoginRequest {

    @NotNull(message = "Nhà cung cấp đăng nhập không được để trống (GOOGLE hoặc FACEBOOK)")
    private AuthProvider provider;

    @NotBlank(message = "Token xác thực không được để trống")
    private String token;
}
