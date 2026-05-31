export interface AccountSummary {
  accountId: string;
  status: string;
  currentAccountValue: number;
  outstandingLoanAmount?: number;
  nextPaymentDate?: string;
  upcomingPaymentDate?: string;
}

export function renderAccountSummary(summary: AccountSummary): string {
  const paymentDate = summary.nextPaymentDate ?? summary.upcomingPaymentDate ?? 'unavailable';

  return [
    `Account: ${summary.accountId}`,
    `Status: ${summary.status}`,
    `Balance: ${summary.currentAccountValue}`,
    `Payment date: ${paymentDate}`
  ].join('\n');
}
