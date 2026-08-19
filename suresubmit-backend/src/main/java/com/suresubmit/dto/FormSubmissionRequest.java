package com.suresubmit.dto;

public class FormSubmissionRequest {
    private Long formId;
    private String payloadJson;

    public FormSubmissionRequest() {}

    public Long getFormId() { return formId; }
    public void setFormId(Long formId) { this.formId = formId; }
    public String getPayloadJson() { return payloadJson; }
    public void setPayloadJson(String payloadJson) { this.payloadJson = payloadJson; }
}