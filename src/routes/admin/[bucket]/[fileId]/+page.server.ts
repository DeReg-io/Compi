import { getFile } from '$lib/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params: { bucket, fileId } }) => {
  console.log('bucket in admin: ', bucket);
  console.log('file in admin: ', fileId);
  const file = await getFile(fileId);

  if (!file) {
    throw error(404, {
      message: 'Not found'
    });
  }

  return {
    file
  };
}) satisfies PageServerLoad;
