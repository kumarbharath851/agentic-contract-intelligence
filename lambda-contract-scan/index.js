export const handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      scanId: 'scan-2026-06-01-001',
      source: 'mock-core-system',
      status: 'triggered',
      contractVersion: 'latest'
    })
  };
};
