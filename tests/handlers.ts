import { http, HttpResponse } from 'msw';
import pageGetFixture from './fixtures/page-get.json';
import pageCreateFixture from './fixtures/page-create.json';
import pageUpdateFixture from './fixtures/page-update.json';
import pageArchiveFixture from './fixtures/page-archive.json';
import pageRestoreFixture from './fixtures/page-restore.json';
import pageSearchFixture from './fixtures/page-search.json';

export const handlers = [
  http.get('https://api.notion.com/v1/ping', () => {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }),

  http.get('https://api.notion.com/v1/pages/:pageId', () => {
    return HttpResponse.json(pageGetFixture);
  }),

  http.post('https://api.notion.com/v1/pages', () => {
    return HttpResponse.json(pageCreateFixture);
  }),

  http.patch('https://api.notion.com/v1/pages/:pageId', async ({ request }) => {
    const body = await request.json() as { archived?: boolean };

    if (body.archived === true) {
      return HttpResponse.json(pageArchiveFixture);
    }
    if (body.archived === false) {
      return HttpResponse.json(pageRestoreFixture);
    }
    return HttpResponse.json(pageUpdateFixture);
  }),

  http.post('https://api.notion.com/v1/search', () => {
    return HttpResponse.json(pageSearchFixture);
  }),
];
