import mongoose from 'mongoose';

/**
 * We chose Mongoose instead of the native MongoDB driver because:
 * 1. It provides built-in schema definition and validation, ensuring type safety and structure
 *    for User and Topology documents at the application layer.
 * 2. It simplifies query syntax, relationships (e.g. referencing user IDs), and handles
 *    document creation/updating lifecycle hooks out of the box.
 * 3. It easily manages a reusable, cached singleton connection for serverless Next.js API routes.
 */

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

export async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable in .env.local');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
