import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'aci-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="shell">
      <section class="hero">
        <p class="eyebrow">Agentic Contract Intelligence Platform</p>
        <h1>Contract drift becomes actionable evidence.</h1>
        <p class="lede">
          This impact center combines mock identity, scan orchestration, traceability, and executive reporting in one demo surface.
        </p>
      </section>

      <section class="grid">
        <article>
          <h2>Scan Health</h2>
          <p>Latest scan detected a critical drift in the account summary contract.</p>
        </article>
        <article>
          <h2>Trace</h2>
          <p>Gateway, analyzer, and agent stages are captured with timestamps and evidence links.</p>
        </article>
        <article>
          <h2>Executive Report</h2>
          <p>Impact, owners, remediation actions, and confidence are summarized for leaders.</p>
        </article>
      </section>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(135deg, #08111f, #10233d 55%, #0f172a);
      color: #e5eefc;
      font-family: Arial, Helvetica, sans-serif;
    }
    .shell {
      max-width: 1200px;
      margin: 0 auto;
      padding: 64px 24px;
    }
    .hero {
      padding: 48px;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 28px;
      background: rgba(15, 23, 42, 0.72);
      backdrop-filter: blur(16px);
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
      max-width: 10ch;
    }
    .lede {
      max-width: 720px;
      font-size: 1.1rem;
      line-height: 1.7;
      color: #cbd5e1;
      margin-top: 20px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 18px;
      margin-top: 22px;
    }
    article {
      padding: 24px;
      border-radius: 24px;
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(148, 163, 184, 0.16);
    }
    h2 {
      margin-top: 0;
      font-size: 1.1rem;
    }
    p {
      margin-bottom: 0;
      color: #cbd5e1;
      line-height: 1.6;
    }
    @media (max-width: 900px) {
      .grid { grid-template-columns: 1fr; }
      .hero { padding: 28px; }
    }
  `]
})
export class AppComponent {}
