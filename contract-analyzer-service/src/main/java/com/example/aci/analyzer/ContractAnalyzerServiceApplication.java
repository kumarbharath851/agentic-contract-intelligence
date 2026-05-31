package com.example.aci.analyzer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
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
}
