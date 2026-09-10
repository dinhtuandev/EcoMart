package com.ecomart;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;

import java.nio.charset.StandardCharsets;
import java.util.Properties;

public class ResendIntegrationTest {

    @Test
    @Disabled("Chạy thủ công để kiểm tra gửi email thực tế qua Gmail SMTP khi đã set MAIL_USERNAME & MAIL_PASSWORD")
    void sendTestEmail() throws Exception {
        String username = System.getenv("MAIL_USERNAME");
        String password = System.getenv("MAIL_PASSWORD");
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            return;
        }

        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com");
        mailSender.setPort(587);
        mailSender.setUsername(username);
        mailSender.setPassword(password);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
        helper.setFrom(username, "EcoMart");
        helper.setTo(username);
        helper.setSubject("[EcoMart] Test Gmail SMTP Integration");
        helper.setText("<h3>Gửi thử email qua Gmail SMTP thành công!</h3>", true);

        mailSender.send(message);
        System.out.println(">>> [GMAIL SMTP SUCCESS] Email sent successfully!");
    }
}
