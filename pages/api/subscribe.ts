import { NowRequest, NowResponse } from "@vercel/node";
import { Db, MongoClient } from "mongodb";
import url from "url";

let cachedDb: Db = null;

async function connectToDatabase(uri: string) {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const dbName = url.parse(uri).pathname.substr(1);

  const db = client.db(dbName);

  cachedDb = db;

  return db;
}

export default async (req: NowRequest, res: NowResponse) => {
  const { email } = req.body;

  const db = await connectToDatabase(process.env.MONGODB_URI);

  const collection = db.collection("subscribers");

  await collection.insertOne({ email, subscribedAt: new Date() });

  return res.status(201).json({ message: `${email} was registered` });
};
