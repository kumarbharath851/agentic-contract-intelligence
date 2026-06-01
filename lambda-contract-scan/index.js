import { readFile } from 'node:fs/promises';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

const ses = new SESv2Client({});

const BASELINE_PATH = process.env.BASELINE_PATH ?? './baseline-policy-response.json';
const IMPACT_MAP_PATH = process.env.IMPACT_MAP_PATH ?? './code-impact-map.json';
const ADMIN_API_URL = process.env.ADMIN_API_URL ?? 'http://localhost:8084/api/core/snapshots';
const EMAIL_TO = process.env.EMAIL_TO ?? 'bharathkumarnoora@gmail.com';
const EMAIL_FROM = process.env.EMAIL_FROM ?? '';

async function readJson(path) {
  const content = await readFile(path, 'utf-8');
  return JSON.parse(content);
}

async function fetchAdminResponse(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Admin API returned ${response.status}`);
    }
    const body = await response.json();
    if (body && body.latest && typeof body.latest === 'object') {
      return body.latest;
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
}

function diffResponseShape(baseline, latest) {
  const baselineKeys = new Set(Object.keys(baseline ?? {}));
  const latestKeys = new Set(Object.keys(latest ?? {}));

  const removedFields = [...baselineKeys].filter((k) => !latestKeys.has(k));
  const addedFields = [...latestKeys].filter((k) => !baselineKeys.has(k));
  const renamedHints = [];

  if (removedFields.includes('nextPaymentDate') && addedFields.includes('upcomingPaymentDate')) {
    renamedHints.push('nextPaymentDate -> upcomingPaymentDate');
  }

  return {
    removedFields,
    addedFields,
    renamedHints,
    driftDetected: removedFields.length > 0 || addedFields.length > 0 || renamedHints.length > 0
  };
}

function assessCodeImpact(drift, impactMap) {
  const allChangedFields = new Set([
    ...drift.removedFields,
    ...drift.addedFields,
    ...drift.renamedHints.flatMap((hint) => hint.split('->').map((x) => x.trim()))
  ]);

  const frontendImpacts = [];
  const backendImpacts = [];

  for (const entry of impactMap.files ?? []) {
    const matchedFields = (entry.fields ?? []).filter((field) => allChangedFields.has(field));
    if (matchedFields.length === 0) {
      continue;
    }

    const finding = {
      file: entry.file,
      fields: matchedFields,
      rationale: entry.rationale ?? 'Field referenced in source code.'
    };

    if (entry.layer === 'frontend') {
      frontendImpacts.push(finding);
    }
    if (entry.layer === 'backend') {
      backendImpacts.push(finding);
    }
  }

  return {
    frontendImpacts,
    backendImpacts,
    impactedComponents: [
      ...(frontendImpacts.length > 0 ? ['frontend'] : []),
      ...(backendImpacts.length > 0 ? ['backend'] : [])
    ]
  };
}

function buildEmailBody(report) {
  const frontendLines = report.impact.frontendImpacts.length > 0
    ? report.impact.frontendImpacts.map((x) => `- ${x.file} [${x.fields.join(', ')}]`).join('\n')
    : '- No direct frontend file references matched.';

  const backendLines = report.impact.backendImpacts.length > 0
    ? report.impact.backendImpacts.map((x) => `- ${x.file} [${x.fields.join(', ')}]`).join('\n')
    : '- No direct backend file references matched.';

  return [
    `Scan ID: ${report.scanId}`,
    `Triggered At: ${report.triggeredAt}`,
    `Admin API URL: ${report.adminApiUrl}`,
    `Drift Detected: ${report.drift.driftDetected}`,
    '',
    `Removed Fields: ${report.drift.removedFields.join(', ') || 'None'}`,
    `Added Fields: ${report.drift.addedFields.join(', ') || 'None'}`,
    `Rename Hints: ${report.drift.renamedHints.join(', ') || 'None'}`,
    '',
    'Backend Impact:',
    backendLines,
    '',
    'Frontend Impact:',
    frontendLines,
    '',
    'Recommended Actions:',
    '- Update DTO/contracts in backend service layer.',
    '- Update UI rendering/types for changed response fields.',
    '- Add regression tests for both old and new response shape during migration.'
  ].join('\n');
}

async function sendNotificationEmail(report) {
  if (!EMAIL_FROM) {
    return {
      notificationStatus: 'SKIPPED',
      reason: 'EMAIL_FROM not configured'
    };
  }

  const subject = report.drift.driftDetected
    ? '[ACI-AgentCore] Policy API Drift Detected'
    : '[ACI-AgentCore] Policy API Drift Scan - No Changes';

  const textBody = buildEmailBody(report);

  const command = new SendEmailCommand({
    FromEmailAddress: EMAIL_FROM,
    Destination: {
      ToAddresses: [EMAIL_TO]
    },
    Content: {
      Simple: {
        Subject: { Data: subject },
        Body: {
          Text: { Data: textBody }
        }
      }
    }
  });

  try {
    const response = await ses.send(command);
    return {
      notificationStatus: 'EMAIL_SENT',
      messageId: response.MessageId,
      to: EMAIL_TO,
      from: EMAIL_FROM
    };
  } catch (error) {
    return {
      notificationStatus: 'EMAIL_FAILED',
      to: EMAIL_TO,
      from: EMAIL_FROM,
      reason: error.message
    };
  }
}

export const handler = async (event = {}) => {
  const scanId = `scan-${Date.now()}`;
  const triggeredAt = new Date().toISOString();
  const baseline = await readJson(BASELINE_PATH);
  const impactMap = await readJson(IMPACT_MAP_PATH);

  let latest;
  let drift;
  let adminSource = 'live-admin-api';

  try {
    latest = await fetchAdminResponse(ADMIN_API_URL);
  } catch (error) {
    adminSource = 'fallback-mock-response';
    latest = {
      accountId: 'A-10001',
      status: 'ACTIVE',
      upcomingPaymentDate: '2026-06-15'
    };
  }

  drift = diffResponseShape(baseline, latest);

  const impact = assessCodeImpact(drift, impactMap);
  const report = {
    scanId,
    triggeredAt,
    status: drift.driftDetected ? 'DRIFT_DETECTED' : 'NO_DRIFT',
    adminApiUrl: ADMIN_API_URL,
    adminResponseSource: adminSource,
    drift,
    impact,
    event
  };

  const emailResult = await sendNotificationEmail(report);

  return {
    statusCode: 200,
    body: JSON.stringify({
      ...report,
      notification: emailResult
    })
  };
};
