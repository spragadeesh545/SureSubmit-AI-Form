package com.suresubmit.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        return new ResponseEntity<>(Map.of(
            "status", "ok",
            "service", "suresubmit-backend",
            "time", System.currentTimeMillis()
        ), HttpStatus.OK);
    }
}