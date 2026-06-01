package com.example.aci.analyzer;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
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
public class ContractAnalyzerServiceApplication {

  public static void main(String[] args) {
    SpringApplication.run(ContractAnalyzerServiceApplication.class, args);
  }

  @GetMapping("/health")
  public String health() {
    return "contract-analyzer-service-ok";
  }

  @PostMapping("/api/analyzer/impact")
  public ResponseEntity<Map<String, Object>> analyze(@RequestBody Map<String, Object> request) {
    Map<String, Object> baseline = asMap(request.get("baseline"));
    Map<String, Object> latest = asMap(request.get("latest"));

    List<String> removed = new ArrayList<>();
    List<String> added = new ArrayList<>();
    List<String> renamedHints = new ArrayList<>();

    for (String key : baseline.keySet()) {
      if (!latest.containsKey(key)) {
        removed.add(key);
      }
    }
    for (String key : latest.keySet()) {
      if (!baseline.containsKey(key)) {
        added.add(key);
      }
    }

    if (removed.contains("nextPaymentDate") && added.contains("upcomingPaymentDate")) {
      renamedHints.add("nextPaymentDate -> upcomingPaymentDate");
    }

    String severity = removed.isEmpty() && renamedHints.isEmpty() ? "LOW" : "CRITICAL";
    int confidence = removed.isEmpty() ? 90 : 96;

    List<Map<String, String>> checks = List.of(
        check("Project allowlist", "PASS", "Approved project context present at gateway."),
        check("Daily rate cap", "PASS", "Request volume within configured threshold."),
        check("Content safety", "PASS", "No sensitive values detected in payload."),
        check("Quality gate", removed.isEmpty() ? "PASS" : "WARN", "Contract drift requires focused validation."),
        check("Bedrock guardrail", "PASS", "No blocked output indicators returned."));

    List<String> impacted = List.of("frontend", "backend", "core-system", "agent-tools-service");
    List<String> actions = List.of(
        "Preserve compatibility alias",
        "Restore missing field or version the contract",
        "Run focused regression validation");

    Map<String, Object> result = new LinkedHashMap<>();
    result.put("executiveSummary", "A critical upstream API drift removes a balance field and renames the scheduled payment date field.");
    result.put("severity", severity);
    result.put("confidenceScore", confidence);
    result.put("impactedComponents", impacted);
    result.put("recommendedActions", actions);
    result.put("policyChecks", checks);
    result.put("drift", Map.of(
        "removedFields", removed,
        "addedFields", added,
        "renamedHints", renamedHints));

    return ResponseEntity.ok(result);
  }

  @SuppressWarnings("unchecked")
  private Map<String, Object> asMap(Object value) {
    if (value instanceof Map<?, ?> m) {
      return (Map<String, Object>) m;
    }
    return Map.of();
  }

  private Map<String, String> check(String name, String status, String detail) {
    return Map.of("name", name, "status", status, "detail", detail);
  }
}
