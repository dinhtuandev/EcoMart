package com.ecomart.service.impl;

import com.ecomart.dto.response.SocialUserInfo;
import com.ecomart.entity.enums.AuthProvider;
import com.ecomart.exception.BadRequestException;
import com.ecomart.exception.UnauthorizedException;
import com.ecomart.service.SocialAuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class SocialAuthServiceImpl implements SocialAuthService {

    private static final Logger log = LoggerFactory.getLogger(SocialAuthServiceImpl.class);

    private final RestTemplate restTemplate = new RestTemplate();

    @org.springframework.beans.factory.annotation.Value("${app.oauth2.google.client-id:}")
    private String googleClientId;

    @org.springframework.beans.factory.annotation.Value("${app.oauth2.facebook.client-id:}")
    private String facebookClientId;

    private static final String GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token={token}";
    private static final String FACEBOOK_USER_INFO_URL = "https://graph.facebook.com/me?fields=id,name,email,picture.width(300).height(300)&access_token={token}";

    @Override
    public com.ecomart.dto.response.SocialConfigResponse getSocialConfig() {
        return new com.ecomart.dto.response.SocialConfigResponse(googleClientId, facebookClientId);
    }

    @Override
    public SocialUserInfo verifyAndGetUserInfo(AuthProvider provider, String token) {
        return switch (provider) {
            case GOOGLE -> verifyGoogleToken(token);
            case FACEBOOK -> verifyFacebookToken(token);
            default -> throw new BadRequestException("Phương thức đăng nhập mạng xã hội không được hỗ trợ: " + provider);
        };
    }

    @SuppressWarnings("unchecked")
    private SocialUserInfo verifyGoogleToken(String idToken) {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(GOOGLE_TOKEN_INFO_URL, Map.class, idToken);
            Map<String, Object> body = response.getBody();

            if (body == null || body.get("email") == null) {
                throw new BadRequestException("Không tìm thấy thông tin email từ tài khoản Google của bạn.");
            }

            // Kiểm tra tính hợp lệ của Audience (aud) nếu đã cấu hình Client ID
            String aud = (String) body.get("aud");
            if (googleClientId != null && !googleClientId.isBlank() && !googleClientId.equals(aud)) {
                log.warn("Token Google không hợp lệ: aud [{}] không khớp với clientId cấu hình [{}]", aud, googleClientId);
                throw new UnauthorizedException("Token Google không hợp lệ (Audience không khớp Client ID của ứng dụng).");
            }

            String email = (String) body.get("email");
            String name = (String) body.getOrDefault("name", "Google User");
            String picture = (String) body.get("picture");
            String sub = (String) body.get("sub");

            return SocialUserInfo.builder()
                    .email(email.trim().toLowerCase())
                    .name(name != null ? name.trim() : "Google User")
                    .avatarUrl(picture)
                    .providerId(sub)
                    .build();

        } catch (HttpClientErrorException.BadRequest | HttpClientErrorException.Unauthorized e) {
            log.warn("Xác thực Google id_token thất bại: {}", e.getMessage());
            throw new UnauthorizedException("Google Token không hợp lệ hoặc đã hết hạn.");
        } catch (Exception e) {
            log.error("Lỗi khi kết nối tới máy chủ Google OAuth2: {}", e.getMessage(), e);
            throw new UnauthorizedException("Không thể xác thực danh tính với Google. Vui lòng thử lại.");
        }
    }

    @SuppressWarnings("unchecked")
    private SocialUserInfo verifyFacebookToken(String accessToken) {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(FACEBOOK_USER_INFO_URL, Map.class, accessToken);
            Map<String, Object> body = response.getBody();

            if (body == null) {
                throw new UnauthorizedException("Không thể lấy thông tin tài khoản Facebook từ access token.");
            }

            String email = (String) body.get("email");
            if (email == null || email.isBlank()) {
                throw new BadRequestException("Tài khoản Facebook của bạn chưa liên kết email công khai. Vui lòng cấp quyền email hoặc đăng ký tài khoản EcoMart bằng Email thông thường.");
            }

            String name = (String) body.getOrDefault("name", "Facebook User");
            String id = (String) body.get("id");

            String avatarUrl = null;
            if (body.get("picture") instanceof Map<?, ?> pictureMap) {
                Object dataObj = pictureMap.get("data");
                if (dataObj instanceof Map<?, ?> dataMap) {
                    avatarUrl = (String) dataMap.get("url");
                }
            }

            return SocialUserInfo.builder()
                    .email(email.trim().toLowerCase())
                    .name(name != null ? name.trim() : "Facebook User")
                    .avatarUrl(avatarUrl)
                    .providerId(id)
                    .build();

        } catch (HttpClientErrorException.BadRequest | HttpClientErrorException.Unauthorized e) {
            log.warn("Xác thực Facebook access_token thất bại: {}", e.getMessage());
            throw new UnauthorizedException("Facebook Access Token không hợp lệ hoặc đã hết hạn.");
        } catch (Exception e) {
            log.error("Lỗi khi kết nối tới máy chủ Facebook Graph API: {}", e.getMessage(), e);
            throw new UnauthorizedException("Không thể xác thực danh tính với Facebook. Vui lòng thử lại.");
        }
    }
}
