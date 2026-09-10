package com.ecomart.dto.response;

public class SocialConfigResponse {
    private String googleClientId;
    private String facebookAppId;

    public SocialConfigResponse() {
    }

    public SocialConfigResponse(String googleClientId, String facebookAppId) {
        this.googleClientId = googleClientId;
        this.facebookAppId = facebookAppId;
    }

    public String getGoogleClientId() {
        return googleClientId;
    }

    public void setGoogleClientId(String googleClientId) {
        this.googleClientId = googleClientId;
    }

    public String getFacebookAppId() {
        return facebookAppId;
    }

    public void setFacebookAppId(String facebookAppId) {
        this.facebookAppId = facebookAppId;
    }
}
