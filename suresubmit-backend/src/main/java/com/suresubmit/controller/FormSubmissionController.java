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
            for (CrossFieldRule rule : form.getCrossFieldRules()) {
                if (Boolean.TRUE.equals(rule.getIsApproved()) && !isValid(rule, values)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
                }
            }

            FormSubmission submission = new FormSubmission();
            submission.setForm(form);
            submission.setPayloadJson(request.getPayloadJson());

            FormSubmission saved = submissionRepository.save(submission);
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
        if (isBlank(compareValue)) return true;

        return switch (rule.getOperator()) {
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
}