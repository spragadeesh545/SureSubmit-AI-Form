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
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

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

        List<FieldDTO> fieldDtos = request.getFields() != null ? request.getFields() : List.of();
        for (FieldDTO fd : fieldDtos) {
            Field field = new Field(fd.getLabel(), fd.getInputType(), fd.getIsRequired() != null && fd.getIsRequired());
            field.setForm(form);
            if (fd.getOptions() != null) {
                field.getOptions().addAll(fd.getOptions());
            }
            form.getFields().add(field);
        }

        Form savedForm = formRepository.save(form);

        // Second pass: resolve conditional-visibility source fields by label -> id
        Map<String, Field> labelToFieldByLabel = new HashMap<>();
        for (Field f : savedForm.getFields()) {
            labelToFieldByLabel.put(f.getLabel(), f);
        }
        for (int i = 0; i < fieldDtos.size(); i++) {
            FieldDTO fd = fieldDtos.get(i);
            if (fd.getVisibleWhenFieldLabel() == null || fd.getVisibleWhenFieldLabel().isBlank()) {
                continue;
            }
            if (i >= savedForm.getFields().size()) break;
            Field field = savedForm.getFields().get(i);
            Field source = labelToFieldByLabel.get(fd.getVisibleWhenFieldLabel());
            if (source == null) {
                throw new IllegalArgumentException("Visibility condition references an invalid field: " + fd.getVisibleWhenFieldLabel());
            }
            if (source.getId().equals(field.getId())) {
                throw new IllegalArgumentException("A field cannot depend on its own visibility");
            }
            field.setVisibleWhenFieldId(source.getId());
            field.setVisibleWhenOperator(fd.getVisibleWhenOperator());
            field.setVisibleWhenValue(fd.getVisibleWhenValue());
        }

        validateNoVisibilityCycles(savedForm);

        formRepository.save(savedForm);

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

                if (primary == null || (rd.getSecondaryFieldLabel() != null && rule.getSecondaryField() == null)
                    || (rule.getSecondaryField() != null && primary.getId().equals(rule.getSecondaryField().getId()))) {
                    throw new IllegalArgumentException("Validation rule references invalid form fields");
                }

                savedForm.getCrossFieldRules().add(rule);
            }

            formRepository.save(savedForm);
        }

        return savedForm;
    }

    /**
     * Rejects circular visibility dependencies (A depends on B depends on A), which would
     * leave the affected fields permanently hidden or flickering.
     */
    private void validateNoVisibilityCycles(Form form) {
        Map<Long, Long> dependsOn = new HashMap<>();
        for (Field field : form.getFields()) {
            if (field.getVisibleWhenFieldId() != null) {
                dependsOn.put(field.getId(), field.getVisibleWhenFieldId());
            }
        }

        for (Field field : form.getFields()) {
            if (!dependsOn.containsKey(field.getId())) continue;
            Set<Long> seen = new HashSet<>();
            Long cursor = field.getId();
            while (cursor != null) {
                if (!seen.add(cursor)) {
                    throw new IllegalArgumentException(
                        "Circular visibility condition detected involving field: " + field.getLabel()
                    );
                }
                cursor = dependsOn.get(cursor);
            }
        }
    }

    @Transactional
    public Form updateRuleApproval(Long formId, Long ruleId, Boolean approved) {        Form form = formRepository.findById(formId)
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
