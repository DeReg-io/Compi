import { env } from '$env/dynamic/private';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import dynamoDBClient, { getNewFileItem } from './db';

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, BASE_BUCKET_PATH } = env;

const credentials = {
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY
};
const region = 'eu-central-1';

const s3Client = new S3Client({
  region,
  credentials
});

// Function to retrieve file names from a specific path in a bucket
async function getFileNamesFromS3Path(path: string): Promise<string[]> {
  const command = new ListObjectsV2Command({
    Bucket: BASE_BUCKET_PATH,
    Prefix: path
  });
  try {
    const response = await s3Client.send(command);
    const fileNames = response.Contents.map(
      (object) => object.Key?.split('/')[1]
    ).filter((fileName) => !!fileName);
    return fileNames;
  } catch (err) {
    console.error('Error retrieving file names: ', err);
    return [];
  }
}

async function newDoc(id: string, bucket: string) {
  const putCommand = new PutItemCommand({
    TableName: 'compi',
    Item: getNewFileItem(id, bucket),
    ConditionExpression: 'attribute_not_exists(id)' // Only put the item if it doesn't exist
  });

  try {
    const response = await dynamoDBClient.send(putCommand);
    console.log('sucess response: ', response);
  } catch (error: any) {
    if (error?.name === 'ConditionalCheckFailedException') {
      console.log('Item already exists');
    } else {
      throw error;
    }
  }
}

export async function s3DynamoDbSync(bucketPath: string) {
  try {
    const fileNames = await getFileNamesFromS3Path(bucketPath);
    console.log('fileNames: ', fileNames);

    await Promise.all(
      fileNames.map((fileName) => {
        return newDoc(fileName, bucketPath);
      })
    );
  } catch (error: any) {
    console.error('Failed to sync s3 to dynamodb: ', error);
  }
}
