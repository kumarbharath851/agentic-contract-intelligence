# AWS Deployment Guide

This guide explains how to deploy the POC to your AWS account using container images and managed services.

## 1. Prerequisites

- AWS account with permissions for ECR, ECS, ALB, IAM, CloudWatch, and Secrets Manager
- AWS CLI configured locally: `aws configure`
- Docker Desktop installed
- Java 21 and Node 22 locally if you want to run builds before containerization

## 2. Target Architecture

- Frontend: ECS Fargate service behind ALB (or S3 + CloudFront if static export is preferred)
- Backend services: ECS Fargate services
- Lambda scanner: Lambda function for scheduled scan simulation
- Data stores (future): S3 for report artifacts, DynamoDB for run metadata

## 3. Build and Push Container Images

Use one ECR repository per service.

Example flow for a single service (repeat for each):

```bash
aws ecr create-repository --repository-name aci/auth-service
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

docker build -t aci-auth-service ./auth-service
docker tag aci-auth-service:latest <account-id>.dkr.ecr.<region>.amazonaws.com/aci/auth-service:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/aci/auth-service:latest
```

## 4. Provision ECS

- Create ECS cluster (Fargate)
- Create task definitions for:
  - frontend-impact-center
  - auth-service
  - experience-gateway
  - contract-analyzer-service
  - mock-core-system
  - agent-tools-service
- Use environment variables for service URLs and settings
- Store sensitive values in Secrets Manager and reference them in task definitions

## 5. Networking

- Create or reuse VPC with public/private subnets
- Put ALB in public subnets
- Put ECS services in private subnets where possible
- Configure security groups:
  - ALB inbound: 80/443
  - ECS service inbound: only from ALB or internal services

## 6. Deploy Lambda Scanner

```bash
cd lambda-contract-scan
zip -r function.zip index.js package.json
aws lambda create-function \
  --function-name aci-contract-scan \
  --runtime nodejs22.x \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::<account-id>:role/<lambda-role>
```

(Optional) Create an EventBridge schedule to trigger this Lambda.

## 7. Observability

- Enable CloudWatch logs for every ECS service
- Add CloudWatch metrics/alarms for:
  - task health
  - 5xx from ALB
  - CPU/memory thresholds
- Add structured JSON logs where possible

## 8. CI/CD (Recommended Next)

- Use GitHub Actions with OIDC to AWS
- Build and push images on `main`
- Deploy updated ECS task definitions automatically

## 9. Security Checklist Before Production-like Use

- No plaintext secrets in repo
- IAM least privilege for ECS tasks and Lambda
- HTTPS enabled on ALB with ACM certificate
- Restrict service-to-service network paths
