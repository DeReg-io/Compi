import { getComments } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load = (async ({ params: { bucket } }) => {
  const comments = await getComments(bucket);
  console.log('comments: ', comments);

  return {
    bucket,
    comments
  };
}) satisfies PageServerLoad;
