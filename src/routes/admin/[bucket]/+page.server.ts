import type { Actions, PageServerLoad } from './$types';
import type { RawCompiFile } from '$lib/types';
import { uploadFiles } from '$lib/s3';
import { addFiles, getAllFilesFromBucket } from '$lib/db';

export const load = (async ({ params: { bucket } }) => {
  console.log('bucket in admin: ', bucket);
  return {
    bucket,
    files: await getAllFilesFromBucket(bucket)
  };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({
    request,
    locals: {
      user: { bucket }
    }
  }) => {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    if (files.length === 1 && files[0].size === 0) {
      return null;
    }
    const compiFiles: RawCompiFile[] = files.map((file) => ({
      file,
      id: crypto.randomUUID()
    }));

    await Promise.all([
      uploadFiles(compiFiles, bucket),
      addFiles(compiFiles, bucket)
    ]);
  }
} satisfies Actions;
