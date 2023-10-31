import {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';
import type { RawCompiFile } from './types';

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = env;
const credentials = {
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY
};
const REGION = 'eu-central-1';
const s3Client = new S3Client({ region: REGION, credentials });

export async function uploadFiles(files: RawCompiFile[], bucket: string) {
  try {
    await Promise.all(
      files.map(async (file) => {
        const command = new PutObjectCommand({
          Bucket: 'compey',
          Key: `${bucket}/${file.id}`,
          //   Key: `${bucket}/${file.id}.${file.file.type.split('/')[1]}`,
          Body: Buffer.from(await file.file.arrayBuffer())
        });
        const response = await s3Client.send(command);
        console.log('response: ', response);
      })
    );
  } catch (err) {
    console.error('Failed to upload files: ', err);
    throw err;
  }
}
