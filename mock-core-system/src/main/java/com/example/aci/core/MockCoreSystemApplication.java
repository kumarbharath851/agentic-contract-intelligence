package com.example.aci.core;

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
}
