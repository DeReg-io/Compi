// IDEA:
// elo ranking system, with points and tiers

// TODO: check updatedAt everywhere

import { env } from '$env/dynamic/private';
import {
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
  GetItemCommand,
  BatchWriteItemCommand,
  DeleteItemCommand
} from '@aws-sdk/client-dynamodb';
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = env;
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { getRandomElements } from './utils';
import bcrypt from 'bcrypt';
import type { RawCompiFile, CompiFile, Comment, Bucket } from './types';
import { error } from '@sveltejs/kit';

const fileTable = 'compi';
const commentTable = 'compi_comments';
const bucketTable = 'compi_buckets';
const bucketTotalCountIndex = 'bucket-totalCounts-index';
const commentsBucketCreatedAtIndes = 'bucket-createdAt-index';
const leastVotedCount = 3;
const saltRounds = 10;

export type Choice = {
  chosenImg: string;
  unchosenImg: string;
  comment?: string;
};

const credentials = {
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY
};
const region = 'eu-central-1';

const dynamoDBClient = new DynamoDBClient({
  region,
  credentials
});

// have to pay one unit for each document to count
// Idea of count: if 3 times more votes than counts are found,
// start using a logic of comparing loosers and winners instead
// of just random
export async function getTotalCount(bucket: string): Promise<number> {
  const queryCommand = new QueryCommand({
    TableName: fileTable,
    IndexName: bucketTotalCountIndex,
    KeyConditionExpression: '#bucket = :bucket',
    ExpressionAttributeNames: {
      '#bucket': 'bucket'
    },
    ExpressionAttributeValues: {
      ':bucket': { S: bucket }
    },
    Select: 'COUNT' // Only return the count of matching items
  });

  const response = await dynamoDBClient.send(queryCommand);
  return response.Count || 0;
}

export async function getLeastVoted(bucket: string): Promise<CompiFile[]> {
  const queryCommand = new QueryCommand({
    TableName: fileTable,
    IndexName: bucketTotalCountIndex,
    KeyConditionExpression: '#bucket = :bucket',
    ExpressionAttributeNames: {
      '#bucket': 'bucket'
    },
    ExpressionAttributeValues: {
      ':bucket': { S: bucket } // The bucket to query
    },
    ScanIndexForward: true, // Change this to true if you want ascending order
    Limit: leastVotedCount // Limit the number of items returned
  });
  const response = await dynamoDBClient.send(queryCommand);
  if (!response.Items) return [];
  const docs = response.Items.map((item) => unmarshall(item)) as CompiFile[];
  return docs;
}

async function saveWin(choice: Choice) {
  const params = {
    TableName: fileTable,
    Key: { id: { S: choice.chosenImg } },
    ExpressionAttributeNames: {
      '#s': 'wins',
      '#v': choice.unchosenImg,
      '#f1': 'totalCounts',
      '#f2': 'totalWins'
    },
    ExpressionAttributeValues: {
      ':inc': { N: '1' },
      ':zero': { N: '0' }
    },
    UpdateExpression:
      'SET #s.#v = if_not_exists(#s.#v, :zero) + :inc, #f1 = if_not_exists(#f1, :zero) + :inc, #f2 = if_not_exists(#f2, :zero) + :inc',
    ReturnValues: 'UPDATED_NEW'
  };

  try {
    await dynamoDBClient.send(new UpdateItemCommand(params));
  } catch (err) {
    console.error('Failed to save win: ', err);
    throw err;
  }
}

async function saveLoss(choice: Choice) {
  const params = {
    TableName: fileTable,
    Key: { id: { S: choice.unchosenImg } },
    ExpressionAttributeNames: {
      '#s': 'losses',
      '#v': choice.chosenImg,
      '#f1': 'totalCounts',
      '#f2': 'totalLosses'
    },
    ExpressionAttributeValues: {
      ':inc': { N: '1' },
      ':zero': { N: '0' }
    },
    UpdateExpression:
      'SET #s.#v = if_not_exists(#s.#v, :zero) + :inc, #f1 = if_not_exists(#f1, :zero) + :inc, #f2 = if_not_exists(#f2, :zero) + :inc',
    ReturnValues: 'UPDATED_NEW'
  };

  try {
    await dynamoDBClient.send(new UpdateItemCommand(params));
  } catch (err) {
    console.error('Failed to save loss: ', err);
    throw err;
  }
}

async function saveComment(choice: Choice, bucket: string) {
  if (!choice.comment) return null;
  const putCommand = new PutItemCommand({
    TableName: commentTable,
    Item: {
      id: { S: crypto.randomUUID() }, // The type of the key is String (S)
      bucket: { S: bucket },
      winnerId: { S: choice.chosenImg },
      looserId: { S: choice.unchosenImg },
      comment: { S: choice.comment },
      createdAt: { S: new Date().toISOString() }
    }
  });

  try {
    await dynamoDBClient.send(putCommand);
  } catch (error: any) {
    console.error('Could not save comment: ', error);
    throw error;
  }
}

export async function getTwoFiles(bucket: string): Promise<CompiFile[]> {
  const docs = await getLeastVoted(bucket);
  return getRandomElements(docs, 2);
}

export async function submitChoice(choice: Choice, bucket: string) {
  await Promise.all([
    saveWin(choice),
    saveLoss(choice),
    saveComment(choice, bucket)
  ]);
}

