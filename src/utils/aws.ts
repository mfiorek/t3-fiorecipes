import S3 from 'aws-sdk/clients/s3';
import { env } from '../env/server.mjs';

export const s3 = new S3({
  apiVersion: '2006-03-01',
  accessKeyId: env.MF_AWS_ACCESS_KEY_ID,
  secretAccessKey: env.MF_AWS_SECRET_ACCESS_KEY,
  region: env.MF_AWS_REGION,
  signatureVersion: 'v4',
});
