package com.suresubmit.controller;

import com.suresubmit.dto.FormCreateRequest;
import com.suresubmit.dto.RuleApprovalRequest;
import com.suresubmit.entity.Form;
import com.suresubmit.repository.FormRepository;
import com.suresubmit.service.FormService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forms")
@CrossOrigin(origins = "*")
public class FormController {

    @Autowired
    private FormRepository formRepository;

    @Autowired
    private FormService formService;

    @PostMapping
    public ResponseEntity<Form> createForm(@RequestBody FormCreateRequest request) {
        try {
            Form savedForm = formService.createFormWithDetails(request);
            return new ResponseEntity<>(savedForm, HttpStatus.CREATED);
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
}