import "dotenv/config";
import { type Db, MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient> | null = null;

export const getMongoDb = async (): Promise<Db> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable in the root .env file",
    );
  }

  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }

  const client = await clientPromise;
  return client.db();
};
