package com.suresubmit.service;

import com.suresubmit.entity.Form;
import com.suresubmit.entity.User;
import com.suresubmit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private UserRepository userRepository;

    @Value("${app.mail.from:no-reply@suresubmit.app}")
    private String fromAddress;

    @Value("${app.mail.enabled:false}")
    private boolean enabled;

    public void sendNewSubmissionNotification(Form form, String payloadJson) {
        if (!enabled || mailSender == null || form == null || form.getUserId() == null) {
            return;
        }
        User owner = userRepository.findById(form.getUserId()).orElse(null);
        if (owner == null || owner.getEmail() == null || owner.getEmail().isBlank()) {
            return;
        }

        String body = """
            A new response was submitted to your form.

            Form: %s
            Submitted at: %s

            Response data:
            %s

            --
            You are receiving this because you own the form "%s" on SureSubmit.
            """.formatted(
            form.getTitle() != null ? form.getTitle() : "Form #" + form.getId(),
            java.time.LocalDateTime.now(),
            prettyPrint(payloadJson),
            form.getTitle() != null ? form.getTitle() : "Form #" + form.getId()
        );

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(owner.getEmail());
            message.setSubject("New response: " + (form.getTitle() != null ? form.getTitle() : "Form #" + form.getId()));
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            // Never let a failed notification break the submission
            e.printStackTrace();
        }
    }

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        if (!enabled || mailSender == null || toEmail == null || toEmail.isBlank()) {
            // Keeps the flow testable locally without SMTP credentials configured.
            System.out.println("[mail disabled] password reset link for " + toEmail + ": " + resetLink);
            return;
        }

        String body = """
            Hi,

            We received a request to reset the password for your SureSubmit account.

            Use the link below to choose a new password. It expires in 60 minutes.

            %s

            If you did not request this, you can safely ignore this email and your
            current password will keep working.
            """.formatted(resetLink);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("Reset your SureSubmit password");
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private String prettyPrint(String payloadJson) {
        if (payloadJson == null || payloadJson.isBlank()) {
            return "(empty)";
        }
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper()
                .writerWithDefaultPrettyPrinter()
                .writeValueAsString(
                    new com.fasterxml.jackson.databind.ObjectMapper()
                        .readValue(payloadJson, java.util.Map.class)
                );
        } catch (Exception e) {
            return payloadJson;
        }
    }
}