package com.suresubmit.controller;

import com.suresubmit.entity.Field;
import com.suresubmit.repository.FieldRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fields")
@CrossOrigin(origins = "*")
public class FieldController {

    @Autowired
    private FieldRepository fieldRepository;

    @GetMapping
    public List<Field> getAllFields() {
        return fieldRepository.findAll();
    }

    @PostMapping
    public Field createField(@RequestBody Field field) {
        return fieldRepository.save(field);
    }
}