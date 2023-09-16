const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://fse-dev:fse-sb5-123@emergencysocialnetworkd.sycllnj.mongodb.net/';
const client = new MongoClient(uri);
const dbName = 'esndb';

let db;

async function connectDB() {
  if (db) return db;

  try {
    await client.connect();
    db = client.db(dbName);
    return db;
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
  }

  return null;
}

async function getDB() {
  if (db) return db;
  return connectDB();
}

async function closeDB() {
  if (client.isConnected()) {
    await client.close();
  }
}

module.exports = {
  getDB,
  closeDB,
};
