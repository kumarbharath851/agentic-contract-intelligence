import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'aci-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <main class="shell">
      <section *ngIf="loading" class="panel">
        <p class="panel-kicker">Loading</p>
        <h2>Fetching policy summary from gateway...</h2>
      </section>

      <section *ngIf="error" class="panel panel-error">
        <p class="panel-kicker">Gateway error</p>
        <h2>Unable to load live policy summary</h2>
        <p class="panel-text">{{ error }}</p>
      </section>

      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Policy Summary Dashboard</p>
          <h1>Policy checks, severity, and remediation in one view.</h1>
          <p class="lede">
            The latest report flags a critical upstream schema drift. This dashboard summarizes the policy outcome,
            what changed, what is blocked, and what should happen next.
          </p>
        </div>

        <div class="hero-stats">
          <div class="stat stat-alert">
            <span class="stat-label">Severity</span>
            <strong>{{ dashboard.severity }}</strong>
            <p>{{ dashboard.executiveSummary }}</p>
          </div>
          <div class="stat">
            <span class="stat-label">Compliance</span>
            <strong>{{ passCount }} / {{ dashboard.policyChecks.length }} PASS</strong>
            <p>{{ dashboard.policyChecks.length - passCount }} check(s) need attention.</p>
          </div>
          <div class="stat">
            <span class="stat-label">Confidence</span>
            <strong>{{ dashboard.confidenceScore }}%</strong>
            <p>Recommended response is high confidence and actionable.</p>
          </div>
        </div>
      </section>

      <section class="dashboard-grid">
        <article class="panel report-panel">
          <div class="panel-heading">
            <div>
              <p class="panel-kicker">Executive report</p>
              <h2>Latest impact summary</h2>
            </div>
            <span class="badge" [class.badge-critical]="dashboard.severity === 'CRITICAL'" [class.badge-neutral]="dashboard.severity !== 'CRITICAL'">{{ dashboard.severity }}</span>
          </div>
          <p class="panel-text">{{ dashboard.executiveSummary }}</p>
          <div class="key-value-grid">
            <div>
              <span>Impacted components</span>
              <strong>{{ dashboard.impactedComponents.join(', ') }}</strong>
            </div>
            <div>
              <span>Confidence</span>
              <strong>{{ dashboard.confidenceScore }}%</strong>
            </div>
          </div>
        </article>

        <article class="panel action-panel">
          <div class="panel-heading">
            <div>
              <p class="panel-kicker">Recommended actions</p>
              <h2>What to do next</h2>
            </div>
            <span class="badge badge-neutral">{{ dashboard.recommendedActions.length }} steps</span>
          </div>
          <ol>
            <li *ngFor="let action of dashboard.recommendedActions">{{ action }}</li>
          </ol>
        </article>

        <article class="panel policy-panel">
          <div class="panel-heading">
            <div>
              <p class="panel-kicker">Policy checks</p>
              <h2>Policy summary</h2>
            </div>
            <span class="badge badge-neutral">{{ dashboard.policyChecks.length }} checks</span>
          </div>
          <div class="checks">
            <div *ngFor="let check of dashboard.policyChecks" class="check-row">
              <div>
                <strong>{{ check.name }}</strong>
                <p>{{ check.detail }}</p>
              </div>
              <span class="status" [class.status-pass]="check.status === 'PASS'" [class.status-warn]="check.status === 'WARN'" [class.status-block]="check.status === 'BLOCK'">{{ check.status }}</span>
            </div>
          </div>
        </article>
      </section>

      <section class="dashboard-grid dashboard-grid-bottom">
        <article class="panel">
          <p class="panel-kicker">Evidence</p>
          <h2>Report details</h2>
          <div class="evidence-list">
            <div class="evidence-item">
              <span>Notification status</span>
              <strong>{{ dashboard.notification.notificationStatus }} ({{ dashboard.notification.channel }})</strong>
            </div>
            <div class="evidence-item">
              <span>Email subject</span>
              <strong>{{ dashboard.notification.subject }}</strong>
            </div>
            <div class="evidence-item" *ngFor="let item of evidence" class="evidence-item">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </article>

        <article class="panel">
          <p class="panel-kicker">Validation focus</p>
          <h2>Smoke test plan</h2>
          <ul class="bullets">
            <li>Confirm the dashboard loads with the latest report summary.</li>
            <li>Verify the policy checks section clearly shows pass and warning states.</li>
            <li>Recheck backend health endpoints before promotion.</li>
          </ul>
        </article>
      </section>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background:
        radial-gradient(circle at top left, rgba(59, 130, 246, 0.16), transparent 28%),
        radial-gradient(circle at top right, rgba(20, 184, 166, 0.12), transparent 24%),
        linear-gradient(135deg, #07111f, #0f1b2e 55%, #0b1220);
      color: #e5eefc;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .shell {
      max-width: 1200px;
      margin: 0 auto;
      padding: 56px 24px 72px;
    }
    .hero {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 20px;
      padding: 28px;
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 30px;
      background: rgba(15, 23, 42, 0.72);
      backdrop-filter: blur(18px);
      box-shadow: 0 24px 80px rgba(2, 6, 23, 0.35);
    }
    .eyebrow {
      margin: 0 0 12px;
      text-transform: uppercase;
      letter-spacing: 0.24em;
      color: #93c5fd;
      font-size: 12px;
    }
    h1 {
      margin: 0;
      font-size: clamp(2.5rem, 6vw, 5.2rem);
      line-height: 0.95;
      max-width: 11ch;
    }
    .lede {
      max-width: 720px;
      font-size: 1.1rem;
      line-height: 1.7;
      color: #cbd5e1;
      margin-top: 20px;
    }
    .hero-stats {
      display: grid;
      gap: 14px;
    }
    .stat {
      padding: 20px;
      border-radius: 24px;
      border: 1px solid rgba(148, 163, 184, 0.16);
      background: rgba(2, 6, 23, 0.4);
    }
    .stat-alert {
      background: linear-gradient(135deg, rgba(127, 29, 29, 0.42), rgba(30, 41, 59, 0.82));
    }
    .stat-label {
      display: inline-block;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      font-size: 11px;
      color: #93c5fd;
    }
    .stat strong {
      display: block;
      font-size: 1.6rem;
      margin-bottom: 8px;
    }
    .stat p {
      margin: 0;
      color: #cbd5e1;
      line-height: 1.55;
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 18px;
      margin-top: 18px;
    }
    .dashboard-grid-bottom {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .panel {
      padding: 24px;
      border-radius: 24px;
      background: rgba(15, 23, 42, 0.72);
      border: 1px solid rgba(148, 163, 184, 0.16);
      box-shadow: 0 12px 48px rgba(2, 6, 23, 0.18);
    }
    .panel-error {
      border-color: rgba(239, 68, 68, 0.35);
      background: rgba(127, 29, 29, 0.25);
      margin-bottom: 18px;
    }
    h2 {
      margin: 6px 0 0;
      font-size: 1.25rem;
    }
    .panel-kicker {
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: #93c5fd;
      font-size: 11px;
    }
    .panel-text {
      margin: 14px 0 18px;
      color: #cbd5e1;
      line-height: 1.65;
    }
    .panel-heading {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .badge-critical {
      background: rgba(239, 68, 68, 0.18);
      color: #fca5a5;
      border: 1px solid rgba(239, 68, 68, 0.28);
    }
    .badge-neutral {
      background: rgba(59, 130, 246, 0.16);
      color: #bfdbfe;
      border: 1px solid rgba(59, 130, 246, 0.24);
    }
    .key-value-grid {
      display: grid;
      gap: 14px;
    }
    .key-value-grid span,
    .evidence-item span {
      display: block;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #94a3b8;
      margin-bottom: 6px;
    }
    .key-value-grid strong,
    .evidence-item strong {
      display: block;
      color: #e5eefc;
      line-height: 1.55;
    }
    .checks {
      margin-top: 14px;
      display: grid;
      gap: 12px;
    }
    .check-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 14px 16px;
      border-radius: 18px;
      background: rgba(2, 6, 23, 0.36);
      border: 1px solid rgba(148, 163, 184, 0.12);
    }
    .check-row strong {
      display: block;
      font-size: 0.98rem;
    }
    .check-row p {
      margin: 5px 0 0;
      color: #cbd5e1;
      line-height: 1.6;
      font-size: 0.95rem;
    }
    .status {
      flex: 0 0 auto;
      min-width: 78px;
      text-align: center;
      padding: 8px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      border: 1px solid transparent;
    }
    .status-pass {
      background: rgba(16, 185, 129, 0.16);
      color: #a7f3d0;
      border-color: rgba(16, 185, 129, 0.24);
    }
    .status-warn {
      background: rgba(245, 158, 11, 0.16);
      color: #fde68a;
      border-color: rgba(245, 158, 11, 0.24);
    }
    .status-block {
      background: rgba(239, 68, 68, 0.16);
      color: #fecaca;
      border-color: rgba(239, 68, 68, 0.24);
    }
    .evidence-list {
      margin-top: 16px;
      display: grid;
      gap: 14px;
    }
    .evidence-item {
      padding: 16px 18px;
      border-radius: 18px;
      background: rgba(2, 6, 23, 0.36);
      border: 1px solid rgba(148, 163, 184, 0.12);
    }
    .bullets {
      margin: 16px 0 0;
      padding-left: 18px;
      color: #cbd5e1;
      line-height: 1.75;
    }
    @media (max-width: 900px) {
      .hero { grid-template-columns: 1fr; }
      .dashboard-grid,
      .dashboard-grid-bottom {
        grid-template-columns: 1fr;
      }
      .hero { padding: 28px; }
    }
  `]
})
export class AppComponent implements OnInit {
  loading = true;
  error = '';

  dashboard: {
    executiveSummary: string;
    severity: string;
    confidenceScore: number;
    impactedComponents: string[];
    recommendedActions: string[];
    policyChecks: Array<{ name: string; status: string; detail: string }>;
    notification: { notificationStatus: string; channel: string; subject: string; preview: string };
  } = {
    executiveSummary: 'Loading summary...',
    severity: 'UNKNOWN',
    confidenceScore: 0,
    impactedComponents: [],
    recommendedActions: [],
    policyChecks: [],
    notification: { notificationStatus: 'PENDING', channel: 'n/a', subject: '', preview: '' },
  };

  evidence = [
    { label: 'API route', value: '/api/gateway/policy-summary' },
    { label: 'Analyzer source', value: 'contract-analyzer-service' },
    { label: 'Notification source', value: 'agent-tools-service' },
  ];

  constructor(private readonly http: HttpClient) {}

  get passCount(): number {
    return this.dashboard.policyChecks.filter((c) => c.status === 'PASS').length;
  }

  ngOnInit(): void {
    this.http.get<any>('http://localhost:8082/api/gateway/policy-summary').subscribe({
      next: (resp) => {
        this.dashboard = {
          executiveSummary: resp.executiveSummary ?? 'No summary available.',
          severity: resp.severity ?? 'UNKNOWN',
          confidenceScore: resp.confidenceScore ?? 0,
          impactedComponents: resp.impactedComponents ?? [],
          recommendedActions: resp.recommendedActions ?? [],
          policyChecks: resp.policyChecks ?? [],
          notification: resp.notification ?? { notificationStatus: 'UNKNOWN', channel: 'n/a', subject: '', preview: '' },
        };
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Gateway request failed. Ensure experience-gateway and dependencies are running.';
        this.loading = false;
      },
    });
  }
}
