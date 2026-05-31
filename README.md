# Agentic Contract Intelligence Platform

A full-stack proof of concept for detecting upstream API contract drift, tracing downstream impact across applications, and generating executive-level impact reports with agent observability, memory, and evaluation.

This repository uses only generic names and mock data.

## What This POC Demonstrates

- Mock OAuth authentication and token exchange
- Gateway-driven request forwarding with trace visibility
- Baseline versus latest contract diff analysis
- Frontend and backend code impact discovery
- Business capability mapping and remediation guidance
- Agent trace, memory, evaluation, and report generation
- Local development with Docker Compose

## Repository Layout

```text
agentic-contract-intelligence/
  frontend-impact-center/
  auth-service/
  experience-gateway/
  contract-analyzer-service/
  mock-core-system/
  agent-tools-service/
  lambda-contract-scan/
  sample-repositories/
    frontend-repository/
    backend-repository/
  mappings/
  reports/
  snapshots/
    baseline/
    latest/
  docs/
  docker-compose.yml
```

## Demo Flow

1. User signs in to the Impact Center.
2. The user triggers a contract scan.
3. Lambda simulates the scheduled upstream scan.
4. The gateway validates OAuth and emits an internal service token.
5. The analyzer compares baseline and latest payloads.
6. Agent tools search sample repositories and load mappings.
7. The agent composes the executive report.
8. Evaluation scores the report.
9. The report is stored and surfaced in the UI.
10. SES sends a mock notification email.

## Local Run

This repo is scaffolded for local development. Each service folder contains a starter project structure or build file that can be expanded into a runnable implementation.

```bash
docker compose up --build
```

## Presentation Guide

1. Open with the business problem: contract drift creates hidden downstream risk.
2. Show the architecture and system flow.
3. Trigger the contract scan in the UI.
4. Walk through the contract diff, traces, and evidence.
5. Show the report sections, QA recommendations, and evaluation score.
6. Close with the ROI and roadmap.

## Notes

- No real credentials, company names, or internal endpoints are used.
- All payloads and repository references are mock examples.
- The sample repositories are intentionally small and deterministic for demos.

## Deployment And Test Docs

- AWS account connection steps: `docs/aws-connect-steps.md`
- AWS deployment guide: `docs/aws-deployment.md`
- Local and post-deploy test plan: `docs/test-plan.md`
