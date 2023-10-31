import { env } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';
import type { Cookie } from './types';
import jwt from 'jsonwebtoken';

const { NODE_ENV, JWT_SECRET } = env;

export default function addCookie(cookies: Cookies, bucketId: string) {
  const cookie: Cookie = {
    bucket: bucketId
  };
  const token = jwt.sign(cookie, JWT_SECRET);
  cookies.set('session', token, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: NODE_ENV !== 'development',
    maxAge: 60 * 60 * 24 * 365
  });
}
