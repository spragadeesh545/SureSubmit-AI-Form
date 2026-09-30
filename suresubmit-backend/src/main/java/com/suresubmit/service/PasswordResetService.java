package com.suresubmit.service;

import com.suresubmit.entity.PasswordResetToken;
import com.suresubmit.entity.User;
import com.suresubmit.entity.UserSession;
import com.suresubmit.repository.PasswordResetTokenRepository;
import com.suresubmit.repository.UserRepository;
import com.suresubmit.repository.UserSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class PasswordResetService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int TOKEN_VALIDITY_MINUTES = 60;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSessionRepository sessionRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private NotificationService notificationService;

    @Value("${app.mail.frontend-url:https://sure-submit-ai-form.vercel.app}")
    private String frontendUrl;

    /**
     * Issues a reset token and emails the link. Returns false when the email is not registered;
     * callers must not reveal that to the requester (prevents account enumeration).
     */
    @Transactional
    public boolean createResetToken(String email) {
        if (email == null || email.isBlank()) {
            return false;
        }
        User user = userRepository.findByEmail(email.trim()).orElse(null);
        if (user == null) {
            return false;
        }

        // Only the newest link stays usable, so an older forwarded email cannot be replayed.
        for (PasswordResetToken existing : tokenRepository.findByUser(user)) {
            tokenRepository.delete(existing);
        }

        String rawToken = generateToken();
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setTokenHash(hash(rawToken));
        token.setCreatedAt(LocalDateTime.now());
        token.setExpiresAt(LocalDateTime.now().plusMinutes(TOKEN_VALIDITY_MINUTES));
        tokenRepository.save(token);

        notificationService.sendPasswordResetEmail(user.getEmail(), buildResetLink(rawToken));
        return true;
    }

    /** Result codes let the controller map outcomes to HTTP statuses without leaking details. */
    public enum ResetResult { SUCCESS, INVALID_TOKEN, EXPIRED_TOKEN, WEAK_PASSWORD }

    @Transactional
    public ResetResult resetPassword(String rawToken, String newPassword) {
        if (rawToken == null || rawToken.isBlank()) {
            return ResetResult.INVALID_TOKEN;
        }
        if (newPassword == null || newPassword.length() < 4) {
            return ResetResult.WEAK_PASSWORD;
        }

        PasswordResetToken token = tokenRepository.findByTokenHash(hash(rawToken)).orElse(null);
        if (token == null) {
            return ResetResult.INVALID_TOKEN;
        }
        if (token.getUsedAt() != null) {
            return ResetResult.INVALID_TOKEN;
        }
        if (token.getExpiresAt() != null && token.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResetResult.EXPIRED_TOKEN;
        }

        User user = token.getUser();
        user.setPasswordHash(hash(newPassword));
        userRepository.save(user);

        token.setUsedAt(LocalDateTime.now());
        tokenRepository.save(token);
        tokenRepository.deleteAll(tokenRepository.findByUser(user));

        // A password change must invalidate every existing session on other devices.
        for (UserSession session : sessionRepository.findByUser(user)) {
            sessionRepository.delete(session);
        }

        return ResetResult.SUCCESS;
    }

    private String buildResetLink(String rawToken) {
        String base = frontendUrl.endsWith("/") ? frontendUrl.substring(0, frontendUrl.length() - 1) : frontendUrl;
        return base + "/reset-password?token=" + rawToken;
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return Base64.getEncoder().encodeToString(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
