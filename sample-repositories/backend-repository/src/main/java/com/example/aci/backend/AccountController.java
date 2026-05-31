package com.example.aci.backend;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AccountController {

  @GetMapping("/api/account-summary")
  public Map<String, Object> accountSummary() {
    return Map.of(
      "accountId", "ACC-1001",
      "status", "ACTIVE",
      "currentAccountValue", 18500.5,
      "nextPaymentDate", "2026-06-15"
    );
  }
}
