import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken'

declare global {
  var signin: (id?: string) => string[];
}

jest.mock('../nats-wrapper');

process.env.STRIPE_KEY = 'sk_test_51SvNgvRREArcDv6t9e7GBXG1ZzVZpmJQTn6nBy2P8sIqU6QnsKQ9s3pqJJBDUWQ3WPpgSBlBciN6bktGbeGQw3du00qR8GBRmw';

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'test_jwt_key';

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  // Build a JWT payload. { id, email }
  // eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJalk1TkRnMU5UazRaVFJqWVRobVpERXdaalZpWTJKbE5TSXNJbVZ0WVdsc0lqb2lkR1Z6ZEVCMFpYTjBMblJsSWl3aWFXRjBJam94TnpZMk16UTRNVGcwZlEubUk1aDlrSXBQTHMtUW1IcVZab3JnRDVFY09YM05HZnA5MWc5T01QU2tfWSJ9
  // {"jwt":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDg1NTk4ZTRjYThmZDEwZjViY2JlNSIsImVtYWlsIjoidGVzdEB0ZXN0LnRlIiwiaWF0IjoxNzY2MzQ4MTg0fQ.mI5h9kIpPLs-QmHqVZorgD5EcOX3NGfp91g9OMPSk_Y"}

  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.te'
  };

  const token = jwt.sign(payload, process.env.JWT_KEY!);

  const session = { jwt: token };

  const sessionJSON = JSON.stringify(session);

  const base64 = Buffer.from(sessionJSON).toString('base64');

  return [`session=${base64}`];
}
