package com.suresubmit.service;

import com.suresubmit.dto.CrossFieldRuleDTO;
import com.suresubmit.dto.FieldDTO;
import com.suresubmit.dto.FormCreateRequest;
import com.suresubmit.entity.CrossFieldRule;
import com.suresubmit.entity.Field;
import com.suresubmit.entity.Form;
import com.suresubmit.repository.FormRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FormService {

    @Autowired
    private FormRepository formRepository;

    @Transactional
    public Form createFormWithDetails(FormCreateRequest request) {
        Form form = new Form();
        form.setTitle(request.getTitle());
        form.setStatus(request.getStatus() != null ? request.getStatus() : "DRAFT");
        form.setUserId(request.getUserId());
        if (request.getThemeColor() != null) form.setThemeColor(request.getThemeColor());
        if (request.getDescription() != null) form.setDescription(request.getDescription());
        if (request.getConfirmationMessage() != null) form.setConfirmationMessage(request.getConfirmationMessage());

        if (request.getFields() != null) {
            for (FieldDTO fd : request.getFields()) {
                Field field = new Field(fd.getLabel(), fd.getInputType(), fd.getIsRequired() != null && fd.getIsRequired());
                field.setForm(form);
                if (fd.getOptions() != null) {
                    field.getOptions().addAll(fd.getOptions());
                }
                form.getFields().add(field);
            }
        }

        Form savedForm = formRepository.save(form);

        if (request.getCrossFieldRules() != null && !request.getCrossFieldRules().isEmpty()) {
            Map<String, Field> labelToField = new HashMap<>();
            for (Field f : savedForm.getFields()) {
                labelToField.put(f.getLabel(), f);
            }

            for (CrossFieldRuleDTO rd : request.getCrossFieldRules()) {
                CrossFieldRule rule = new CrossFieldRule(
                    rd.getOperator(),
                    rd.getStaticValue(),
                    rd.getErrorMessage(),
                    rd.getDescription(),
                    rd.getIsApproved() != null ? rd.getIsApproved() : false
                );
                rule.setForm(savedForm);

                Field primary = labelToField.get(rd.getPrimaryFieldLabel());
                if (primary != null) {
                    rule.setPrimaryField(primary);
                }

                if (rd.getSecondaryFieldLabel() != null) {
                    Field secondary = labelToField.get(rd.getSecondaryFieldLabel());
                    if (secondary != null) {
                        rule.setSecondaryField(secondary);
                    }
                }

                savedForm.getCrossFieldRules().add(rule);
            }

            formRepository.save(savedForm);
        }

        return savedForm;
    }

    @Transactional
    public Form updateRuleApproval(Long formId, Long ruleId, Boolean approved) {
        Form form = formRepository.findById(formId)
            .orElseThrow(() -> new RuntimeException("Form not found: " + formId));

        for (CrossFieldRule rule : form.getCrossFieldRules()) {
            if (rule.getId().equals(ruleId)) {
                rule.setIsApproved(approved);
                break;
            }
        }

        return formRepository.save(form);
    }

    @Transactional
    public Form deleteRule(Long formId, Long ruleId) {
        Form form = formRepository.findById(formId)
            .orElseThrow(() -> new RuntimeException("Form not found: " + formId));

        form.getCrossFieldRules().removeIf(rule -> rule.getId().equals(ruleId));

        return formRepository.save(form);
    }
}
