import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';
import type { Cookie } from '$lib/types';
import { deleteCookie } from '$lib/delete-session-cookie';
const { JWT_SECRET } = env;

// for exact path
const unProtectedPaths: string[] = [];
const unProtectedBasePaths: string[] = ['choose', 'add', 'admin'];

export const handle = (async ({ event, resolve }) => {
  try {
    const encodedCookie = event.cookies.get('session');
    if (!encodedCookie) {
      throw Error('Could not decode session cookie');
    }
    const cookie = jwt.verify(encodedCookie, JWT_SECRET) as Cookie;

    event.locals.user = cookie;
    return resolve(event);
  } catch (err) {
    if (
      unProtectedPaths.includes(event.url.pathname) ||
      // [0] is empty, if pathname starts with /
      unProtectedBasePaths.includes(event.url.pathname.split('/')[1])
    ) {
      return resolve(event);
    }

    // delete session cookie
    deleteCookie(event.cookies);
  }
  const { pathname } = event.url;
  throw redirect(303, pathname);
}) satisfies Handle;
