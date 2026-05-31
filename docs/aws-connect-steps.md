# Connect Repo to AWS Account

You must run these in your own shell with your own AWS credentials.

## 1. Configure AWS CLI

```bash
aws configure
```

Provide:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (for example: us-east-1)
- Output format: json

## 2. Verify Caller Identity

```bash
aws sts get-caller-identity
```

Expected: your AWS account ID and ARN.

## 3. Set Default Region for Session (Optional)

```bash
export AWS_REGION=us-east-1
```

PowerShell:

```powershell
$env:AWS_REGION = "us-east-1"
```

## 4. Validate ECR Access

```bash
aws ecr describe-repositories
```

If this fails with AccessDenied, attach ECR permissions to your IAM principal.

## 5. Validate ECS Access

```bash
aws ecs list-clusters
```

## 6. Validate Lambda Access

```bash
aws lambda list-functions --max-items 5
```

Once these work, your local environment is connected to AWS and ready for deployment steps.
