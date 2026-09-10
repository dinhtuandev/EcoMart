package com.ecomart.dto.response;

public class SocialUserInfo {
    private String email;
    private String name;
    private String avatarUrl;
    private String providerId;

    public SocialUserInfo() {
    }

    public SocialUserInfo(String email, String name, String avatarUrl, String providerId) {
        this.email = email;
        this.name = name;
        this.avatarUrl = avatarUrl;
        this.providerId = providerId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String email;
        private String name;
        private String avatarUrl;
        private String providerId;

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder avatarUrl(String avatarUrl) {
            this.avatarUrl = avatarUrl;
            return this;
        }

        public Builder providerId(String providerId) {
            this.providerId = providerId;
            return this;
        }

        public SocialUserInfo build() {
            return new SocialUserInfo(email, name, avatarUrl, providerId);
        }
    }
}
