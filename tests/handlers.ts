import { http, HttpResponse } from 'msw';
import pageGetFixture from './fixtures/page-get.json';
import pageCreateFixture from './fixtures/page-create.json';
import pageUpdateFixture from './fixtures/page-update.json';
import pageArchiveFixture from './fixtures/page-archive.json';
import pageRestoreFixture from './fixtures/page-restore.json';
import pageSearchFixture from './fixtures/page-search.json';
import blockGetFixture from './fixtures/block-get.json';
import blockChildrenFixture from './fixtures/block-children.json';
import blockAppendFixture from './fixtures/block-append.json';
import blockUpdateFixture from './fixtures/block-update.json';
import blockDeleteFixture from './fixtures/block-delete.json';
import databaseGetFixture from './fixtures/database-get.json';
import databaseCreateFixture from './fixtures/database-create.json';
import databaseUpdateFixture from './fixtures/database-update.json';
import databaseQueryFixture from './fixtures/database-query.json';
import databaseSearchFixture from './fixtures/database-search.json';
import dbPageCreateFixture from './fixtures/db-page-create.json';

export const handlers = [
  http.get('https://api.notion.com/v1/ping', () => {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }),

  http.get('https://api.notion.com/v1/pages/:pageId', () => {
    return HttpResponse.json(pageGetFixture);
  }),

  http.post('https://api.notion.com/v1/pages', async ({ request }) => {
    const body = await request.json() as { parent?: { database_id?: string; page_id?: string } };
    if (body.parent?.database_id) {
      return HttpResponse.json(dbPageCreateFixture);
    }
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

  http.post('https://api.notion.com/v1/search', async ({ request }) => {
    const body = await request.json() as { filter?: { value?: string } };
    if (body.filter?.value === 'data_source') {
      return HttpResponse.json(databaseSearchFixture);
    }
    return HttpResponse.json(pageSearchFixture);
  }),

  http.get('https://api.notion.com/v1/blocks/:blockId', () => {
    return HttpResponse.json(blockGetFixture);
  }),

  http.get('https://api.notion.com/v1/blocks/:blockId/children', () => {
    return HttpResponse.json(blockChildrenFixture);
  }),

  http.patch('https://api.notion.com/v1/blocks/:blockId/children', () => {
    return HttpResponse.json(blockAppendFixture);
  }),

  http.patch('https://api.notion.com/v1/blocks/:blockId', () => {
    return HttpResponse.json(blockUpdateFixture);
  }),

  http.delete('https://api.notion.com/v1/blocks/:blockId', () => {
    return HttpResponse.json(blockDeleteFixture);
  }),

  http.get('https://api.notion.com/v1/databases/:databaseId', () => {
    return HttpResponse.json(databaseGetFixture.database);
  }),

  http.get('https://api.notion.com/v1/data_sources/:dataSourceId', () => {
    return HttpResponse.json(databaseGetFixture.dataSource);
  }),

  http.post('https://api.notion.com/v1/databases', () => {
    return HttpResponse.json(databaseCreateFixture.database);
  }),

  http.patch('https://api.notion.com/v1/databases/:databaseId', () => {
    return HttpResponse.json(databaseUpdateFixture.database);
  }),

  http.patch('https://api.notion.com/v1/data_sources/:dataSourceId', () => {
    return HttpResponse.json(databaseUpdateFixture.dataSource);
  }),

  http.post('https://api.notion.com/v1/data_sources/:dataSourceId/query', () => {
    return HttpResponse.json(databaseQueryFixture);
  }),
];
