import type { Actions } from './$types';
import { createNewBucket } from '$lib/db';
import addCookie from '$lib/add-cookie';

export const actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const data: { [key: string]: FormDataEntryValue } = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    const bucketId = await createNewBucket(
      data.name as string,
      data.password as string
    );
    addCookie(cookies, bucketId);
  }
} satisfies Actions;
