package com.suresubmit.controller;

import com.suresubmit.dto.FormSubmissionRequest;
import com.suresubmit.entity.Form;
import com.suresubmit.entity.FormSubmission;
import com.suresubmit.repository.FormRepository;
import com.suresubmit.repository.FormSubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@CrossOrigin(origins = "*")
public class FormSubmissionController {

    @Autowired
    private FormSubmissionRepository submissionRepository;

    @Autowired
    private FormRepository formRepository;

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
}