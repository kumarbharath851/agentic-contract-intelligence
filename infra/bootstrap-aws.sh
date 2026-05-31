#!/usr/bin/env bash
# infra/bootstrap-aws.sh
# Run once to create ECR repos, ECS cluster, CloudWatch log groups,
# and the GitHub Actions IAM role.
# Prerequisites: AWS CLI v2, jq
# Usage: bash infra/bootstrap-aws.sh

set -euo pipefail

ACCOUNT="866543941893"
REGION="us-east-1"
CLUSTER="aci-cluster"

SERVICES=(
  auth-service
  experience-gateway
  contract-analyzer-service
  mock-core-system
  agent-tools-service
  frontend-impact-center
)

echo "=== 1. Create ECR repositories ==="
for SVC in "${SERVICES[@]}"; do
  aws ecr create-repository \
    --repository-name "aci-${SVC}" \
    --region "$REGION" \
    --image-scanning-configuration scanOnPush=true \
    --query "repository.repositoryUri" --output text 2>/dev/null \
    && echo "  Created aci-${SVC}" \
    || echo "  aci-${SVC} already exists — skipped"
done

echo ""
echo "=== 2. Create ECS cluster (Fargate) ==="
aws ecs create-cluster \
  --cluster-name "$CLUSTER" \
  --capacity-providers FARGATE FARGATE_SPOT \
  --region "$REGION" \
  --query "cluster.clusterArn" --output text 2>/dev/null \
  || echo "  Cluster already exists — skipped"

echo ""
echo "=== 3. Create CloudWatch Log Groups ==="
LOG_PREFIXES=(aci-auth aci-experience-gateway aci-contract-analyzer aci-mock-core aci-agent-tools aci-frontend)
for LG in "${LOG_PREFIXES[@]}"; do
  aws logs create-log-group \
    --log-group-name "/ecs/${LG}" \
    --region "$REGION" 2>/dev/null \
    && echo "  Created /ecs/${LG}" \
    || echo "  /ecs/${LG} already exists — skipped"
done

echo ""
echo "=== 4. Deploy GitHub Actions IAM Role (CloudFormation) ==="
aws cloudformation deploy \
  --template-file infra/github-actions-role.yml \
  --stack-name aci-github-actions-role \
  --capabilities CAPABILITY_NAMED_IAM \
  --region "$REGION" \
  --parameter-overrides \
    GitHubOrg=kumarbharath851 \
    GitHubRepo=agentic-contract-intelligence

echo ""
echo "=== 5. Register ECS Task Definitions ==="
for SVC in auth-service experience-gateway contract-analyzer-service mock-core-system agent-tools-service frontend-impact-center; do
  aws ecs register-task-definition \
    --cli-input-json "file://infra/ecs-task-definitions/${SVC}.json" \
    --region "$REGION" \
    --query "taskDefinition.taskDefinitionArn" --output text
  echo "  Registered task def for ${SVC}"
done

echo ""
echo "=== Bootstrap complete ==="
echo "Next: install Docker, build images, and push to ECR, then"
echo "create ECS services pointing to the task definitions above."
echo "Or: push to main and let GitHub Actions handle it automatically."
