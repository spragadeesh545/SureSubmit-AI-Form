package com.suresubmit.controller;

import com.suresubmit.entity.Form;
import com.suresubmit.repository.FormRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/forms")
@CrossOrigin(origins = "*") // Allows React to connect without CORS errors
public class FormController {

    @Autowired
    private FormRepository formRepository;

    @PostMapping
    public ResponseEntity<?> saveForm(@RequestBody Form form) {
        try {
            Form savedForm = formRepository.save(form);
            return ResponseEntity.ok(savedForm);
        } catch (Exception e) {
            e.printStackTrace();
            // This will send the exact error back to React instead of a blank 500 error
            return ResponseEntity.internalServerError().body("Database Error: " + e.getMessage());
        }
    }
}