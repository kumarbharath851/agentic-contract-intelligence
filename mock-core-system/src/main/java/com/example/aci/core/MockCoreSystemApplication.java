package com.example.aci.core;

import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class MockCoreSystemApplication {

  public static void main(String[] args) {
    SpringApplication.run(MockCoreSystemApplication.class, args);
  }

  @GetMapping("/health")
  public String health() {
    return "mock-core-system-ok";
  }

  @GetMapping("/api/core/snapshots")
  public Map<String, Object> snapshots() {
    Map<String, Object> baseline = Map.of(
        "accountId", "A-10001",
        "status", "ACTIVE",
        "currentAccountValue", 13852.78,
        "nextPaymentDate", "2026-06-15");

    Map<String, Object> latest = Map.of(
        "accountId", "A-10001",
        "status", "ACTIVE",
        "upcomingPaymentDate", "2026-06-15");

    return Map.of(
        "baseline", baseline,
        "latest", latest,
        "service", "mock-core-system",
        "version", "v2-drifted");
  }
}
