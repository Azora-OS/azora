// 💪 Azora MongoDB Client - Ubuntu Document Store
import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/azora';
const client = new MongoClient(uri);

let db: Db;

export const connectMongoDB = async (): Promise<Db> => {
  if (!db) {
    await client.connect();
    db = client.db();
    console.log('💪 MongoDB connected - Ubuntu document store active');
  }
  return db;
};

export const getCollection = (name: string) => db.collection(name);

export default { connectMongoDB, getCollection };
