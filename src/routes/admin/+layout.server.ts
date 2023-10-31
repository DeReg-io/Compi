import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals: { user }, url }) => {
  console.log('locals====: ', user?.bucket);
  console.log('url: ', url);
  if (url.pathname === '/admin/login') {
    // allow
  } else if (!user?.bucket) {
    throw redirect(303, '/admin/login');
  } else if (user?.bucket && url.pathname.split('/')[2] !== user?.bucket) {
    throw redirect(303, `/admin/${user?.bucket}`);
  }
  console.log('nothing');
}) satisfies LayoutServerLoad;
