package com.ecomart.service;

import com.ecomart.dto.response.SocialConfigResponse;
import com.ecomart.dto.response.SocialUserInfo;
import com.ecomart.entity.enums.AuthProvider;

public interface SocialAuthService {
    SocialUserInfo verifyAndGetUserInfo(AuthProvider provider, String token);

    SocialConfigResponse getSocialConfig();
}
