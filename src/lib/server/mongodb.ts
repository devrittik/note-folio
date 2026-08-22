import { MongoClient, type Db } from 'mongodb';
import type { ContactMessage } from '../contact/schema';
import { readServerEnv } from './env';

declare global {
  // Reuse the connection promise during local HMR and across warm server instances.
  // eslint-disable-next-line no-var
  var __portfolioMongoPromise: Promise<MongoClient> | undefined;
}

function getMongoClient(): Promise<MongoClient> {
  const uri = readServerEnv('MONGODB_URI');
  if (!uri) throw new Error('MONGODB_URI is not configured');

  if (!globalThis.__portfolioMongoPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 7_000,
      connectTimeoutMS: 7_000
    });
    globalThis.__portfolioMongoPromise = client.connect().catch((error) => {
      globalThis.__portfolioMongoPromise = undefined;
      throw error;
    });
  }

  return globalThis.__portfolioMongoPromise;
}

async function getDatabase(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(readServerEnv('MONGODB_DB_NAME') || 'portfolio');
}

export async function storeContactMessage(message: ContactMessage, requestId: string): Promise<void> {
  const database = await getDatabase();
  await database.collection('contact_messages').insertOne({
    ...message,
    requestId,
    source: 'portfolio-contact-form',
    createdAt: new Date()
  });
}
