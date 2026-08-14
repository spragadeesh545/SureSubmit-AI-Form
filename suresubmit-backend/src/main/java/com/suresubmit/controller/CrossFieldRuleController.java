package com.suresubmit.controller;

import com.suresubmit.entity.CrossFieldRule;
import com.suresubmit.repository.CrossFieldRuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rules")
@CrossOrigin(origins = "*")
public class CrossFieldRuleController {

    @Autowired
    private CrossFieldRuleRepository ruleRepository;

    @GetMapping
    public List<CrossFieldRule> getAllRules() {
        return ruleRepository.findAll();
    }

    @PostMapping
    public CrossFieldRule createRule(@RequestBody CrossFieldRule rule) {
        return ruleRepository.save(rule);
    }
}