package com.suresubmit.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.suresubmit.entity.Form;
import com.suresubmit.entity.User;
import com.suresubmit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Sends transactional email. Two transports are supported:
 *
 * <ul>
 *   <li>HTTP API (preferred on Render) - free hosts block outbound SMTP ports 25/465/587,
 *       so an HTTPS call to the provider's REST API is the only reliable option there.</li>
 *   <li>SMTP - used when no API key is configured (works locally and on hosts that allow ports).</li>
 * </ul>
 * A failure here is never allowed to break the caller's request.
 */
@Service
public class NotificationService {

    private static final String BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private UserRepository userRepository;

    @Value("${app.mail.from:no-reply@suresubmit.app}")
    private String fromAddress;

    @Value("${app.mail.enabled:false}")
    private boolean enabled;

    @Value("${app.mail.api-key:}")
    private String apiKey;

    @Value("${app.mail.api-url:" + BREVO_ENDPOINT + "}")
    private String apiUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final RestClient restClient = RestClient.create();

    public void sendNewSubmissionNotification(Form form, String payloadJson) {
        if (!enabled || !hasTransport() || form == null || form.getUserId() == null) {
            return;
        }
        User owner = userRepository.findById(form.getUserId()).orElse(null);
        if (owner == null || owner.getEmail() == null || owner.getEmail().isBlank()) {
            return;
        }

        String title = form.getTitle() != null ? form.getTitle() : "Form #" + form.getId();
        String body = """
            A new response was submitted to your form.

            Form: %s
            Submitted at: %s

            Response data:
            %s

            --
            You are receiving this because you own the form "%s" on SureSubmit.
            """.formatted(
            title,
            java.time.LocalDateTime.now(),
            prettyPrint(payloadJson),
            title
        );

        deliver(owner.getEmail(), "New response: " + title, body);
    }

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        if (toEmail == null || toEmail.isBlank()) {
            return;
        }

        // Logging the link keeps the flow testable without any mail credentials.
        if (!enabled || !hasTransport()) {
            System.out.println("[mail not configured] password reset link for " + toEmail + ": " + resetLink);
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

        deliver(toEmail, "Reset your SureSubmit password", body);
    }

    private boolean hasTransport() {
        return (apiKey != null && !apiKey.isBlank()) || mailSender != null;
    }

    private void deliver(String to, String subject, String body) {
        if (apiKey != null && !apiKey.isBlank()) {
            sendViaApi(to, subject, body);
        } else {
            sendViaSmtp(to, subject, body);
        }
    }

    /** Uses the provider's HTTPS API, which works even where SMTP ports are blocked. */
    private void sendViaApi(String to, String subject, String body) {
        Map<String, Object> payload = Map.of(
            "sender", Map.of("name", "SureSubmit", "email", fromAddress),
            "to", List.of(Map.of("email", to)),
            "subject", subject,
            "textContent", body
        );

        try {
            String response = restClient.post()
                .uri(apiUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .header("api-key", apiKey)
                .header("accept", "application/json")
                .body(payload)
                .retrieve()
                .bodyTo(String.class);
            System.out.println("Mail sent via API to " + to + " -> " + response);
        } catch (Exception e) {
            // Delivery problems are logged, never thrown at the caller.
            System.err.println("Failed to send mail via API to " + to + ": " + e.getMessage());
        }
    }

    private void sendViaSmtp(String to, String subject, String body) {
        if (mailSender == null) {
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send mail via SMTP to " + to + ": " + e.getMessage());
        }
    }

    private String prettyPrint(String payloadJson) {
        if (payloadJson == null || payloadJson.isBlank()) {
            return "(empty)";
        }
        try {
            return objectMapper.writerWithDefaultPrettyPrinter()
                .writeValueAsString(objectMapper.readValue(payloadJson, Map.class));
        } catch (Exception e) {
            return payloadJson;
        }
    }
}
