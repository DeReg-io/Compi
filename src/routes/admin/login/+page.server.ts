import type { Actions } from './$types';
import { createNewBucket, verifyBucket } from '$lib/db';
import addCookie from '$lib/add-cookie';
import { redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, url, cookies }) => {
    const formData = await request.formData();
    const data: { [key: string]: FormDataEntryValue } = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    const verified = await verifyBucket(
      data.bucket as string,
      data.password as string
    );
    if (verified) {
      addCookie(cookies, data.bucket as string);
      throw redirect(303, `/admin/${data.bucket}`);
    }
  }
} satisfies Actions;
