package com.example.aci.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class ExperienceGatewayApplication {

  public static void main(String[] args) {
    SpringApplication.run(ExperienceGatewayApplication.class, args);
  }

  @GetMapping("/health")
  public String health() {
    return "experience-gateway-ok";
  }
}
