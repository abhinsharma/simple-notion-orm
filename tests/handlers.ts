import { http } from 'msw';

export const handlers = [
  // Extend in integration tests when specific endpoints need to be mocked.
  http.get('https://api.notion.com/v1/ping', () => {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }),
];
