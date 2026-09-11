package com.ecomart.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnRequestEvidenceResponse {

    private Long id;
    private String mediaUrl;
    private String mediaType;
    private LocalDateTime createdAt;
}
