package com.suresubmit.controller;

import com.suresubmit.entity.FormSubmission;
import com.suresubmit.repository.FormSubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@CrossOrigin(origins = "*")
public class FormSubmissionController {

    @Autowired
    private FormSubmissionRepository submissionRepository;

    @GetMapping
    public List<FormSubmission> getAllSubmissions() {
        return submissionRepository.findAll();
    }

    @PostMapping
    public FormSubmission submitForm(@RequestBody FormSubmission submission) {
        return submissionRepository.save(submission);
    }
}