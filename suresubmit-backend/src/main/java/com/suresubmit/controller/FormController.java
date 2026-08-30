package com.suresubmit.controller;

import com.suresubmit.dto.FormCreateRequest;
import com.suresubmit.dto.PasswordConfirmRequest;
import com.suresubmit.dto.RuleApprovalRequest;
import com.suresubmit.entity.Form;
import com.suresubmit.entity.User;
import com.suresubmit.entity.UserSession;
import com.suresubmit.repository.FormRepository;
import com.suresubmit.repository.FormSubmissionRepository;
import com.suresubmit.repository.UserRepository;
import com.suresubmit.repository.UserSessionRepository;
import com.suresubmit.service.FormService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api/forms")
@CrossOrigin(origins = "*")
public class FormController {

    @Autowired
    private FormRepository formRepository;

    @Autowired
    private FormSubmissionRepository formSubmissionRepository;

    @Autowired
    private UserSessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FormService formService;

    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes("UTF-8"));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @PostMapping
    public ResponseEntity<Form> createForm(@RequestBody FormCreateRequest request) {
        try {
            Form savedForm = formService.createFormWithDetails(request);
            return new ResponseEntity<>(savedForm, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Form>> getAllForms(@RequestParam(value = "userId", required = false) Long userId) {
        try {
            List<Form> forms = (userId != null)
                ? formRepository.findByUserIdOrderByCreatedAtDesc(userId)
                : formRepository.findAll();
            return new ResponseEntity<>(forms, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Form> getFormById(@PathVariable Long id) {
        return formRepository.findById(id)
            .map(form -> new ResponseEntity<>(form, HttpStatus.OK))
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PutMapping("/{formId}/rules/{ruleId}/approve")
    public ResponseEntity<Form> approveRule(
            @PathVariable Long formId,
            @PathVariable Long ruleId,
            @RequestBody RuleApprovalRequest request) {
        try {
            Form updatedForm = formService.updateRuleApproval(formId, ruleId, request.getApproved());
            return new ResponseEntity<>(updatedForm, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{formId}/rules/{ruleId}")
    public ResponseEntity<Form> deleteRule(
            @PathVariable Long formId,
            @PathVariable Long ruleId) {
        try {
            Form updatedForm = formService.deleteRule(formId, ruleId);
            return new ResponseEntity<>(updatedForm, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{formId}")
    public ResponseEntity<?> deleteForm(
            @PathVariable Long formId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody(required = false) PasswordConfirmRequest request) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            String token = authHeader.substring(7);
            UserSession session = sessionRepository.findByToken(token).orElse(null);
            if (session == null || session.getExpiresAt().isBefore(LocalDateTime.now())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            Form form = formRepository.findById(formId).orElse(null);
            if (form == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            User owner = userRepository.findById(form.getUserId()).orElse(null);
            if (owner == null || !owner.getId().equals(session.getUser().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            if (request == null || request.getPassword() == null
                || !owner.getPasswordHash().equals(hashPassword(request.getPassword()))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            formSubmissionRepository.deleteAll(formSubmissionRepository.findByFormId(formId));
            formRepository.delete(form);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}