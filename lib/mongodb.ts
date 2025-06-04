import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri: string = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db('hazard-detection');
}

// Helper function to handle database operations with error handling
export async function withDb<T>(
  operation: (db: Db) => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const db = await getDb();
    const data = await operation(db);
    return { success: true, data };
  } catch (error) {
    console.error('Database operation failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
}