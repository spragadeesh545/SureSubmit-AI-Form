package com.suresubmit.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "forms")
public class Form {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(name = "status")
    private String status = "ACTIVE";

    @ElementCollection
    @CollectionTable(name = "form_fields", joinColumns = @JoinColumn(name = "form_id"))
    @Column(name = "field_label")
    private List<String> fields = new ArrayList<>();

    public Form() {
    }

    public Form(String title, List<String> fields) {
        this.title = title;
        this.fields = fields;
        this.status = "ACTIVE";
    }

    public Long getId() { 
        return id; 
    }
    
    public void setId(Long id) { 
        this.id = id; 
    }

    public String getTitle() { 
        return title; 
    }
    
    public void setTitle(String title) { 
        this.title = title; 
    }

    public String getStatus() { 
        return status; 
    }
    
    public void setStatus(String status) { 
        this.status = status; 
    }

    public List<String> getFields() { 
        return fields; 
    }
    
    public void setFields(List<String> fields) { 
        this.fields = fields; 
    }
}