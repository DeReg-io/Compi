import { archiveFile } from '$lib/db';
import type { RequestHandler } from '@sveltejs/kit';

export const DELETE = (async ({ request }) => {
  console.log('request: ', request);
  const { id } = await request.json();
  await archiveFile(id);
  return new Response();
}) satisfies RequestHandler;
