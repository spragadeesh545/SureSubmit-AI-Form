package com.suresubmit.controller;

import com.suresubmit.entity.Form;
import com.suresubmit.repository.FormRepository;
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

    // 1. Creates a new form
    @PostMapping
    public ResponseEntity<Form> createForm(@RequestBody Form form) {
        try {
            Form savedForm = formRepository.save(form);
            return new ResponseEntity<>(savedForm, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 2. Fetches all forms for the Dashboard
    @GetMapping
    public ResponseEntity<List<Form>> getAllForms() {
        try {
            List<Form> forms = formRepository.findAll();
            return new ResponseEntity<>(forms, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 3. NEW: Fetches a single specific form so a user can fill it out
    @GetMapping("/{id}")
    public ResponseEntity<Form> getFormById(@PathVariable Long id) {
        Form form = formRepository.findById(id).orElse(null);
        
        if (form != null) {
            return new ResponseEntity<>(form, HttpStatus.OK);
        } else {
            // Using status builder to prevent diamond operator warnings
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null); 
        }
    }
}