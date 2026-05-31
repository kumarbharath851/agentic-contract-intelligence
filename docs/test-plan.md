# Test Plan

## 1. Local Smoke Tests

### Start services

```bash
docker compose up --build
```

### Health checks

- Auth: `http://localhost:8081/health`
- Gateway: `http://localhost:8082/health`
- Analyzer: `http://localhost:8083/health`
- Core: `http://localhost:8084/health`
- Tools: `http://localhost:8085/health`
- Frontend: `http://localhost:4200`

Expected: all endpoints return HTTP 200.

## 2. Contract Drift Scenario Test

1. Confirm baseline and latest snapshots differ:
   - `snapshots/baseline/account-summary.json`
   - `snapshots/latest/account-summary.json`
2. Verify mapping coverage in:
   - `mappings/business-mappings.json`
3. Confirm report skeleton exists:
   - `reports/sample-report.json`

Expected: drift fields map to business impact entries.

## 3. Lambda Invocation Test

### Local node run

```bash
cd lambda-contract-scan
node -e "import('./index.js').then(m => m.handler().then(console.log))"
```

Expected: JSON response with `status: triggered`.

## 4. Frontend Test Checks

- Dashboard renders hero section and three cards.
- No console errors in browser dev tools.
- Responsive behavior below 900px displays single-column cards.

## 5. API Contract Sanity Checks

- Backend sample endpoint shape remains compatible with frontend model expectations.
- Any renamed field has transitional alias support where applicable.

## 6. Pre-Deploy Regression Checklist

- `git diff --check` clean
- No secret patterns in repository
- Docker compose boots all services
- Manual smoke on frontend and all `/health` endpoints

## 7. Post-Deploy Validation (AWS)

- ALB endpoint returns frontend app
- Service health checks green in ECS
- CloudWatch logs available for all tasks
- Lambda can be invoked successfully
