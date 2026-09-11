package com.ecomart.service;

public interface EmailService {

    void sendVerificationOtp(String toEmail, String fullName, String otpCode);

    void sendPasswordResetOtp(String toEmail, String fullName, String otpCode);

    void sendReturnRequestCreated(String toEmail, String fullName, String requestCode, String orderCode);

    void sendReturnRequestApproved(String toEmail, String fullName, String requestCode, String trackingNumber);

    void sendReturnRequestRejected(String toEmail, String fullName, String requestCode, String reason);

    void sendReturnQCResult(String toEmail, String fullName, String requestCode, boolean passed, String action, String notes);
}
