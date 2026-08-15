import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "portfolio_chat_history";

const clientOptions = {
  serverSelectionTimeoutMS: 2500, // Timeout after 2.5s if cluster is down
  connectTimeoutMS: 2500,
};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

/**
 * Returns a cached singleton MongoClient promise with graceful error recovery
 */
export async function getMongoClient(): Promise<MongoClient | null> {
  if (!uri) {
    return null;
  }

  try {
    if (process.env.NODE_ENV === "development") {
      if (!global._mongoClientPromise) {
        client = new MongoClient(uri, clientOptions);
        global._mongoClientPromise = client.connect().catch((err) => {
          global._mongoClientPromise = undefined; // Reset on failure so it can retry next time
          throw err;
        });
      }
      return await global._mongoClientPromise;
    } else {
      if (!clientPromise) {
        client = new MongoClient(uri, clientOptions);
        clientPromise = client.connect().catch((err) => {
          clientPromise = null; // Reset on failure so it can retry next time
          throw err;
        });
      }
      return await clientPromise;
    }
  } catch (err) {
    console.error("[MongoDB Connection Error - Silently Handled]:", err);
    return null;
  }
}

/**
 * Returns the MongoDB Database instance with graceful fallback
 */
export async function getMongoDb(): Promise<Db | null> {
  try {
    const mongoClient = await getMongoClient();
    if (!mongoClient) {
      return null;
    }
    return mongoClient.db(dbName);
  } catch (err) {
    console.error("[MongoDB Database Error - Silently Handled]:", err);
    return null;
  }
}
