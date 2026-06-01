package com.example.aci.gateway;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
@RestController
@CrossOrigin(origins = "*")
public class ExperienceGatewayApplication {

  private final RestTemplate restTemplate = new RestTemplate();

  public static void main(String[] args) {
    SpringApplication.run(ExperienceGatewayApplication.class, args);
  }

  @GetMapping("/health")
  public String health() {
    return "experience-gateway-ok";
  }

  @GetMapping("/api/gateway/policy-summary")
  public ResponseEntity<Map<String, Object>> policySummary() {
    try {
      String coreUrl = "http://mock-core-system:8080/api/core/snapshots";
      String analyzerUrl = "http://contract-analyzer-service:8080/api/analyzer/impact";
      String toolsUrl = "http://agent-tools-service:8080/api/agent-tools/notify";

      ResponseEntity<Map> coreResp = restTemplate.getForEntity(coreUrl, Map.class);
      Map<String, Object> coreBody = coreResp.getBody() == null ? Map.of() : (Map<String, Object>) coreResp.getBody();

      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      HttpEntity<Map<String, Object>> analyzerReq = new HttpEntity<>(coreBody, headers);
      ResponseEntity<Map> analyzerResp = restTemplate.exchange(analyzerUrl, HttpMethod.POST, analyzerReq, Map.class);
      Map<String, Object> analysis = analyzerResp.getBody() == null ? Map.of() : (Map<String, Object>) analyzerResp.getBody();

      HttpEntity<Map<String, Object>> notifyReq = new HttpEntity<>(analysis, headers);
      ResponseEntity<Map> notifyResp = restTemplate.exchange(toolsUrl, HttpMethod.POST, notifyReq, Map.class);
      Map<String, Object> notify = notifyResp.getBody() == null ? Map.of() : (Map<String, Object>) notifyResp.getBody();

      Map<String, Object> response = new LinkedHashMap<>();
      response.putAll(analysis);
      response.put("notification", notify);
      response.put("source", Map.of("gateway", "experience-gateway", "core", "mock-core-system"));

      return ResponseEntity.ok(response);
    } catch (Exception ex) {
      Map<String, Object> error = Map.of(
          "error", "POLICY_SUMMARY_UNAVAILABLE",
          "message", ex.getMessage() == null ? "Unknown gateway orchestration error" : ex.getMessage());
      return ResponseEntity.status(502).body(error);
    }
  }
}
