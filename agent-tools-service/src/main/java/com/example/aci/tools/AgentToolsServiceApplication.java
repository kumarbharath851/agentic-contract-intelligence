package com.example.aci.tools;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
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
}
