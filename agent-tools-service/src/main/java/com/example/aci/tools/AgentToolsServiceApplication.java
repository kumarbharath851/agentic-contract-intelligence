package com.example.aci.tools;

import java.time.Instant;
import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class AgentToolsServiceApplication {

  public static void main(String[] args) {
    SpringApplication.run(AgentToolsServiceApplication.class, args);
  }

  @GetMapping("/health")
  public String health() {
    return "agent-tools-service-ok";
  }

  @PostMapping("/api/agent-tools/notify")
  public ResponseEntity<Map<String, Object>> notifyImpact(@RequestBody Map<String, Object> payload) {
    String severity = String.valueOf(payload.getOrDefault("severity", "UNKNOWN"));
    String subject = "[ACI] Contract Drift Impact - " + severity;
    String preview = String.valueOf(payload.getOrDefault("executiveSummary", "No summary available."));

    Map<String, Object> response = Map.of(
        "notificationStatus", "EMAIL_SENT",
        "channel", "mock-ses",
        "subject", subject,
        "preview", preview,
        "sentAt", Instant.now().toString());

    return ResponseEntity.ok(response);
  }
}
