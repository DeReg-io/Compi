// IDEA: different voting systems, also vote by seeing all
// and having a limited votes

import { getTwoFiles, submitChoice, type Choice, getBucket } from '$lib/db';
import type { Bucket } from '$lib/types';
import type { PageServerLoad } from './$types';

// const bucket = 'e590693c-5408-480d-aa6a-e86d3c88fd6f';

export const load = (async ({ params: { bucket } }) => {
  const bucketDoc = await getBucket(bucket);
  return {
    files: (await getTwoFiles(bucket)).map((file) => ({
      id: file.id,
      bucket: bucket
    })),
    bucket: bucketDoc || ({} as Bucket)
  };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request, params: { bucket } }) => {
    const formData = await request.formData();
    const data: { [key: string]: FormDataEntryValue } = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    await submitChoice(data as Choice, bucket);
    console.log('data: ', data);
  }
};
