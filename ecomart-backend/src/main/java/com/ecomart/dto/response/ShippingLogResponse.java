package com.ecomart.dto.response;

import com.ecomart.entity.enums.ShippingStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingLogResponse {

    private Long id;
    private ShippingStatus status;
    private String location;
    private String note;
    private LocalDateTime timestamp;
}
