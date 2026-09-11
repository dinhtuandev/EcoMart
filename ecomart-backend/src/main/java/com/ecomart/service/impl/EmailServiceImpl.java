package com.ecomart.service.impl;

import com.ecomart.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    @Override
    public void sendVerificationOtp(String toEmail, String fullName, String otpCode) {
        String subject = "[EcoMart] Mã xác thực kích hoạt tài khoản của bạn";
        String htmlContent = buildOtpEmailTemplate(
                fullName,
                "Cảm ơn bạn đã đăng ký tài khoản tại EcoMart - Sàn thương mại điện tử thân thiện môi trường!",
                "Mã OTP kích hoạt tài khoản của bạn là:",
                otpCode,
                "Mã này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai."
        );

        sendEmailViaSmtp(toEmail, subject, htmlContent, otpCode, "VERIFICATION");
    }

    @Async
    @Override
    public void sendPasswordResetOtp(String toEmail, String fullName, String otpCode) {
        String subject = "[EcoMart] Mã OTP đặt lại mật khẩu";
        String htmlContent = buildOtpEmailTemplate(
                fullName,
                "Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản EcoMart của bạn.",
                "Mã OTP đặt lại mật khẩu của bạn là:",
                otpCode,
                "Mã này có hiệu lực trong vòng 15 phút. Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email."
        );

        sendEmailViaSmtp(toEmail, subject, htmlContent, otpCode, "PASSWORD_RESET");
    }

    @Async
    @Override
    public void sendReturnRequestCreated(String toEmail, String fullName, String requestCode, String orderCode) {
        String subject = "[EcoMart] Đã tiếp nhận yêu cầu đổi trả/bảo hành " + requestCode;
        String html = buildNotificationEmailTemplate(
                fullName,
                "Chúng tôi đã tiếp nhận yêu cầu đổi trả/bảo hành #" + requestCode + " cho đơn hàng #" + orderCode + ".",
                "Nhân viên CSKH EcoMart đang xử lý yêu cầu của bạn và sẽ phản hồi trong vòng 24 giờ làm việc.",
                "Bạn có thể theo dõi trạng thái yêu cầu tại mục 'Đổi trả & Bảo hành' trong tài khoản cá nhân."
        );
        sendEmailViaSmtp(toEmail, subject, html, requestCode, "RETURN_REQUEST_CREATED");
    }

    @Async
    @Override
    public void sendReturnRequestApproved(String toEmail, String fullName, String requestCode, String trackingNumber) {
        String subject = "[EcoMart] Yêu cầu đổi trả/bảo hành " + requestCode + " đã được DUYỆT";
        String html = buildNotificationEmailTemplate(
                fullName,
                "Yêu cầu đổi trả/bảo hành #" + requestCode + " của bạn đã được phê duyệt.",
                "Mã vận đơn thu hồi: <strong>" + trackingNumber + "</strong>. Bưu tá EcoMart Express sẽ liên hệ với bạn để lấy kiện hàng tại địa chỉ đã đăng ký.",
                "Vui lòng đóng gói sản phẩm cẩn thận kèm phụ kiện và hóa đơn (nếu có) trước khi giao cho bưu tá."
        );
        sendEmailViaSmtp(toEmail, subject, html, trackingNumber, "RETURN_REQUEST_APPROVED");
    }

    @Async
    @Override
    public void sendReturnRequestRejected(String toEmail, String fullName, String requestCode, String reason) {
        String subject = "[EcoMart] Thông báo về yêu cầu đổi trả/bảo hành " + requestCode;
        String html = buildNotificationEmailTemplate(
                fullName,
                "Rất tiếc, yêu cầu đổi trả/bảo hành #" + requestCode + " của bạn chưa đủ điều kiện để phê duyệt.",
                "Lý do: <em>" + reason + "</em>",
                "Nếu bạn có thắc mắc cần hỗ trợ thêm, vui lòng liên hệ hotline EcoMart để được giải đáp."
        );
        sendEmailViaSmtp(toEmail, subject, html, requestCode, "RETURN_REQUEST_REJECTED");
    }

    @Async
    @Override
    public void sendReturnQCResult(String toEmail, String fullName, String requestCode, boolean passed, String action, String notes) {
        String subject = passed
                ? "[EcoMart] Kiểm định sản phẩm " + requestCode + " thành công - Xử lý " + action
                : "[EcoMart] Kết quả kiểm định sản phẩm " + requestCode + " không đạt";

        String detail = passed
                ? "Kho EcoMart đã nhận được kiện hàng và kiểm định chất lượng (QC) đạt yêu cầu. Hệ thống đang tiến hành xử lý bước tiếp theo (" + action + ")."
                : "Kiểm tra thực tế sản phẩm không đạt điều kiện đổi trả/bảo hành. Ghi chú: " + notes + ". Sản phẩm sẽ được gửi trả lại bạn.";

        String html = buildNotificationEmailTemplate(fullName, detail, "Ghi chú từ bộ phận QC: " + notes, "Cảm ơn bạn đã tin tưởng mua sắm tại EcoMart.");
        sendEmailViaSmtp(toEmail, subject, html, requestCode, "RETURN_QC_RESULT");
    }

    private String buildNotificationEmailTemplate(String name, String line1, String line2, String note) {
        return "<div style=\"font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;\">"
                + "<div style=\"text-align: center; margin-bottom: 24px;\">"
                + "<h1 style=\"color: #16a34a; font-size: 28px; margin: 0; font-weight: 800; letter-spacing: -0.5px;\">🌿 EcoMart</h1>"
                + "<p style=\"color: #4b5563; font-size: 14px; margin-top: 4px;\">Hệ Thống Đổi Trả & Bảo Hành</p>"
                + "</div>"
                + "<div style=\"background-color: #ffffff; padding: 32px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);\">"
                + "<h2 style=\"color: #111827; font-size: 18px; margin-top: 0;\">Xin chào " + (name != null ? name : "Quý khách") + ",</h2>"
                + "<p style=\"color: #374151; font-size: 15px; line-height: 1.6;\">" + line1 + "</p>"
                + "<p style=\"color: #374151; font-size: 15px; line-height: 1.6;\">" + line2 + "</p>"
                + "<p style=\"color: #6b7280; font-size: 13px; line-height: 1.5; margin-top: 16px;\">" + note + "</p>"
                + "</div>"
                + "<div style=\"text-align: center; margin-top: 24px; color: #9ca3af; font-size: 12px;\">"
                + "<p>© 2026 EcoMart. Mua Sắm Bền Vững - An Tâm Tiêu Dùng.</p>"
                + "</div>"
                + "</div>";
    }

    private void sendEmailViaSmtp(String toEmail, String subject, String htmlContent, String otpCode, String type) {
        // Dev fallback: Nếu chưa cấu hình MAIL_USERNAME hoặc MAIL_PASSWORD, log OTP ra console để dev test tiện lợi
        if (mailUsername == null || mailUsername.isBlank() || mailPassword == null || mailPassword.isBlank()) {
            log.info("========== [GMAIL SMTP SIMULATION] ==========");
            log.info("Type: {}", type);
            log.info("To: {}", toEmail);
            log.info("Subject: {}", subject);
            log.info("OTP Code: {}", otpCode);
            log.info("Lưu ý: Điền MAIL_USERNAME và MAIL_PASSWORD (Google App Password) trong .env để gửi email thật.");
            log.info("=============================================");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

            helper.setFrom(mailUsername, "EcoMart");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Đã gửi email thành công qua Gmail SMTP tới {}", toEmail);
        } catch (Exception e) {
            log.warn("Không thể gửi email thực tế qua Gmail SMTP tới {} (Lỗi: {}). Sử dụng chế độ DEV fallback. OTP: {}",
                    toEmail, e.getMessage(), otpCode);
        }
    }

    private String buildOtpEmailTemplate(String name, String greeting, String instruction, String otpCode, String note) {
        return "<div style=\"font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;\">"
                + "<div style=\"text-align: center; margin-bottom: 24px;\">"
                + "<h1 style=\"color: #16a34a; font-size: 28px; margin: 0; font-weight: 800; letter-spacing: -0.5px;\">🌿 EcoMart</h1>"
                + "<p style=\"color: #4b5563; font-size: 14px; margin-top: 4px;\">Sống Xanh - Mua Sắm Bền Vững</p>"
                + "</div>"
                + "<div style=\"background-color: #ffffff; padding: 32px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);\">"
                + "<h2 style=\"color: #111827; font-size: 18px; margin-top: 0;\">Xin chào " + (name != null ? name : "Quý khách") + ",</h2>"
                + "<p style=\"color: #374151; font-size: 15px; line-height: 1.6;\">" + greeting + "</p>"
                + "<p style=\"color: #374151; font-size: 15px; margin-bottom: 8px;\">" + instruction + "</p>"
                + "<div style=\"text-align: center; margin: 28px 0;\">"
                + "<span style=\"display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #15803d; background-color: #dcfce7; padding: 14px 28px; border-radius: 8px; border: 2px dashed #86efac;\">"
                + otpCode + "</span>"
                + "</div>"
                + "<p style=\"color: #6b7280; font-size: 13px; line-height: 1.5;\">" + note + "</p>"
                + "</div>"
                + "<div style=\"text-align: center; margin-top: 24px; color: #9ca3af; font-size: 12px;\">"
                + "<p>© 2026 EcoMart. Bảo vệ môi trường bắt đầu từ thói quen tiêu dùng của bạn.</p>"
                + "</div>"
                + "</div>";
    }
}