export async function createNewBucket(
  name: string,
  password: string
): Promise<string> {
  const bucketId = crypto.randomUUID();
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const putCommand = new PutItemCommand({
    TableName: bucketTable,
    Item: {
      id: { S: bucketId }, // The type of the key is String (S)
      name: { S: name },
      password: { S: hashedPassword },
      createdAt: { S: new Date().toISOString() }
    }
  });

  try {
    await dynamoDBClient.send(putCommand);
    return bucketId;
  } catch (error: any) {
    console.error('Could not create new bucket: ', error);
    throw error;
  }
}

export async function verifyBucket(
  bucket: string,
  password: string
): Promise<Boolean> {
  const params = {
    TableName: bucketTable,
    Key: {
      id: { S: bucket }
    }
  };
  const { Item } = await dynamoDBClient.send(new GetItemCommand(params));
  console.log('data: ', Item);
  if (!Item) return false;
  const doc = unmarshall(Item);
  const match = await bcrypt.compare(password, doc.password);
  return match;
}

export async function getBucket(bucket: string): Promise<Bucket | null> {
  const params = {
    TableName: bucketTable,
    Key: {
      id: { S: bucket }
    }
  };
  const { Item } = await dynamoDBClient.send(new GetItemCommand(params));
  if (!Item) return null;
  const doc = unmarshall(Item) as Bucket;
  delete doc.password;
  return doc;
}

export async function addFiles(files: RawCompiFile[], bucket: string) {
  const params = {
    RequestItems: {
      [fileTable]: files.map((file) => ({
        PutRequest: {
          Item: getNewFileItem(file.id, bucket, file.file)
        }
      }))
    }
  };

  try {
    await dynamoDBClient.send(new BatchWriteItemCommand(params));
  } catch (error: any) {
    console.error('Could not save comment: ', error);
    throw error;
  }
}

export function getNewFileItem(id: string, bucket: string, file: File) {
  return {
    id: { S: id }, // The type of the key is String (S)
    bucket: { S: bucket },
    fileType: { S: file.type },
    fileName: { S: file.name },
    totalWins: { N: '0' },
    totalLosses: { N: '0' },
    wins: { M: {} },
    losses: { M: {} },
    totalCounts: { N: '0' },
    updateAt: { S: new Date().toISOString() },
    createdAt: { S: new Date().toISOString() }
  };
}

export async function getAllFilesFromBucket(
  bucket: string,
  archived = true
): Promise<CompiFile[]> {
  const getParams = (bucket: string) => ({
    TableName: fileTable,
    IndexName: bucketTotalCountIndex,
    KeyConditionExpression: '#bucket = :bucket',
    ExpressionAttributeNames: {
      '#bucket': 'bucket'
    },
    ExpressionAttributeValues: {
      ':bucket': { S: bucket } // The bucket to query
    }
  });
  const response = await dynamoDBClient.send(
    new QueryCommand(getParams(bucket))
  );
  let responseArchived;
  if (archived) {
    responseArchived = await dynamoDBClient.send(
      new QueryCommand(getParams(`archive_${bucket}`))
    );
  }
  if (!response.Items && !responseArchived?.Items) return [];
  const docs = [
    ...(response.Items || []),
    ...(responseArchived?.Items || [])
  ].map((item) => unmarshall(item)) as CompiFile[];
  return docs;
}

// get item by id
// delete it from original table
// save the item the the archive bucket
export async function archiveFile(id: string) {
  try {
    const getItemParams = {
      TableName: fileTable,
      Key: {
        id: { S: id }
      }
    };
    const { Item } = await dynamoDBClient.send(
      new GetItemCommand(getItemParams)
    );
    if (!Item) {
      throw new Error(`Item with id ${id} does not exist.`);
    }
    const file = unmarshall(Item) as CompiFile;
    file.bucket = `archive_${file.bucket}`;

    const putCommand = new PutItemCommand({
      TableName: fileTable,
      Item: marshall(file)
    });

    const deleteParams = {
      TableName: fileTable,
      Key: { id: { S: id } }
    };

    // don't use Promise.all, have to wait for delete first, using same id
    await dynamoDBClient.send(new DeleteItemCommand(deleteParams));
    await dynamoDBClient.send(putCommand);
  } catch (error: any) {
    console.error('Could not save comment: ', error);
    throw error;
  }
}

export async function getFile(id: string): Promise<CompiFile | null> {
  const params = {
    TableName: fileTable,
    Key: {
      id: { S: id }
    }
  };
  const { Item } = await dynamoDBClient.send(new GetItemCommand(params));
  console.log('getFile: ', Item);
  if (!Item) return null;
  return unmarshall(Item) as CompiFile;
}

export async function getComments(bucket: string) {
  const queryCommand = new QueryCommand({
    TableName: commentTable,
    IndexName: commentsBucketCreatedAtIndes,
    KeyConditionExpression: '#bucket = :bucket',
    ExpressionAttributeNames: {
      '#bucket': 'bucket'
    },
    ExpressionAttributeValues: {
      ':bucket': { S: bucket } // The bucket to query
    },
    ScanIndexForward: true // Change this to true if you want ascending order
  });
  const response = await dynamoDBClient.send(queryCommand);
  if (!response.Items) return [];
  const docs = response.Items.map((item) => unmarshall(item)) as Comment[];
  return docs;
}

export default dynamoDBClient;
