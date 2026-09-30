package com.suresubmit.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.suresubmit.dto.FormSubmissionRequest;
import com.suresubmit.entity.CrossFieldRule;
import com.suresubmit.entity.Field;
import com.suresubmit.entity.Form;
import com.suresubmit.entity.FormSubmission;
import com.suresubmit.repository.FormRepository;
import com.suresubmit.repository.FormSubmissionRepository;
import com.suresubmit.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@CrossOrigin(origins = "*")
public class FormSubmissionController {

    @Autowired
    private FormSubmissionRepository submissionRepository;

    @Autowired
    private FormRepository formRepository;

    @Autowired
    private NotificationService notificationService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping
    public List<FormSubmission> getAllSubmissions() {
        return submissionRepository.findAll();
    }

    @GetMapping("/form/{formId}")
    public ResponseEntity<List<FormSubmission>> getSubmissionsByForm(@PathVariable Long formId) {
        return ResponseEntity.ok(submissionRepository.findByFormId(formId));
    }

    @PostMapping
    public ResponseEntity<FormSubmission> submitForm(@RequestBody FormSubmissionRequest request) {
        try {
            Form form = formRepository.findById(request.getFormId()).orElse(null);
            if (form == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            Map<String, Object> values = objectMapper.readValue(
                request.getPayloadJson(), new TypeReference<Map<String, Object>>() {}
            );
            values = stripHiddenFieldValues(form, values);
            String sanitizedPayload = objectMapper.writeValueAsString(values);

            for (CrossFieldRule rule : form.getCrossFieldRules()) {
                if (Boolean.TRUE.equals(rule.getIsApproved()) && !isValid(rule, values)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
                }
            }

            FormSubmission submission = new FormSubmission();
            submission.setForm(form);
            submission.setPayloadJson(sanitizedPayload);

            FormSubmission saved = submissionRepository.save(submission);

            try {
                notificationService.sendNewSubmissionNotification(form, saved.getPayloadJson());
            } catch (Exception notifyEx) {
                notifyEx.printStackTrace();
            }

            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private boolean isValid(CrossFieldRule rule, Map<String, Object> values) {
        Field primaryField = rule.getPrimaryField();
        if (primaryField == null || !values.containsKey(primaryField.getLabel())) return false;

        Object primaryValue = values.get(primaryField.getLabel());
        if (isBlank(primaryValue)) return true;

        Object compareValue = rule.getSecondaryField() != null
            ? values.get(rule.getSecondaryField().getLabel())
            : rule.getStaticValue();
        if (isBlank(compareValue) && !"date_not_future".equals(rule.getOperator())) return true;

        return switch (rule.getOperator()) {
            case "date_not_future" -> !LocalDate.parse(String.valueOf(primaryValue)).isAfter(LocalDate.now());
            case "greater_than" -> number(primaryValue) > number(compareValue);
            case "less_than" -> number(primaryValue) < number(compareValue);
            case "gte" -> number(primaryValue) >= number(compareValue);
            case "lte" -> number(primaryValue) <= number(compareValue);
            case "equals" -> String.valueOf(primaryValue).trim().equals(String.valueOf(compareValue).trim());
            case "not_equals" -> !String.valueOf(primaryValue).trim().equals(String.valueOf(compareValue).trim());
            case "date_after" -> LocalDate.parse(String.valueOf(primaryValue)).isAfter(LocalDate.parse(String.valueOf(compareValue)));
            case "date_before" -> LocalDate.parse(String.valueOf(primaryValue)).isBefore(LocalDate.parse(String.valueOf(compareValue)));
            case "is_before_year" -> LocalDate.parse(String.valueOf(primaryValue)).getYear() < number(compareValue);
            case "count_equals" -> number(primaryValue) == collectionSize(compareValue);
            case "count_gte" -> number(primaryValue) >= collectionSize(compareValue);
            case "count_lte" -> number(primaryValue) <= collectionSize(compareValue);
            default -> false;
        };
    }

    private double number(Object value) {
        return Double.parseDouble(String.valueOf(value));
    }

    private int collectionSize(Object value) {
        return value instanceof List<?> list ? list.size() : (int) number(value);
    }

    private boolean isBlank(Object value) {
        return value == null || (value instanceof String text && text.isBlank());
    }

    /**
     * Removes answers belonging to fields that conditional logic currently hides, so a
     * crafted request cannot store (and later export) values for invisible fields.
     */
    private Map<String, Object> stripHiddenFieldValues(Form form, Map<String, Object> values) {
        Map<String, Object> sanitized = new java.util.LinkedHashMap<>(values);
        for (Field field : form.getFields()) {
            if (field.getVisibleWhenFieldId() == null) continue;
            if (!isFieldVisible(form, field, sanitized)) {
                sanitized.remove(field.getLabel());
            }
        }
        return sanitized;
    }

    private boolean isFieldVisible(Form form, Field field, Map<String, Object> values) {
        Field source = null;
        for (Field candidate : form.getFields()) {
            if (field.getVisibleWhenFieldId().equals(candidate.getId())) {
                source = candidate;
                break;
            }
        }
        if (source == null) return true;

        Object actual = values.get(source.getLabel());
        String expected = field.getVisibleWhenValue();
        String operator = field.getVisibleWhenOperator() == null ? "equals" : field.getVisibleWhenOperator();

        boolean hasValue;
        if (actual instanceof List<?> list) {
            hasValue = !list.isEmpty();
        } else {
            hasValue = actual != null && !String.valueOf(actual).isBlank();
        }

        return switch (operator) {
            case "equals" -> actual instanceof List<?> list
                ? list.stream().anyMatch(item -> String.valueOf(item).trim().equals(String.valueOf(expected).trim()))
                : String.valueOf(actual == null ? "" : actual).trim().equals(String.valueOf(expected == null ? "" : expected).trim());
            case "not_equals" -> actual instanceof List<?> list
                ? list.stream().noneMatch(item -> String.valueOf(item).trim().equals(String.valueOf(expected).trim()))
                : !String.valueOf(actual == null ? "" : actual).trim().equals(String.valueOf(expected == null ? "" : expected).trim());
            case "is_checked", "not_empty" -> hasValue;
            case "is_not_checked", "is_empty" -> !hasValue;
            default -> true;
        };
    }
}